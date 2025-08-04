import { MarketDetailComponent } from '@/components/MarketDetail'
import { notFound } from 'next/navigation'
import { api } from '~/trpc/server'

export default async function MarketDetailPage({
  params
}: {
  params: Promise<{ id: string, locale: string }>
}) {
  const { id } = await params

  // Fetch market from PostgreSQL via tRPC server caller
  // Using server-side call to avoid client waterfall and ensure 404 on missing
  const trpc = api
  let market: any = null

  try {
    market = await trpc.market.getById({ id })
  } catch {
    // fallthrough to notFound
  }

  if (!market) {
    notFound()
  }

  // Adapt DB market to component shape quickly
  const data = {
    id: market.id,
    title: market.title,
    description: market.description ?? '',
    endsAt: market.closesAt?.toISOString?.() ?? new Date(market.closesAt).toISOString(),
    volume: `R$ ${Number(market.volume ?? 0).toLocaleString('pt-BR')}`,
    category: market.category ?? 'Outros',
    // Temporary odds placeholders until pricing engine exists
    oddsYes: 50,
    oddsNo: 50,
    totalBets: market._count?.bets ?? 0,
    liquidity: `R$ ${Number(market.liquidity ?? 0).toLocaleString('pt-BR')}`,
    status: (market.status?.toLowerCase?.() ?? 'active') as 'active' | 'closed' | 'resolved'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MarketDetailComponent data={data} />
    </div>
  )
}