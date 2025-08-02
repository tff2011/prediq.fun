import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('terms')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl bg-background text-foreground">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.introduction.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.introduction.paragraph1')}
          </p>
          <p className="mb-4 text-foreground">
            {t('sections.introduction.paragraph2')}
          </p>
          <div className="bg-muted border border-border rounded-lg p-4 mb-4">
            <p className="font-semibold text-foreground">
              {t('sections.introduction.importantNotice.title')} {t('sections.introduction.importantNotice.content')}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.platform.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.platform.paragraph1')}
          </p>
          <p className="mb-4 text-foreground">
            {t('sections.platform.paragraph2')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.eligibility.title')}</h2>
          
          <h3 className="text-xl font-medium mb-3 text-foreground">{t('sections.eligibility.ageSection.title')}</h3>
          <p className="mb-4 text-foreground">
            {t('sections.eligibility.ageSection.content')}
          </p>

          <h3 className="text-xl font-medium mb-3 text-foreground">{t('sections.eligibility.restrictedJurisdictions.title')}</h3>
          <div className="bg-muted border border-border rounded-lg p-4 mb-4">
            <p className="font-semibold text-foreground mb-2">
              {t('sections.eligibility.restrictedJurisdictions.warningTitle')} {t('sections.eligibility.restrictedJurisdictions.warningText')}
            </p>
            <ul className="list-disc pl-6 text-foreground">
              {t.raw('sections.eligibility.restrictedJurisdictions.countries').map((country: string, index: number) => (
                <li key={index}>{country}</li>
              ))}
            </ul>
            <p className="mt-2 text-foreground">
              {t('sections.eligibility.restrictedJurisdictions.vpnWarning')}
            </p>
          </div>

          <h3 className="text-xl font-medium mb-3 text-foreground">{t('sections.eligibility.userRepresentations.title')}</h3>
          <p className="mb-4 text-foreground">{t('sections.eligibility.userRepresentations.intro')}</p>
          <ul className="list-disc pl-6 mb-4 text-foreground">
            {t.raw('sections.eligibility.userRepresentations.items').map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.risks.title')}</h2>
          <div className="bg-muted border border-border rounded-lg p-4 mb-4">
            <p className="font-semibold text-foreground mb-2">{t('sections.risks.riskWarning.title')}</p>
            <ul className="list-disc pl-6 text-foreground">
              {t.raw('sections.risks.riskWarning.items').map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="mb-4 text-foreground">
            {t('sections.risks.acknowledgment')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.conduct.title')}</h2>
          <p className="mb-4 text-foreground">{t('sections.conduct.intro')}</p>
          <ul className="list-disc pl-6 mb-4 text-foreground">
            {t.raw('sections.conduct.items').map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.intellectualProperty.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.intellectualProperty.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.privacy.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.privacy.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.disclaimers.title')}</h2>
          <div className="bg-muted border border-border rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2 text-foreground">{t('sections.disclaimers.asIsWarning')}</p>
            <p className="mb-4 text-foreground">
              {t('sections.disclaimers.warrantyDisclaimer')}
            </p>
            <p className="font-semibold mb-2 text-foreground">{t('sections.disclaimers.limitationTitle')}</p>
            <p className="text-foreground">
              {t('sections.disclaimers.limitationContent')}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.indemnification.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.indemnification.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.governingLaw.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.governingLaw.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.changes.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.changes.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('sections.contact.title')}</h2>
          <p className="mb-4 text-foreground">
            {t('sections.contact.content')} <br />
            <a href={`mailto:${t('sections.contact.email')}`} className="text-primary hover:underline">{t('sections.contact.email')}</a>
          </p>
        </section>

        <div className="border-t border-border pt-8 mt-8">
          <p className="text-sm text-muted-foreground text-center">
            {t('footer.acknowledgment')}
          </p>
        </div>
      </div>
    </div>
  )
}