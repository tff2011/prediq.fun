import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface PrivacyPageProps {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params
  const currentDate = new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
  
  return <PrivacyPageContent locale={locale} currentDate={currentDate} />
}

function PrivacyPageContent({ locale, currentDate }: { locale: string; currentDate: string }) {
  const t = useTranslations('privacy')
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">{t('lastUpdated')}: {currentDate}</p>
      
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.introduction.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.introduction.paragraph1')}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.introduction.paragraph2')}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.introduction.paragraph3')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.informationWeCollect.title')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t('sections.informationWeCollect.paragraph1')}
          </p>
          <p className="text-muted-foreground leading-relaxed mb-2">{t('sections.informationWeCollect.paragraph2')}</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>{t('sections.informationWeCollect.list.item1')}</li>
            <li>{t('sections.informationWeCollect.list.item2')}</li>
            <li>{t('sections.informationWeCollect.list.item3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.personalInformation.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.personalInformation.paragraph')}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>{t('sections.personalInformation.list.personal').split(':')[0]}:</strong> {t('sections.personalInformation.list.personal').split(':')[1]}</li>
            <li><strong>{t('sections.personalInformation.list.derivative').split(':')[0]}:</strong> {t('sections.personalInformation.list.derivative').split(':')[1]}</li>
            <li><strong>{t('sections.personalInformation.list.mobile').split(':')[0]}:</strong> {t('sections.personalInformation.list.mobile').split(':')[1]}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.minors.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.minors.paragraph')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.cookies.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.cookies.paragraph1')}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.cookies.paragraph2')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.howWeUse.title')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            {t('sections.howWeUse.paragraph')}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>{t('sections.howWeUse.list.item1')}</li>
            <li>{t('sections.howWeUse.list.item2')}</li>
            <li>{t('sections.howWeUse.list.item3')}</li>
            <li>{t('sections.howWeUse.list.item4')}</li>
            <li>{t('sections.howWeUse.list.item5')}</li>
            <li>{t('sections.howWeUse.list.item6')}</li>
            <li>{t('sections.howWeUse.list.item7')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.sharingInformation.title')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            {t('sections.sharingInformation.paragraph')}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>{t('sections.sharingInformation.list.item1')}</li>
            <li>{t('sections.sharingInformation.list.item2')}</li>
            <li>{t('sections.sharingInformation.list.item3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.security.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.security.paragraph')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.yourRights.title')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            {t('sections.yourRights.paragraph')}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>{t('sections.yourRights.list.access').split(':')[0]}:</strong> {t('sections.yourRights.list.access').split(':')[1]}</li>
            <li><strong>{t('sections.yourRights.list.correction').split(':')[0]}:</strong> {t('sections.yourRights.list.correction').split(':')[1]}</li>
            <li><strong>{t('sections.yourRights.list.deletion').split(':')[0]}:</strong> {t('sections.yourRights.list.deletion').split(':')[1]}</li>
            <li><strong>{t('sections.yourRights.list.portability').split(':')[0]}:</strong> {t('sections.yourRights.list.portability').split(':')[1]}</li>
            <li><strong>{t('sections.yourRights.list.withdraw').split(':')[0]}:</strong> {t('sections.yourRights.list.withdraw').split(':')[1]}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.changes.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.changes.paragraph')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('sections.contact.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('sections.contact.paragraph')}{' '}
            <a href={`mailto:${t('sections.contact.email')}`} className="text-primary hover:underline cursor-pointer">
              {t('sections.contact.email')}
            </a>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href={`/${locale}`} className="text-primary hover:underline cursor-pointer">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}