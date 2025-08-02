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
    'privacy'
  ]

  const messages: Record<string, any> = {}

  for (const file of messageFiles) {
    try {
      const module = await import(`../messages/${locale}/${file}.json`)
      const fileMessages = module.default || module
      
      // Mesclar as mensagens do arquivo no objeto principal
      Object.assign(messages, fileMessages)
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
    messages
  }
})