import { MarketCard } from './MarketCard'

interface Market {
  id: string
  question: string
  volume: string
  endsAt: string
  category?: string
}

interface MarketListProps {
  markets: Market[]
  className?: string
}

export function MarketList({ markets, className = "" }: MarketListProps) {
  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum mercado encontrado.</p>
      </div>
    )
  }
  
  return (
    <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 ${className}`}>
      {markets.map((market) => (
        <MarketCard key={market.id} {...market} />
      ))}
    </section>
  )
}