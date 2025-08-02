'use client'

import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { SearchBar } from "./SearchBar"
import { useTranslations } from "next-intl"
import { TrendingUp, Menu, X, ChevronDown, Info } from "lucide-react"
import { useState } from "react"
import { HowItWorksModal } from "./HowItWorksModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('navigation')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const handleLogin = () => {
    // TODO: Implementar lógica de login
    console.log('Login clicked')
  }
  
  const handleSignup = () => {
    // TODO: Implementar lógica de cadastro
    console.log('Signup clicked')
  }
  
  return (
    <header className="navbar-solid sticky top-0 z-[100] w-full bg-card border-b border-border shadow-sm">
      {/* Top Bar - Logo, Search, Auth */}
              <div className="bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0">
              <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline text-foreground">PredIQ<span className="text-primary">.fun</span></span>
              <span className="sm:hidden text-foreground">PredIQ</span>
            </Link>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-2xl mx-4">
              <SearchBar 
                variant="header"
                placeholder={t('search.placeholder')}
                className="w-full"
              />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <HowItWorksModal />
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80 cursor-pointer"
                onClick={handleLogin}
              >
                {t('login')}
              </Button>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md border-0 cursor-pointer"
                onClick={handleSignup}
              >
                {t('signup')}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2 shrink-0">
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar - Categories */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Left Navigation */}
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <Link 
                href={`/${locale}/trending`} 
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                <TrendingUp className="h-4 w-4" />
                {t('trending')}
              </Link>
              <Link 
                href={`/${locale}/new`} 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {t('new')}
              </Link>
            </div>

            {/* Center Categories */}
            <div className="hidden lg:flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <Link href={`/${locale}/category/politics`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.politics')}
              </Link>
              <Link href={`/${locale}/category/sports`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.sports')}
              </Link>
              <Link href={`/${locale}/category/crypto`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.crypto')}
              </Link>
              <Link href={`/${locale}/category/tech`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.technology')}
              </Link>
              <Link href={`/${locale}/category/culture`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.culture')}
              </Link>
              <Link href={`/${locale}/category/world`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.world')}
              </Link>
              <Link href={`/${locale}/category/economy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('categories.economics')}
              </Link>
            </div>

            {/* Right More Menu */}
            <div className="hidden lg:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                    {t('more')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-card border border-border shadow-lg z-50"
                  sideOffset={5}
                >
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/${locale}/create-market`} 
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {t('createMarket')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/${locale}/my-markets`} 
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {t('myMarkets')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/${locale}/leaderboard`} 
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {t('leaderboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/${locale}/about`} 
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {t('about')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              <Link 
                href={`/${locale}/trending`} 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('trending')}
              </Link>
              <Link 
                href={`/${locale}/new`} 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('new')}
              </Link>
              <div className="border-t border-border/20 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${locale}/category/politics`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.politics')}
                  </Link>
                  <Link href={`/${locale}/category/sports`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.sports')}
                  </Link>
                  <Link href={`/${locale}/category/crypto`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.crypto')}
                  </Link>
                  <Link href={`/${locale}/category/tech`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.technology')}
                  </Link>
                  <Link href={`/${locale}/category/culture`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.culture')}
                  </Link>
                  <Link href={`/${locale}/category/world`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.world')}
                  </Link>
                  <Link href={`/${locale}/category/economy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t('categories.economics')}
                  </Link>
                </div>
              </div>
              <div className="border-t border-border/20 pt-4 flex flex-col gap-2">
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <HowItWorksModal />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full cursor-pointer"
                  onClick={() => {
                    handleLogin()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {t('login')}
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md border-0 w-full cursor-pointer"
                  onClick={() => {
                    handleSignup()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {t('signup')}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
