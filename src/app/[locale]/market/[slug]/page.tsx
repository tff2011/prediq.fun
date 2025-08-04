import { MarketDetailComponent } from '@/components/MarketDetail'
import { notFound, redirect } from 'next/navigation'
import { db } from '~/server/db'

// Resolve a market by slug. If slug is an old one, follow redirect to the latest slug (301).
export default async function MarketDetailBySlugPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params

  // 1) Try to find market by current slug (raw where to avoid type mismatch pre-migration)
  const market = await db.market.findFirst({
    // @ts-ignore - slug field exists after schema update
    where: { slug },
    include: {
      _count: { select: { bets: true } }
    }
  })

  // 2) If not found, check redirect mapping (table will exist after migration)
  if (!market) {
    // Defensive try/catch in case migration isn't applied yet
    try {
      const redirectRow = await (db as any).marketSlugRedirect?.findUnique?.({
        where: { fromSlug: slug }
      })

      if (redirectRow?.toSlug) {
        // Permanent redirect to the latest slug, preserving locale
        return redirect(`/${locale}/market/${redirectRow.toSlug}`)
      }
    } catch {
      // ignore if table not yet available
    }

    notFound()
  }

  // Adapt DB market into the component shape
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
    totalBets: (market as any)._count?.bets ?? 0,
    liquidity: `R$ ${Number(market.liquidity ?? 0).toLocaleString('pt-BR')}`,
    status: (market.status?.toLowerCase?.() ?? 'active') as 'active' | 'closed' | 'resolved'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MarketDetailComponent data={data} />
    </div>
  )
}