'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { MarketList } from '@/components/MarketList'
import { PolymarketFilters } from '@/components/PolymarketFilters'

const markets = [
  {
    id: 'eleicao2026',
    question: 'Lula será reeleito em 2026?',
    endsAt: '2026-10-02',
    volume: 'R$ 124.850',
    category: 'Política'
  },
  {
    id: 'bitcoin',
    question: 'Bitcoin ultrapassa R$500k até Dez/2025?',
    endsAt: '2025-12-31',
    volume: 'R$ 342.700',
    category: 'Cripto'
  },
  {
    id: 'copa2026',
    question: 'Brasil vence a Copa do Mundo 2026?',
    endsAt: '2026-07-19',
    volume: 'R$ 587.300',
    category: 'Esportes'
  },
  {
    id: 'selic',
    question: 'Taxa Selic abaixo de 10% em 2025?',
    endsAt: '2025-12-31',
    volume: 'R$ 95.800',
    category: 'Economia'
  },
  {
    id: 'trump2028',
    question: 'Trump será eleito presidente dos EUA em 2028?',
    endsAt: '2028-11-05',
    volume: 'R$ 234.100',
    category: 'Política'
  },
  {
    id: 'ethereum',
    question: 'Ethereum ultrapassa Bitcoin em capitalização até 2027?',
    endsAt: '2027-01-01',
    volume: 'R$ 178.900',
    category: 'Cripto'
  },
  {
    id: 'inflacao',
    question: 'Inflação brasileira abaixo de 4% em 2025?',
    endsAt: '2025-12-31',
    volume: 'R$ 67.200',
    category: 'Economia'
  },
  {
    id: 'olimpiadas',
    question: 'Brasil top 10 no quadro de medalhas Paris 2024?',
    endsAt: '2024-08-11',
    volume: 'R$ 412.500',
    category: 'Esportes'
  },
]

export default function HomePage() {
  const t = useTranslations()
  const [filteredMarkets, setFilteredMarkets] = useState(markets)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('24hr Volume')
  const [hideSports, setHideSports] = useState(false)
  const [hideCrypto, setHideCrypto] = useState(false)

  const applyFilters = () => {
    let filtered = [...markets]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(market => 
        market.question.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory) {
      const categoryMap: Record<string, string> = {
        'politics': 'Política',
        'crypto': 'Cripto', 
        'sports': 'Esportes',
        'economics': 'Economia',
        'ai': 'Tecnologia',
        'geopolitics': 'Política',
        'brazil': 'Política',
        'us-election': 'Política',
        'world': 'Mundo'
      }
      const mappedCategory = categoryMap[selectedCategory]
      if (mappedCategory) {
        filtered = filtered.filter(market => market.category === mappedCategory)
      }
    }

    // Apply hide toggles
    if (hideSports) {
      filtered = filtered.filter(market => market.category !== 'Esportes')
    }
    if (hideCrypto) {
      filtered = filtered.filter(market => market.category !== 'Cripto')
    }

    setFilteredMarkets(filtered)
  }

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedCategory, sortBy, hideSports, hideCrypto])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    applyFilters()
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    // TODO: Implement sorting logic
    applyFilters()
  }

  const handleToggleSports = (hide: boolean) => {
    setHideSports(hide)
    applyFilters()
  }

  const handleToggleCrypto = (hide: boolean) => {
    setHideCrypto(hide)
    applyFilters()
  }

  return (
    <main className="min-h-screen bg-background">
      <PolymarketFilters
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onToggleSports={handleToggleSports}
        onToggleCrypto={handleToggleCrypto}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{t('markets.title')}</h2>
          <span className="text-sm text-muted-foreground">
            {filteredMarkets.length} {t('markets.available')}
          </span>
        </div>
        
        <MarketList markets={filteredMarkets} />
      </div>
    </main>
  )
}
