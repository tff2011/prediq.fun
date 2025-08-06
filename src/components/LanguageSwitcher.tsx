'use client'

import { useRouter, usePathname } from '@/i18n/navigation'
import { languages } from '@/i18n/config'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const currentLanguage = languages[currentLocale as keyof typeof languages]

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'pt' ? 'en' : 'pt'
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={(e) => {
        e.stopPropagation()
        toggleLanguage()
      }}
      className="flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 focus-ring h-auto p-1"
    >
      <span className="text-lg">{currentLanguage.flag}</span>
    </Button>
  )
}