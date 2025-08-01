'use client'

import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { SearchBar } from "./SearchBar"
import { useTranslations } from "next-intl"
import { TrendingUp, Menu, X, ChevronDown, Info } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('navigation')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <header className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top Bar - Logo, Search, Auth */}
      <div className="border-b border-border/50">
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
              <Link 
                href={`/${locale}/how-it-works`} 
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Info className="h-4 w-4" />
                {t('howItWorks')}
              </Link>
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                {t('login')}
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                className="p-2"
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
      <div className="border-b border-border/50">
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {t('more')}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background">
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
              <div className="border-t border-border/50 pt-4">
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
              <div className="border-t border-border/50 pt-4 flex flex-col gap-2">
                <Link 
                  href={`/${locale}/how-it-works`} 
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Info className="h-4 w-4" />
                  {t('howItWorks')}
                </Link>
                <Button variant="outline" size="sm" className="w-full">
                  {t('login')}
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
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