import { i18nConfig } from '@/i18n/config'
import '@/styles/globals.css'
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <Navbar locale={locale} />
            <main className="flex-1">
              {children}
            </main>
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}