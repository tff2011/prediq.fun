'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, TrendingUp, MoreHorizontal, Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

interface MobileBottomNavProps {
  locale: string
}

export function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const navItems = [
    {
      href: `/${locale === 'pt' ? '' : 'en'}`,
      icon: Home,
      label: t('mobile.home'),
      isActive: pathname === '/' || pathname === '/en'
    },
    {
      href: `/${locale === 'pt' ? '' : 'en'}`,
      icon: Search,
      label: t('mobile.search'),
      isActive: false
    },
    {
      href: `/${locale === 'pt' ? '' : 'en'}`,
      icon: TrendingUp,
      label: t('mobile.portfolio'),
      isActive: false
    },
    {
      href: `/${locale === 'pt' ? '' : 'en'}`,
      icon: Activity,
      label: t('mobile.activity'),
      isActive: false
    },
    {
      href: '#',
      icon: MoreHorizontal,
      label: t('mobile.more'),
      isActive: false,
      isMore: true
    }
  ]

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/30 shadow-2xl">
        <div className="flex items-center justify-around px-1 py-2 safe-area-inset-bottom">
          {navItems.map((item, index) => {
            const Icon = item.icon
            
            if (item.isMore) {
              return (
                <button
                  key={index}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                    showMoreMenu
                      ? 'text-primary bg-primary/15 scale-105'
                      : 'text-muted-foreground hover:text-foreground active:scale-95'
                  }`}
                >
                  <Icon className={`${showMoreMenu ? 'h-6 w-6' : 'h-5 w-5'} transition-all duration-200`} />
                  <span className={`text-xs font-medium truncate leading-tight ${
                    showMoreMenu ? 'text-primary font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  item.isActive
                    ? 'text-primary bg-primary/15 scale-105'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                }`}
              >
                <Icon className={`${item.isActive ? 'h-6 w-6' : 'h-5 w-5'} transition-all duration-200`} />
                <span className={`text-xs font-medium truncate leading-tight ${
                  item.isActive ? 'text-primary font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Settings Menu */}
      {showMoreMenu && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/30 shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('mobile.settings')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{t('mobile.language')}:</span>
                <LanguageSwitcher currentLocale={locale} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{t('mobile.theme')}:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}