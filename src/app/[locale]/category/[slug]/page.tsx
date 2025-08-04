'use client'

import { notFound } from 'next/navigation'
import { api, TRPCReactProvider } from '@/trpc/react'
import { useMemo, useState, use } from 'react'
import { MarketList } from '@/components/MarketList'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'

/**
 * This page lists markets filtered by category using tRPC market.getAll.
 * Route pattern: /[locale]/category/[slug]
 * Examples:
 *  - /en/category/sports
 *  - /pt/category/crypto
 */

// Database categories (from getCategoryLabel in page.tsx)
const DB_CATEGORIES = ['politics', 'sports', 'crypto', 'economics', 'entertainment', 'technology', 'science', 'other'] as const
type ValidCategory = typeof DB_CATEGORIES[number]

function normalizeCategory(slug: string): ValidCategory | null {
  const s = slug.toLowerCase()
  
  // Map URL slugs to database categories
  const urlToDbMap: Record<string, ValidCategory> = {
    'economy': 'economics',
    'tech': 'technology',
    'culture': 'entertainment', // Map culture to entertainment
    'world': 'other', // Map world to other
  }
  
  // Check if it's a direct mapping
  if (urlToDbMap[s]) return urlToDbMap[s]
  
  // Check if it's already a valid DB category
  return (DB_CATEGORIES as readonly string[]).includes(s) ? (s as ValidCategory) : null
}

// Subcategories for each main category
const getSubcategories = (category: ValidCategory) => {
  const subcategoriesMap: Record<ValidCategory, string[]> = {
    'politics': ['Elections', 'Polls', 'Brazil', 'US Politics', 'World Leaders'],
    'sports': ['Football', 'Basketball', 'Olympics', 'World Cup', 'Tennis'],
    'crypto': ['Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Regulation'],
    'economics': ['Inflation', 'Interest Rates', 'GDP', 'Stock Market', 'Currency'],
    'entertainment': ['Movies', 'TV Shows', 'Music', 'Awards', 'Celebrities'],
    'technology': ['AI', 'Big Tech', 'Startups', 'Product Launches', 'Innovation'],
    'science': ['Space', 'Climate', 'Medicine', 'Research', 'Discoveries'],
    'other': ['General', 'Misc', 'Culture', 'Society', 'Trends']
  }
  return subcategoriesMap[category] || []
}

function CategoryFilters({ category, searchQuery, onSearchChange, selectedSubcategory, onSubcategoryChange }: {
  category: ValidCategory
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSubcategory: string
  onSubcategoryChange: (subcategory: string) => void
}) {
  const t = useTranslations('markets')
  const subcategories = getSubcategories(category)
  
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-2 lg:py-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-[220px] sm:w-64 pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSubcategoryChange('')}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ease-web3 duration-200 cursor-pointer ${
                  selectedSubcategory === ''
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onSubcategoryChange(sub)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ease-web3 duration-200 cursor-pointer ${
                    selectedSubcategory === sub
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MarketsByCategoryClient({ initialCategory }: { initialCategory: ValidCategory }) {
  const t = useTranslations('markets')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // react-query + trpc client hooks require client component
  const { data, isLoading, isFetching } = api.market.getAll.useQuery(
    { category: initialCategory, limit: 24 },
    { placeholderData: (prev) => prev }
  )

  // Adapt API shape to MarketList expectation with search and subcategory filtering
  const listItems = useMemo(() => {
    const items = data?.markets ?? []
    let filteredItems = items
    
    // Filter by search query
    if (searchQuery.trim()) {
      filteredItems = filteredItems.filter((m) => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filter by subcategory if selected
    if (selectedSubcategory) {
      filteredItems = filteredItems.filter((m) => 
        m.title.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
        m.description?.toLowerCase().includes(selectedSubcategory.toLowerCase())
      )
    }
    
    // MarketList expects: { id, slug?, question, volume, endsAt, category? }
    return filteredItems.map((m) => ({
      id: m.id,
      slug: (m as any).slug, // slug is available from getAll router
      question: m.title,
      volume: Intl.NumberFormat(undefined, { notation: 'compact' }).format(Number((m as any).volume ?? 0)),
      endsAt: new Date(m.closesAt as unknown as string).toISOString(),
      category: m.category,
    }))
  }, [data, selectedSubcategory, searchQuery])

  // Get category display name
  const getCategoryDisplayName = (category: ValidCategory) => {
    return t(`categories.${category}`, { default: category })
  }

  return (
    <main className="min-h-screen">
      {/* Hero / Intro band with active category pill */}
      <section className="container mx-auto px-4 pt-6">
        <div className="rounded-xl border border-[hsl(var(--border)/0.35)]">
          <div className="rounded-xl bg-[hsl(var(--card)/0.35)] backdrop-blur-md px-4 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {getCategoryDisplayName(initialCategory)}
              </h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {listItems.length} {t('available')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Subcategories */}
      <section className="mt-4">
        <CategoryFilters
          category={initialCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={setSelectedSubcategory}
        />
      </section>

      {/* Markets Grid */}
      <section className="container mx-auto px-4 py-6">
        <div className="rounded-xl p-4 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md">
          {(isLoading || isFetching) && !data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <MarketList markets={listItems} />
          )}
        </div>
      </section>
    </main>
  )
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = use(params)
  const normalized = normalizeCategory(slug)
  if (!normalized) {
    notFound()
  }

  return (
    <TRPCReactProvider>
      <MarketsByCategoryClient initialCategory={normalized} />
    </TRPCReactProvider>
  )
}