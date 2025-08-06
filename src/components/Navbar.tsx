'use client'

import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { SearchBar } from "./SearchBar"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { TrendingUp, ChevronDown, Menu, X, User, Activity, Trophy, BarChart3, Gift, Bell, ExternalLink, Settings, Eye, FileText, Tag, Moon, Sun, LogOut, Globe } from "lucide-react"
import { useMemo, useState } from "react"
import { HowItWorksModal } from "./HowItWorksModal"
import { AuthModal } from "./auth/AuthModal"
import { useWeb3Auth } from "@/contexts/Web3AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('navigation')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const pathname = usePathname()
  const { user, logout, isLoading: authLoading } = useWeb3Auth()
  const { theme, setTheme } = useTheme()
  

  // Helper to determine if a given category is active based on the current pathname
  const activeCategory = useMemo(() => {
    // Handle both /category/slug and /locale/category/slug patterns
    const match = pathname?.match(/^(?:\/[^/]+)?\/category\/([^/?#]+)/i)
    const detected = match?.[1]?.toLowerCase() ?? null
    
    // Handle URL aliases to navbar category mappings
    const aliasMap: Record<string, string> = {
      'economy': 'economics',
      'tech': 'technology',
      'culture': 'entertainment',
      'world': 'other'
    }
    
    const finalCategory = aliasMap[detected || ''] || detected
    return finalCategory
  }, [pathname])

  const getCategoryClasses = (slug: string) => {
    const isActive = activeCategory === slug
    
    const classes = cn(
      // Base styling
      "relative px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer",
      "navbar-category", // This applies the LVHA styles from CSS
      // Underline effect
      "after:pointer-events-none after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-primary after:transition-all after:duration-200",
      // Active state class
      isActive ? "active" : "",
      // Underline states
      isActive 
        ? "after:opacity-100 after:scale-x-100" 
        : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
    )
    
    return classes
  }

  const handleLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }
  
  const handleSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }
  
  return (
    <>
    <header className={cn(
      "sticky top-0 z-[100] w-full supports-[backdrop-filter]:bg-[hsl(var(--card)/0.6)] bg-background/90",
      "backdrop-blur-md border-b border-[hsl(var(--border)/0.6)]"
    )}>
      {/* Top Bar - Logo, Search, Auth */}
      <div className="supports-[backdrop-filter]:bg-transparent bg-background/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0 hover:opacity-90 transition-opacity ease-web3 duration-200">
              <div className="h-6 w-6 rounded-sm flex items-center justify-center glow gradient-border">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline text-foreground">PredIQ<span className="text-primary">.fun</span></span>
              <span className="sm:hidden text-foreground">PredIQ</span>
            </Link>

            {/* Search Bar - Always show */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-3xl ml-3">
              <SearchBar
                variant="minimal"
                placeholder={t('search.placeholder')}
                className="flex-1 max-w-2xl frosted"
              />
              {!user && <HowItWorksModal />}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
              {user ? (
                <>
                  {/* Portfolio */}
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-muted-foreground">{t('logged.portfolio')}</span>
                    <span className="text-sm font-semibold text-green-600">
                      ${((user.totalInvested || 0) + (user.totalWinnings || 0)).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Cash */}
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-muted-foreground">{t('logged.cash')}</span>
                    <span className="text-sm font-semibold">
                      ${(user.dbBalance || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Deposit Button */}
                  <Button
                    size="sm"
                    variant="primaryGradient"
                    className="font-semibold cursor-pointer px-6"
                  >
                    {t('logged.deposit')}
                  </Button>
                  
                  {/* Notification Bell */}
                  <Button
                    variant="ghostTransparent"
                    size="sm"
                    className="p-2 cursor-pointer relative"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  
                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghostTransparent" size="sm" className="flex items-center gap-2 px-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {user.name?.charAt(0) || user.address?.slice(2, 4).toUpperCase() || 'U'}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-card border border-border shadow-lg z-[200] backdrop-blur-sm"
                      sideOffset={5}
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 border-b border-border">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-medium">
                          {user.name?.charAt(0) || user.address?.slice(2, 4).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {user.name || `${user.address?.slice(0, 6)}...${user.address?.slice(-4)}`}
                          </span>
                          {user.address && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto cursor-pointer"
                                onClick={() => {
                                  const explorerUrl = user.chain === 'solana' 
                                    ? `https://explorer.solana.com/address/${user.address}?cluster=devnet`
                                    : `https://amoy.polygonscan.com/address/${user.address}`
                                  window.open(explorerUrl, '_blank')
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/profile`} className="cursor-pointer w-full">
                          <User className="h-4 w-4 mr-2" />
                          {t('logged.menu.profile')}
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/settings`} className="cursor-pointer w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          {t('logged.menu.settings')}
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        {t('logged.menu.watchlist')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/rewards`} className="cursor-pointer w-full">
                          <Gift className="h-4 w-4 mr-2" />
                          {t('logged.menu.rewards')}
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" />
                        {t('logged.menu.documentation')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="cursor-pointer">
                        <Tag className="h-4 w-4 mr-2" />
                        {t('logged.menu.claimPromo')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/terms`} className="cursor-pointer w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          {t('logged.menu.termsOfUse')}
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      >
                        {theme === 'dark' ? (
                          <Sun className="h-4 w-4 mr-2" />
                        ) : (
                          <Moon className="h-4 w-4 mr-2" />
                        )}
                        {theme === 'dark' ? t('logged.menu.lightMode') : t('logged.menu.darkMode')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Idioma / Language</span>
                        </div>
                        <LanguageSwitcher currentLocale={locale} />
                      </DropdownMenuItem>
                      
                      <div className="border-t border-border my-1" />
                      
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('logged.menu.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghostTransparent"
                    size="sm"
                    className="cursor-pointer focus-ring"
                    onClick={handleLogin}
                    disabled={authLoading}
                  >
                    {t('login')}
                  </Button>
                  <Button
                    size="sm"
                    variant="primaryGradient"
                    className="font-semibold cursor-pointer"
                    onClick={handleSignup}
                    disabled={authLoading}
                  >
                    {t('signup')}
                  </Button>
                  
                  {/* Hamburger Menu - Only show when not logged in */}
                  <Button
                    variant="ghostTransparent"
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
                </>
              )}
            </div>

            {/* Mobile Actions - Only Login/Signup */}
            <div className="md:hidden flex items-center gap-2 shrink-0 ml-auto">
              <Button
                variant="ghostTransparent"
                size="sm"
                className="text-sm"
                onClick={handleLogin}
              >
                {t('login')}
              </Button>
              <Button
                size="sm"
                variant="primaryGradient"
                className="text-sm px-3"
                onClick={handleSignup}
              >
                {t('signup')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar - Categories */}
      <div className="border-b border-[hsl(var(--border)/0.6)] supports-[backdrop-filter]:bg-[hsl(var(--card)/0.45)] bg-muted/50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Left Navigation */}
            <div className="flex items-center gap-6">
              <Link
                href={`/${locale}/trending`}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
              >
                <TrendingUp className="h-4 w-4" />
                {t('trending')}
              </Link>
              <Link
                href={`/${locale}/new`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('new')}
              </Link>
            </div>

            {/* Center Categories */}
            <div className="hidden lg:flex items-center gap-3">
              {[
                { slug: 'politics', key: 'categories.politics' },
                { slug: 'sports', key: 'categories.sports' },
                { slug: 'crypto', key: 'categories.crypto' },
                { slug: 'technology', key: 'categories.technology' },
                { slug: 'entertainment', key: 'categories.entertainment' },
                { slug: 'science', key: 'categories.science' },
                { slug: 'economics', key: 'categories.economics' }
              ].map(({ slug, key }) => (
                <Link 
                  key={slug}
                  href={`/${locale}/category/${slug}`} 
                  className={getCategoryClasses(slug)}
                >
                  {t(key as any)}
                </Link>
              ))}
            </div>

            {/* Right More Menu */}
            <div className="hidden lg:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghostTransparent" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer">
                    {t('more')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card border border-border shadow-lg z-[200] backdrop-blur-sm frosted"
                  sideOffset={5}
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/activity`}
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                    >
                      <Activity className="h-4 w-4" />
                      {t('activity')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/leaderboard`}
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      {t('leaderboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/dashboards`}
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      {t('dashboards')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/rewards`}
                      className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                    >
                      <Gift className="h-4 w-4" />
                      {t('rewards')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Settings Menu - Only show when not logged in */}
      {isMobileMenuOpen && !user && (
        <div className="hidden md:block border-t border-[hsl(var(--border)/0.6)] supports-[backdrop-filter]:bg-[hsl(var(--card)/0.6)] bg-background/80 shadow-web3-1 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Idioma:</span>
                <LanguageSwitcher currentLocale={locale} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Tema:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}

    </header>

    {/* Auth Modal */}
    <AuthModal 
      isOpen={authModalOpen} 
      onClose={() => setAuthModalOpen(false)} 
      mode={authMode}
    />
    </>
  )
}
