/**
 * Gera um slug SEO-friendly a partir de um título de mercado
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais exceto espaços e hífens
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
    .substring(0, 100) // Limita a 100 caracteres
}

/**
 * Extrai o ID do mercado de um slug
 */
export function extractMarketId(slug: string): string {
  // Usa o slug como base para o ID
  return slug.replace(/-/g, '').substring(0, 10)
}

/**
 * Gera uma URL completa para um evento
 */
export function generateEventUrl(title: string, locale = 'pt'): string {
  const slug = generateSlug(title)
  const basePath = locale === 'pt' ? '' : '/en'
  
  return `${basePath}/event/${slug}`
}