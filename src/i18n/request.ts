import { getRequestConfig } from 'next-intl/server'
import { i18nConfig } from './config'

// Função para carregar e mesclar todos os JSONs de um idioma
async function loadMessages(locale: string) {
  const messageFiles = [
    'common',
    'navigation', 
    'home',
    'markets',
    'auth',
    'createMarket',
    'footer',
    'profile',
    'howItWorks',
    'terms',
    'privacy',
    'trending',
    'new',
    'settings',
    'rewards',
    'leaderboard',
    'activity'
  ]

  const messages: Record<string, unknown> = {}

  for (const file of messageFiles) {
    try {
      const moduleImport = await import(`../messages/${locale}/${file}.json`) as { default?: Record<string, unknown> }
      const fileMessages = moduleImport.default ?? moduleImport
      
      // Mesclar as mensagens do arquivo no objeto principal
      Object.assign(messages, fileMessages as Record<string, unknown>)
    } catch (error) {
      console.warn(`Failed to load messages for ${locale}/${file}.json:`, error)
    }
  }

  return messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Ensure that the incoming locale is valid
  if (!locale || !i18nConfig.locales.includes(locale)) {
    locale = i18nConfig.defaultLocale
  }

  const messages = await loadMessages(locale)
  
  return {
    locale,
    messages,
    timeZone: 'America/Sao_Paulo'
  }
})