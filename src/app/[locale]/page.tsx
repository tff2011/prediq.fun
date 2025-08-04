'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { MarketList } from '@/components/MarketList'
import { PolymarketFilters } from '@/components/PolymarketFilters'
import { api } from '~/trpc/react'
import { Skeleton } from '~/components/ui/skeleton'

export default function HomePage() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('24hr Volume')
  const [hideSports, setHideSports] = useState(false)
  const [hideCrypto, setHideCrypto] = useState(false)
  
  // Infinite list: fetch all events paginated (no featured filter)
  const {
    data: eventsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.event.getAll.useInfiniteQuery(
    {
      limit: 12
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
      staleTime: 2 * 60 * 1000, // 2 minutes - cache data as fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    }
  )

  // Transform events to market format across pages
  const markets = useMemo(() => {
    const pages = eventsData?.pages ?? []
    const allEvents = pages.flatMap((p: any) => p.events ?? [])
    return allEvents.flatMap((event: any) =>
      (event.markets ?? []).map((market: any) => ({
        id: market.id,
        question: market.title,
        endsAt: new Date(market.closesAt).toISOString().split('T')[0],
        volume: `R$ ${Number(market.volume).toLocaleString('pt-BR')}`,
        category: getCategoryLabel(event.category),
      }))
    )
  }, [eventsData])

  const filteredMarkets = useMemo(() => {
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

    return filtered
  }, [markets, searchQuery, selectedCategory, hideSports, hideCrypto])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    // TODO: Implement sorting logic
  }

  const handleToggleSports = (hide: boolean) => {
    setHideSports(hide)
  }

  const handleToggleCrypto = (hide: boolean) => {
    setHideCrypto(hide)
  }

  // Update event status periodically
  const updateStatusMutation = api.event.updateStatus.useMutation({
    onError: (error) => {
      // Ignore abort errors as they're expected during navigation
      if (error.message.includes('aborted')) {
        return
      }
      console.error('Error updating event status:', error)
    }
  })
  
  useEffect(() => {
    let mounted = true
    
    // Small delay to ensure mutation is ready
    const timeoutId = setTimeout(() => {
      if (mounted) {
        updateStatusMutation.mutate()
      }
    }, 100)
    
    // Update status every 5 minutes (reduced from 1 min for better performance)
    const interval = setInterval(() => {
      if (mounted) {
        updateStatusMutation.mutate()
      }
    }, 300000)
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && !eventsData) {
    return (
      <main className="min-h-screen">
        <section className="container mx-auto px-4 pt-6">
          <div className="rounded-xl border border-[hsl(var(--border)/0.35)]">
            <div className="rounded-xl bg-[hsl(var(--card)/0.35)] backdrop-blur-md px-4 py-3">
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero / Intro band */}
      <section className="container mx-auto px-4 pt-6">
        {/* Tarja sutil: borda hairline + glass leve, sem glow/gradiente forte */}
        <div className="rounded-xl border border-[hsl(var(--border)/0.35)]">
          <div className="rounded-xl bg-[hsl(var(--card)/0.35)] backdrop-blur-md px-4 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {t('markets.title')}
              </h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {filteredMarkets.length} {t('markets.available')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-4">
        <PolymarketFilters
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onToggleSports={handleToggleSports}
          onToggleCrypto={handleToggleCrypto}
        />
      </section>
      
      {/* Grid with infinite scroll */}
      <section className="container mx-auto px-4 py-6">
        <div className="rounded-xl p-4 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md">
          <MarketList markets={filteredMarkets} />
          <div className="mt-6 flex justify-center">
            {hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 rounded-md border border-[hsl(var(--border)/0.35)] bg-background hover:bg-accent cursor-pointer text-sm"
              >
                {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">Fim da lista</span>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    'politics': 'Política',
    'sports': 'Esportes',
    'crypto': 'Cripto',
    'economics': 'Economia',
    'entertainment': 'Entretenimento',
    'technology': 'Tecnologia',
    'science': 'Ciência',
    'other': 'Outros',
  }
  return categoryMap[category] || category
}