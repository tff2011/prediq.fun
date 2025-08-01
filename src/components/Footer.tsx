import Link from "next/link"
import { Github, Twitter, MessageCircle, Globe } from "lucide-react"
import { useTranslations } from "next-intl"

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')
  
  return (
    <footer className="border-t border-border py-12 mt-20 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-foreground">PredIQ.fun</h3>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
            <div className="flex space-x-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">{t('product')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/markets`} className="text-muted-foreground hover:text-primary transition-colors">{t('markets')}</Link></li>
              <li><Link href={`/${locale}/create`} className="text-muted-foreground hover:text-primary transition-colors">{t('createMarket')}</Link></li>
              <li><Link href={`/${locale}/how-it-works`} className="text-muted-foreground hover:text-primary transition-colors">{t('howItWorks')}</Link></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">{t('resources')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/docs`} className="text-muted-foreground hover:text-primary transition-colors">{t('documentation')}</Link></li>
              <li><Link href={`/${locale}/api`} className="text-muted-foreground hover:text-primary transition-colors">{t('api')}</Link></li>
              <li><Link href={`/${locale}/faq`} className="text-muted-foreground hover:text-primary transition-colors">{t('faq')}</Link></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">{t('legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-primary transition-colors">{t('terms')}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-primary transition-colors">{t('privacy')}</Link></li>
              <li><Link href={`/${locale}/cookies`} className="text-muted-foreground hover:text-primary transition-colors">{t('cookies')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PredIQ.fun. {t('allRights')}</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <Globe className="h-4 w-4" />
            <span>{t('builtWith')} 💜</span>
          </div>
        </div>
      </div>
    </footer>
  )
}