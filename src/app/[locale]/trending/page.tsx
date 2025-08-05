'use client'

import { Suspense, useMemo, useState, use } from 'react'
import { MarketList } from '@/components/MarketList'
import { SearchBar } from '@/components/SearchBar'
import { useTranslations } from 'next-intl'
import { TrendingUp, Users, Activity } from 'lucide-react'
import { api } from '~/trpc/react'
import { Skeleton } from '~/components/ui/skeleton'

interface TrendingPageProps {
  params: {
    locale: string
  }
  searchParams: Promise<{
    category?: string
    search?: string
  }>
}

export default function TrendingPage({ params, searchParams }: TrendingPageProps) {
  // Temporary fallback while translation loading is fixed
  const t = useTranslations('navigation')
  const resolvedSearchParams = use(searchParams)
  const [searchQuery, setSearchQuery] = useState(resolvedSearchParams?.search || '')
  const [selectedCategory, setSelectedCategory] = useState(resolvedSearchParams?.category || '')
  
  // Define translations directly for now
  const trendingText = {
    title: 'Em Alta',
    description: 'Mercados mais populares ordenados por número de traders',
    searchPlaceholder: 'Buscar mercados em alta...',
    stats: {
      totalTraders: 'Total de Traders',
      activeMarkets: 'Mercados Ativos',
      volume24h: 'Volume 24h'
    },
    emptyState: {
      title: 'Nenhum mercado em alta encontrado',
      description: 'Não encontramos mercados populares com os filtros selecionados. Tente ajustar sua busca ou explorar outras categorias.'
    }
  }

  // Fetch trending markets
  const {
    data: marketsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.market.getTrending.useInfiniteQuery(
    {
      limit: 12,
      category: selectedCategory || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  // Transform markets to the format expected by MarketList
  const markets = useMemo(() => {
    const pages = marketsData?.pages ?? []
    const allMarkets = pages.flatMap((p: any) => p.markets ?? [])
    return allMarkets
      .filter((market: any) => {
        // Apply search filter
        if (searchQuery) {
          return market.title.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return true
      })
      .map((market: any) => ({
        id: market.id,
        slug: market.slug,
        question: market.title,
        endsAt: new Date(market.closesAt).toISOString().split('T')[0],
        volume: `R$ ${Number(market.volume || 0).toLocaleString('pt-BR')}`,
        category: getCategoryLabel(market.category),
        traders: market._count?.bets || 0,
      }))
  }, [marketsData, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  if (isLoading && !marketsData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20">
            <TrendingUp className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{trendingText.title}</h1>
            <p className="text-muted-foreground">{trendingText.description}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">{trendingText.stats.totalTraders}</div>
              <div className="text-lg font-semibold">
                {markets.reduce((sum, market) => sum + (market.traders || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <Activity className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">{trendingText.stats.activeMarkets}</div>
              <div className="text-lg font-semibold">{markets.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-sm text-muted-foreground">{trendingText.stats.volume24h}</div>
              <div className="text-lg font-semibold">
                R$ {markets.reduce((sum, market) => {
                  const volume = parseFloat(market.volume.replace(/[R$\s.]/g, '').replace(',', '.')) || 0
                  return sum + volume
                }, 0).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl">
          <SearchBar
            placeholder={trendingText.searchPlaceholder}
            className="w-full"
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Markets List */}
      <div className="rounded-xl p-4 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md">
        {markets.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{trendingText.emptyState.title}</h3>
            <p className="text-muted-foreground">{trendingText.emptyState.description}</p>
          </div>
        ) : (
          <>
            <MarketList markets={markets} />
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
          </>
        )}
      </div>
    </div>
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