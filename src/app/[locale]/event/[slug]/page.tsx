import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MarketDetail } from '@/components/MarketDetail'
import { extractMarketId } from '@/lib/slug'

interface EventPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

// Mock data - substituir por chamada real da API
const getMarketBySlug = async (slug: string) => {
  // Simula busca no banco de dados
  const marketId = extractMarketId(slug)
  
  // Mock market data - substituir por dados reais
  const markets = [
    {
      id: '1',
      slug: 'lula-sera-reeleito-em-2026',
      title: 'Lula será reeleito em 2026?',
      description: 'Mercado de predição sobre a reeleição do presidente Lula em 2026.',
      category: 'Política',
      volume: 'R$ 124.850',
      traders: 888,
      endsAt: '2026-10-01T00:00:00Z',
      oddsYes: 28,
      oddsNo: 72,
      totalBets: 1247,
      liquidity: 'R$ 45.230',
      status: 'active' as const
    },
    {
      id: '2', 
      slug: 'bitcoin-ultrapassa-r-500k-ate-dez-2025',
      title: 'Bitcoin ultrapassa R$500k até Dez/2025?',
      description: 'Mercado prevendo se o Bitcoin atingirá R$500.000 até dezembro de 2025.',
      category: 'Cripto',
      volume: 'R$ 342.700',
      traders: 442,
      endsAt: '2025-12-30T00:00:00Z',
      oddsYes: 62,
      oddsNo: 38,
      totalBets: 823,
      liquidity: 'R$ 89.150',
      status: 'active' as const
    }
  ]

  return markets.find(m => m.slug === slug || m.id === marketId)
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  
  const market = await getMarketBySlug(slug)
  
  if (!market) {
    return {
      title: locale === 'pt' ? 'Evento não encontrado - PredIQ.fun' : 'Event not found - PredIQ.fun',
      description: locale === 'pt' ? 'O evento solicitado não foi encontrado.' : 'The requested event was not found.'
    }
  }
  
  const descriptionText = locale === 'pt' 
    ? (market.description || `Faça suas predições sobre: ${market.title}`)
    : (market.description || `Make your predictions about: ${market.title}`)
  
  return {
    title: `${market.title} - PredIQ.fun`,
    description: descriptionText,
    keywords: locale === 'pt' 
      ? `predição, ${market.category.toLowerCase()}, ${market.title}, apostas, mercado`
      : `prediction, ${market.category.toLowerCase()}, ${market.title}, betting, market`,
    openGraph: {
      title: market.title,
      description: descriptionText,
      type: 'website',
      locale: locale,
      siteName: 'PredIQ.fun'
    },
    twitter: {
      card: 'summary_large_image',
      title: market.title,
      description: descriptionText
    },
    alternates: {
      canonical: `https://prediq.fun/${locale === 'pt' ? '' : 'en/'}event/${slug}`
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { locale, slug } = await params
  
  const market = await getMarketBySlug(slug)
  
  if (!market) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 pb-32 md:pb-20">
        <MarketDetail market={market} locale={locale} />
      </div>
    </div>
  )
}