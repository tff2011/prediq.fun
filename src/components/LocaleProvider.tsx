'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ConditionalLayout } from '@/components/ConditionalLayout'

interface LocaleProviderProps {
  children: React.ReactNode
  locale: string
  messages: any
}

export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
      <ConditionalLayout locale={locale}>
        {children}
      </ConditionalLayout>
    </NextIntlClientProvider>
  )
}