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
 * Garante unicidade do slug tentando com sufixos -2, -3, etc
 * Recebe um checador assíncrono (exists) para verificar existência.
 */
export async function ensureUniqueSlug(
  baseTitle: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = generateSlug(baseTitle) || 'mercado'
  let candidate = base
  let counter = 2
  while (await exists(candidate)) {
    candidate = `${base}-${counter}`
    counter++
  }
  return candidate
}

/**
 * Mantido por compatibilidade: utilidades antigas não são mais usadas para rotas
 */
export function extractMarketId(slug: string): string {
  return slug.replace(/-/g, '').substring(0, 10)
}

/**
 * Mantido por compatibilidade: URLs antigas de evento não são usadas para Market
 */
export function generateEventUrl(title: string, locale = 'pt'): string {
  const slug = generateSlug(title)
  const basePath = locale === 'pt' ? '' : '/en'
  return `${basePath}/event/${slug}`
}