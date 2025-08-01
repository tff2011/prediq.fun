'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MarketList } from '@/components/MarketList'
import { CategoryFilter } from '@/components/CategoryFilter'

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
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredMarkets = selectedCategory === 'all' 
    ? markets 
    : markets.filter(market => {
        const categoryMap: Record<string, string> = {
          'Política': 'politics',
          'Cripto': 'crypto',
          'Esportes': 'sports',
          'Economia': 'economics'
        }
        return categoryMap[market.category] === selectedCategory
      })

  return (
    <main className="container mx-auto mt-10 space-y-6 px-4 lg:px-0">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('home.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xl max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{t('markets.title')}</h2>
          <span className="text-sm text-gray-500">
            {filteredMarkets.length} mercados disponíveis
          </span>
        </div>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <MarketList markets={filteredMarkets} />
      </div>
    </main>
  )
}