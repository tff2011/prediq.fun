import { createNavigation } from 'next-intl/navigation'
import { i18nConfig } from './config'

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: 'as-needed'
})