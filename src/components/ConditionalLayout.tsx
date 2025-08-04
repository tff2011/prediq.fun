'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'

interface ConditionalLayoutProps {
  children: React.ReactNode
  locale: string
}

export function ConditionalLayout({ children, locale }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.includes('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale} />
      <main className="flex-1 pt-0 pb-16 md:pb-0">
        {children}
      </main>
      <Footer locale={locale} />
      <MobileBottomNav locale={locale} />
    </div>
  )
}