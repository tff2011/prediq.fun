'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { Search, Calendar, TrendingUp, Users } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Mock data - same as SearchBar
const mockSearchResults = [
  {
    id: '1',
    question: 'Lula será reeleito em 2026?',
    category: 'Política',
    probability: 72,
    endDate: '2026-10-02',
    icon: '🗳️',
    volume: 'R$ 124.850',
    traders: 342
  },
  {
    id: '2',
    question: 'Bitcoin ultrapassa R$500k até Dez/2025?',
    category: 'Cripto',
    probability: 38,
    endDate: '2025-12-31',
    icon: '₿',
    volume: 'R$ 342.700',
    traders: 128
  },
  {
    id: '3',
    question: 'Brasil vence a Copa do Mundo 2026?',
    category: 'Esportes',
    probability: 15,
    endDate: '2026-07-19',
    icon: '⚽',
    volume: 'R$ 587.300',
    traders: 856
  },
  {
    id: '4',
    question: 'Taxa Selic abaixo de 10% em 2025?',
    category: 'Economia',
    probability: 65,
    endDate: '2025-12-31',
    icon: '📊',
    volume: 'R$ 95.800',
    traders: 234
  },
  {
    id: '5',
    question: 'Trump será eleito presidente dos EUA em 2028?',
    category: 'Política',
    probability: 45,
    endDate: '2028-11-05',
    icon: '🇺🇸',
    volume: 'R$ 234.100',
    traders: 567
  },
  {
    id: '6',
    question: 'Ethereum ultrapassa Bitcoin em capitalização até 2027?',
    category: 'Cripto',
    probability: 22,
    endDate: '2027-01-01',
    icon: '⟠',
    volume: 'R$ 178.900',
    traders: 445
  },
  {
    id: '7',
    question: 'Inflação brasileira abaixo de 4% em 2025?',
    category: 'Economia',
    probability: 58,
    endDate: '2025-12-31',
    icon: '📈',
    volume: 'R$ 67.200',
    traders: 189
  },
  {
    id: '8',
    question: 'Brasil top 10 no quadro de medalhas Paris 2024?',
    category: 'Esportes',
    probability: 78,
    endDate: '2024-08-11',
    icon: '🏅',
    volume: 'R$ 412.500',
    traders: 923
  },
]

export default function SearchPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(mockSearchResults)

  useEffect(() => {
    const searchQuery = searchParams.get('q') ?? ''
    setQuery(searchQuery)
    
    // Filter results based on query
    if (searchQuery) {
      const filteredResults = mockSearchResults.filter(result =>
        result.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filteredResults)
    } else {
      setResults(mockSearchResults)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const filteredResults = mockSearchResults.filter(result =>
        result.question.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filteredResults)
    } else {
      setResults(mockSearchResults)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('navigation.search.placeholder')}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
            <Button type="submit" className="px-8">
              {t('navigation.search.search')}
            </Button>
          </form>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {query ? `${t('navigation.search.resultsFor')} "${query}"` : t('navigation.search.allMarkets')}
            </h1>
            <span className="text-muted-foreground">
              {results.length} {results.length === 1 ? t('navigation.search.resultFound') : t('navigation.search.resultsFound')}
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/20 hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
                onClick={() => window.open(`/pt/market/${result.id}`, '_self')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {result.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t('navigation.search.closes')} {new Date(result.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {result.question}
                      </h3>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{result.volume}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{result.traders}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {result.probability}%
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t('navigation.search.noResultsTitle')}</h3>
              <p className="text-muted-foreground">
                {t('navigation.search.noResultsDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}