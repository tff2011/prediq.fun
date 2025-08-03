import { MarketDetailComponent } from '@/components/MarketDetail'
import { notFound } from 'next/navigation'

// Mock data - replace with actual data fetching
const getMarketById = async (id: string) => {
  const markets = {
    'eleicao2026': {
      id: 'eleicao2026',
      question: 'Lula será reeleito em 2026?',
      description: 'Este mercado resolve como "SIM" se Luiz Inácio Lula da Silva for eleito presidente do Brasil nas eleições de 2026.',
      endsAt: '2026-10-02',
      volume: 'R$ 124.850',
      category: 'Política',
      oddsYes: 1.65,
      oddsNo: 2.35,
      totalBets: 3429,
      liquidity: 'R$ 89.300',
      status: 'active' as const
    },
    'bitcoin': {
      id: 'bitcoin',
      question: 'Bitcoin ultrapassa R$500k até Dez/2025?',
      description: 'Este mercado resolve como "SIM" se o Bitcoin atingir ou ultrapassar R$500.000 em qualquer momento até 31 de dezembro de 2025.',
      endsAt: '2025-12-31',
      volume: 'R$ 342.700',
      category: 'Cripto',
      oddsYes: 2.10,
      oddsNo: 1.90,
      totalBets: 5832,
      liquidity: 'R$ 234.100',
      status: 'active' as const
    }
  }
  
  return markets[id as keyof typeof markets] || null
}

export default async function MarketDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string, locale: string }> 
}) {
  const { id } = await params
  const market = await getMarketById(id)
  
  if (!market) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <MarketDetailComponent data={market} />
    </div>
  )
}