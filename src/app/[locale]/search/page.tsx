'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useMemo } from 'react'
import { Search, Calendar, TrendingUp, Users } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '~/trpc/react'

// Category filtering options
const categories = [
  { value: '', label: 'Todas' },
  { value: 'politics', label: 'Política' },
  { value: 'crypto', label: 'Cripto' },
  { value: 'sports', label: 'Esportes' },
  { value: 'economics', label: 'Economia' },
]

export default function SearchPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // Get initial query from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('q') ?? ''
    const categoryParam = searchParams.get('category') ?? ''
    setQuery(searchQuery)
    setSelectedCategory(categoryParam)
  }, [searchParams])

  // Search API call - only when query is provided
  const { data: searchResults = [], isLoading } = api.market.search.useQuery(
    { 
      query: query.trim(), 
      category: selectedCategory || undefined, 
      limit: 20 
    },
    { 
      enabled: query.trim().length >= 2,
      staleTime: 30 * 1000, // 30 seconds cache
      gcTime: 5 * 60 * 1000, // 5 minutes in cache
    }
  )

  // Get category icon
  const getCategoryIcon = (category?: string): string => {
    const iconMap: Record<string, string> = {
      'politics': '🗳️',
      'crypto': '₿', 
      'sports': '⚽',
      'economics': '📊',
      'technology': '💻',
      'world': '🌍'
    }
    return iconMap[category?.toLowerCase() ?? ''] ?? '❓'
  }

  // Use deterministic hash like MarketCard to avoid hydration issues
  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  // Transform search results to display format
  const displayResults = useMemo(() => {
    return searchResults.map(market => {
      const marketHash = hashCode(market.id)
      return {
        id: market.id,
        slug: market.slug,
        question: market.title,
        category: market.category,
        probability: 20 + (marketHash % 60), // Range: 20-79, deterministic
        endDate: market.closesAt,
        icon: getCategoryIcon(market.category?.toLowerCase()),
        volume: `R$ ${Number(market.volume).toLocaleString('pt-BR')}`,
        traders: 100 + (marketHash % 900) // Range: 100-999, deterministic
      }
    })
  }, [searchResults])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Query is handled by the API call automatically
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
              {displayResults.length} {displayResults.length === 1 ? t('navigation.search.resultFound') : t('navigation.search.resultsFound')}
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {isLoading && query.trim().length >= 2 ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Buscando mercados...</p>
            </div>
          ) : displayResults.length > 0 ? (
            displayResults.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/20 hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
                onClick={() => window.open(`/pt/market/${result.slug || result.id}`, '_self')}
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
          ) : query.trim().length >= 2 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t('navigation.search.noResultsTitle')}</h3>
              <p className="text-muted-foreground">
                {t('navigation.search.noResultsDesc')}
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Digite sua busca</h3>
              <p className="text-muted-foreground">
                Use a barra de pesquisa acima para encontrar mercados específicos
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}