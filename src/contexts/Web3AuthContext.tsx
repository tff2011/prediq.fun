'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { web3AuthService } from '@/lib/web3auth'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'

interface Web3AuthUser {
  id?: string
  email?: string
  name?: string
  profileImage?: string
  address?: string
  balance?: string
  chain?: 'polygon' | 'solana'
  dbBalance?: number
  totalInvested?: number
  totalWinnings?: number
  createdAt?: Date
}

interface Web3AuthContextType {
  user: Web3AuthUser | null
  isLoading: boolean
  isInitialized: boolean
  isConnected: boolean
  login: (chain?: 'polygon' | 'solana') => Promise<void>
  connectWallet: (walletType: 'metamask' | 'phantom' | 'walletconnect', chain?: 'polygon' | 'solana') => Promise<void>
  logout: () => Promise<void>
  signMessage: (message: string) => Promise<string | null>
  switchChain: (chain: 'polygon' | 'solana') => Promise<void>
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('auth.modal.messages')
  const [user, setUser] = useState<Web3AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // tRPC mutations
  const createOrUpdateUser = api.user.createOrUpdateWeb3User.useMutation()

  // Initialize Web3Auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Default to Polygon
        await web3AuthService.initPolygon()
        setIsInitialized(true)
        
        // Check if already connected (skip balance to avoid RPC calls)
        const connected = web3AuthService.isConnected()
        
        if (connected) {
          await fetchUserInfo(true)
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error)
      }
    }

    init()
  }, [])


  const fetchUserInfo = async (skipBalance = false) => {
    try {
      const userInfo = await web3AuthService.getUserInfo()
      const accounts = await web3AuthService.getAccounts()
      
      // Only fetch balance if specifically requested (to avoid RPC rate limits)
      let balance = '0.0'
      if (!skipBalance) {
        try {
          balance = await web3AuthService.getBalance()
        } catch (balanceError) {
          console.warn('Failed to fetch balance (RPC rate limit):', balanceError)
          // Continue without balance - user can still be authenticated
        }
      }

      // Create or update user in database
      let dbUser = null
      if (userInfo.email && accounts[0]) {
        try {
          dbUser = await createOrUpdateUser.mutateAsync({
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.profileImage,
            walletAddress: accounts[0],
            walletChain: web3AuthService.getCurrentChain(),
            web3Provider: 'web3auth'
          })
        } catch (dbError) {
          console.error('❌ Failed to create/update user in database:', dbError)
        }
      }
      
      const newUser = {
        id: dbUser?.id,
        email: userInfo.email,
        name: userInfo.name,
        profileImage: userInfo.profileImage,
        address: accounts[0],
        balance: balance,
        chain: web3AuthService.getCurrentChain(),
        dbBalance: dbUser?.balance || 0,
        totalInvested: dbUser?.totalInvested || 0,
        totalWinnings: dbUser?.totalWinnings || 0,
        createdAt: dbUser?.createdAt,
      }
      
      setUser(newUser)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const login = useCallback(async (chain: 'polygon' | 'solana' = 'polygon') => {
    if (!isInitialized) {
      toast.error(t('initializing'))
      return
    }

    setIsLoading(true)
    try {
      const provider = await web3AuthService.connect(chain)
      
      // Verify provider was properly initialized
      if (!provider || !web3AuthService.isConnected()) {
        throw new Error('Failed to initialize provider')
      }
      
      await fetchUserInfo(true) // Skip balance initially to avoid RPC rate limits
      toast.success(t('success'))
    } catch (error: any) {
      if (error?.message?.includes('User closed modal') || error?.message?.includes('user rejected')) {
        toast.info(t('cancelled'))
      } else {
        toast.error(t('error'))
        console.error('Login error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized, t])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await web3AuthService.logout()
      setUser(null)
      toast.success(t('logoutSuccess'))
    } catch (error) {
      toast.error(t('logoutError'))
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [t])

  const signMessage = useCallback(async (message: string) => {
    if (!web3AuthService.isConnected()) {
      toast.error(t('signFirst'))
      return null
    }

    try {
      const signature = await web3AuthService.signMessage(message)
      return signature
    } catch (error) {
      toast.error(t('signError'))
      console.error('Sign message error:', error)
      return null
    }
  }, [t])

  const connectWallet = useCallback(async (walletType: 'metamask' | 'phantom' | 'walletconnect', chain: 'polygon' | 'solana' = 'polygon') => {
    if (!isInitialized) {
      toast.error(t('initializing'))
      return
    }

    setIsLoading(true)
    try {
      await web3AuthService.connectWallet(walletType, chain)
      await fetchUserInfo()
      toast.success(`${t('connected')} ${walletType}!`)
    } catch (error: any) {
      if (error?.message?.includes('not detected')) {
        toast.error(`${walletType} ${t('walletNotFound')}`)
      } else if (error?.message?.includes('User rejected')) {
        toast.info(t('walletCancelled'))
      } else {
        toast.error(`${t('walletError')} ${walletType}`)
        console.error('Wallet connection error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized, t])

  const switchChain = useCallback(async (chain: 'polygon' | 'solana') => {
    if (!web3AuthService.isConnected()) {
      toast.error(t('signFirst'))
      return
    }

    setIsLoading(true)
    try {
      await web3AuthService.logout()
      await web3AuthService.connect(chain)
      await fetchUserInfo()
      toast.success(`${t('switchChain')} ${chain === 'polygon' ? 'Polygon' : 'Solana'}`)
    } catch (error) {
      toast.error(t('switchError'))
      console.error('Switch chain error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [t])

  return (
    <Web3AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        isConnected: web3AuthService.isConnected(),
        login,
        connectWallet,
        logout,
        signMessage,
        switchChain,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  )
}

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext)
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider')
  }
  return context
}