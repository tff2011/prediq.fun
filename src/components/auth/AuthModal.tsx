'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { 
  Wallet, 
  Chrome, 
  Mail, 
  Loader2,
  Sparkles,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, mode = 'signup' }: AuthModalProps) {
  const t = useTranslations('auth.modal')
  const [email, setEmail] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const { login, connectWallet, isLoading, isInitialized } = useWeb3Auth()

  const handleGoogleLogin = async () => {
    setSelectedProvider('google')
    try {
      await login('polygon') // Default to Polygon for Google login
      onClose()
    } catch (error) {
      console.error('Google login error:', error)
    } finally {
      setSelectedProvider(null)
    }
  }

  const handleWalletConnect = async (provider: 'metamask' | 'phantom' | 'walletconnect') => {
    setSelectedProvider(provider)
    try {
      // Phantom is for Solana, others for Polygon
      const chain = provider === 'phantom' ? 'solana' : 'polygon'
      await connectWallet(provider, chain)
      onClose()
    } catch (error) {
      console.error(`${provider} connection error:`, error)
    } finally {
      setSelectedProvider(null)
    }
  }

  const handleEmailContinue = async () => {
    if (!email || !email.includes('@')) {
      toast.error(t('providers.email.invalid'))
      return
    }
    
    setSelectedProvider('email')
    try {
      // Web3Auth supports email login through social login
      await login('polygon')
      onClose()
    } catch (error) {
      console.error('Email login error:', error)
    } finally {
      setSelectedProvider(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border border-border shadow-lg z-50 backdrop-blur-sm">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(198_93%_60%)] p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-center">
              {mode === 'login' ? t('login.title') : t('signup.title')}
            </DialogTitle>
          </DialogHeader>
          
          {/* Decorative elements */}
          <div className="absolute top-2 right-2 opacity-20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute bottom-2 left-2 opacity-20">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Benefits list */}
          {mode === 'signup' && (
            <div className="mb-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4 text-[hsl(var(--yes))]" />
                <span>{t('signup.benefits.create')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span>{t('signup.benefits.secure')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-[hsl(var(--no))]" />
                <span>{t('signup.benefits.rewards')}</span>
              </div>
            </div>
          )}

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white dark:bg-zinc-800 text-foreground border border-border hover:bg-muted transition-all duration-200"
          >
            {isLoading && selectedProvider === 'google' ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
{t('providers.google')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('providers.or')}</span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('providers.email.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleEmailContinue}
                disabled={isLoading || !email}
                variant="default"
                className="min-w-[100px]"
              >
                {isLoading && !selectedProvider ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t('providers.email.continue')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Wallet options */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <button
              onClick={() => handleWalletConnect('metamask')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && selectedProvider === 'metamask' ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Image
                  src="/metamask.svg"
                  alt="MetaMask"
                  width={32}
                  height={32}
                  className="mb-2"
                />
              )}
              <span className="text-xs">{t('providers.wallets.metamask')}</span>
            </button>

            <button
              onClick={() => handleWalletConnect('phantom')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && selectedProvider === 'phantom' ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <div className="w-8 h-8 mb-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
              )}
              <span className="text-xs">{t('providers.wallets.phantom')}</span>
            </button>

            <button
              onClick={() => handleWalletConnect('walletconnect')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && selectedProvider === 'walletconnect' ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <div className="w-8 h-8 mb-2 rounded-full bg-blue-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-xs">{t('providers.wallets.walletconnect')}</span>
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              {t('terms.text')}{' '}
              <a href="/terms" className="text-primary hover:underline">
                {t('terms.terms')}
              </a>{' '}
              {t('terms.and')}{' '}
              <a href="/privacy" className="text-primary hover:underline">
                {t('terms.privacy')}
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}