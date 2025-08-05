'use client'

import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { SearchBar } from "./SearchBar"
import { useTranslations } from "next-intl"
import { TrendingUp, ChevronDown, Menu, X } from "lucide-react"
import { useMemo, useState } from "react"
import { HowItWorksModal } from "./HowItWorksModal"
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
  const pathname = usePathname()

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
    // TODO: Implementar lógica de login
    console.log('Login clicked')
  }
  
  const handleSignup = () => {
    // TODO: Implementar lógica de cadastro
    console.log('Signup clicked')
  }
  
  return (
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

            {/* Search Bar + Como Funciona */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-3xl ml-3">
              <SearchBar
                variant="minimal"
                placeholder={t('search.placeholder')}
                className="flex-1 max-w-2xl frosted"
              />
              <HowItWorksModal />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
              <Button
                variant="ghostTransparent"
                size="sm"
                className="cursor-pointer focus-ring"
                onClick={handleLogin}
              >
                {t('login')}
              </Button>
              <Button
                size="sm"
                variant="primaryGradient"
                className="font-semibold cursor-pointer"
                onClick={handleSignup}
              >
                {t('signup')}
              </Button>
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
                  className="w-48 bg-card border border-border shadow-lg z-50 backdrop-blur-sm frosted"
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

      {/* Desktop Settings Menu */}
      {isMobileMenuOpen && (
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
  )
}
