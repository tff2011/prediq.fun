'use client'

import { useState, useEffect, useCallback } from 'react'
import { web3AuthService } from '@/lib/web3auth'
import { toast } from 'sonner'

interface Web3AuthUser {
  email?: string
  name?: string
  profileImage?: string
  address?: string
  balance?: string
  chain?: 'polygon' | 'solana'
}

export function useWeb3Auth() {
  const [user, setUser] = useState<Web3AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Web3Auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Default to Polygon
        await web3AuthService.initPolygon()
        setIsInitialized(true)
        
        // Check if already connected
        if (web3AuthService.isConnected()) {
          await fetchUserInfo()
        }
      } catch (error) {
        console.error('Failed to initialize Web3Auth:', error)
      }
    }

    init()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const userInfo = await web3AuthService.getUserInfo()
      const accounts = await web3AuthService.getAccounts()
      const balance = await web3AuthService.getBalance()
      
      setUser({
        email: userInfo.email,
        name: userInfo.name,
        profileImage: userInfo.profileImage,
        address: accounts[0],
        balance: balance,
        chain: web3AuthService.getCurrentChain(),
      })
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const login = useCallback(async (chain: 'polygon' | 'solana' = 'polygon') => {
    if (!isInitialized) {
      toast.error('Web3Auth ainda está inicializando...')
      return
    }

    setIsLoading(true)
    try {
      await web3AuthService.connect(chain)
      await fetchUserInfo()
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      if (error?.message?.includes('User closed modal') || error?.message?.includes('user rejected')) {
        toast.info('Login cancelado')
      } else {
        toast.error('Erro ao fazer login')
        console.error('Login error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await web3AuthService.logout()
      setUser(null)
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer logout')
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signMessage = useCallback(async (message: string) => {
    if (!web3AuthService.isConnected()) {
      toast.error('Por favor, faça login primeiro')
      return null
    }

    try {
      const signature = await web3AuthService.signMessage(message)
      return signature
    } catch (error) {
      toast.error('Erro ao assinar mensagem')
      console.error('Sign message error:', error)
      return null
    }
  }, [])

  const connectWallet = useCallback(async (walletType: 'metamask' | 'phantom' | 'walletconnect', chain: 'polygon' | 'solana' = 'polygon') => {
    if (!isInitialized) {
      toast.error('Web3Auth ainda está inicializando...')
      return
    }

    setIsLoading(true)
    try {
      await web3AuthService.connectWallet(walletType, chain)
      await fetchUserInfo()
      toast.success(`Conectado com ${walletType}!`)
    } catch (error: any) {
      if (error?.message?.includes('not detected')) {
        toast.error(`${walletType} não foi encontrado. Por favor, instale a extensão.`)
      } else if (error?.message?.includes('User rejected')) {
        toast.info('Conexão cancelada pelo usuário')
      } else {
        toast.error(`Erro ao conectar com ${walletType}`)
        console.error('Wallet connection error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const switchChain = useCallback(async (chain: 'polygon' | 'solana') => {
    if (!web3AuthService.isConnected()) {
      toast.error('Por favor, faça login primeiro')
      return
    }

    setIsLoading(true)
    try {
      await web3AuthService.logout()
      await web3AuthService.connect(chain)
      await fetchUserInfo()
      toast.success(`Mudado para ${chain === 'polygon' ? 'Polygon' : 'Solana'}`)
    } catch (error) {
      toast.error('Erro ao mudar de rede')
      console.error('Switch chain error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isLoading,
    isInitialized,
    isConnected: web3AuthService.isConnected(),
    login,
    connectWallet,
    logout,
    signMessage,
    switchChain,
  }
}