'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Wallet, LogOut, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LoginWeb3Auth() {
  const t = useTranslations('auth')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAddress, setUserAddress] = useState<string>('')

  // Mock login function - replace with actual Web3Auth integration
  const login = async () => {
    setIsLoading(true)
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock user address
      const mockAddress = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
      setUserAddress(mockAddress)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setUserAddress('')
      setIsLoggedIn(false)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline-block">{userAddress}</span>
            <span className="sm:hidden">Wallet</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Wallet className="mr-2 h-4 w-4" />
            <span className="font-mono text-xs">{userAddress}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Portfolio
          </DropdownMenuItem>
          <DropdownMenuItem>
            Histórico
          </DropdownMenuItem>
          <DropdownMenuItem>
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button 
      onClick={login} 
      disabled={isLoading}
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline-block">Conectar Wallet</span>
          <span className="sm:hidden">Wallet</span>
        </>
      )}
    </Button>
  )
}