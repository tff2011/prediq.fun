'use client'

import Link from "next/link"
import { Mail, Twitter, Instagram, MessageSquare, Gamepad2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()
  const [isSticky, setIsSticky] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      // Get viewport height
      const viewportHeight = window.innerHeight
      // Check if scrolled past first viewport height
      setIsSticky(window.scrollY > viewportHeight)
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <footer className={cn(
      // Glass + color via CSS vars (novo padrão)
      "border-t border-[hsl(var(--border)/0.6)]",
      "supports-[backdrop-filter]:bg-[hsl(var(--card)/0.45)] bg-[hsl(var(--background)/0.85)]",
      "backdrop-blur-md text-xs text-[hsl(var(--muted-foreground))] transition-all ease-web3 duration-200",
      isSticky ? "fixed bottom-0 left-0 right-0 z-50 shadow-web3-1" : ""
    )}>
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="mailto:contact@prediq.fun" className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">
            <Mail className="h-4 w-4" />
          </a>
          <a href="https://twitter.com/prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="https://instagram.com/prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://discord.gg/prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">
            <MessageSquare className="h-4 w-4" />
          </a>
          <a href="https://tiktok.com/@prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">
            <Gamepad2 className="h-4 w-4" />
          </a>
        </div>
        <p className="text-[11px]">
          PrediQ.fun © {currentYear} · <Link href={`/${locale}/privacy`} className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">{t('privacy')}</Link> · <Link href={`/${locale}/terms`} className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">{t('terms')}</Link> · <Link href={`/${locale}/learn`} className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">{t('learn')}</Link> · <Link href={`/${locale}/careers`} className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">{t('careers')}</Link> · <a href="mailto:press@prediq.fun" className="hover:text-[hsl(var(--foreground))] cursor-pointer transition-colors duration-200">{t('press')}</a>
        </p>
      </div>
    </footer>
  )
}