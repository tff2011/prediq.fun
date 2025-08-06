'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ConditionalLayout } from '@/components/ConditionalLayout'
import { Web3AuthProvider } from '@/contexts/Web3AuthContext'

interface LocaleProviderProps {
  children: React.ReactNode
  locale: string
  messages: any
}

export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
      <Web3AuthProvider>
        <ConditionalLayout locale={locale}>
          {children}
        </ConditionalLayout>
      </Web3AuthProvider>
    </NextIntlClientProvider>
  )
}