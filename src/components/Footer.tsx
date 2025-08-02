'use client'

import Link from "next/link"
import { Mail, Twitter, Instagram, MessageSquare, Gamepad2 } from "lucide-react"
import { useEffect, useState } from "react"

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
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
    <footer className={`h-10 max-h-10 border-t border-border bg-background text-xs text-muted-foreground transition-all duration-300 ${
      isSticky ? 'fixed bottom-0 left-0 right-0 z-50 shadow-lg' : ''
    }`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="mailto:contact@prediq.fun" className="hover:text-foreground cursor-pointer transition-colors">
          <Mail className="h-4 w-4" />
        </a>
        <a href="https://twitter.com/prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-foreground cursor-pointer transition-colors">
          <Twitter className="h-4 w-4" />
        </a>
        <a href="https://instagram.com/prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-foreground cursor-pointer transition-colors">
          <Instagram className="h-4 w-4" />
        </a>
        <a href="https://discord.gg/prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-foreground cursor-pointer transition-colors">
          <MessageSquare className="h-4 w-4" />
        </a>
        <a href="https://tiktok.com/@prediqfun" target="_blank" rel="noopener noreferrer" className="hover:text-foreground cursor-pointer transition-colors">
          <Gamepad2 className="h-4 w-4" />
        </a>
        </div>
        <p className="text-xs">
          PrediQ.fun © {currentYear} · <Link href={`/${locale}/privacy`} className="hover:text-foreground cursor-pointer">Privacy</Link> · <Link href={`/${locale}/terms`} className="hover:text-foreground cursor-pointer">Terms of Use</Link> · <Link href={`/${locale}/learn`} className="hover:text-foreground cursor-pointer">Learn</Link> · <Link href={`/${locale}/careers`} className="hover:text-foreground cursor-pointer">Careers</Link> · <Link href={`/${locale}/press`} className="hover:text-foreground cursor-pointer">Press</Link>
        </p>
      </div>
    </footer>
  )
}