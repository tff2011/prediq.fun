'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { api } from '~/trpc/react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  variant?: 'default' | 'minimal'
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'Política': '🗳️',
  'Politics': '🗳️',
  'Cripto': '₿',
  'Crypto': '₿',
  'Esportes': '⚽',
  'Sports': '⚽',
  'Economia': '📊',
  'Economics': '📊',
  'Tecnologia': '💻',
  'Technology': '💻',
  'Entretenimento': '🎬',
  'Entertainment': '🎬',
  'Saúde': '🏥',
  'Health': '🏥',
  'Outros': '🔮',
  'Other': '🔮',
}

export function SearchBar({ onSearch, placeholder, className = "", variant = 'default' }: SearchBarProps) {
  const t = useTranslations('navigation')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch search results using tRPC
  const { data: searchResults = [], isLoading } = api.market.search.useQuery(
    {
      query: debouncedQuery,
      category: selectedCategory || undefined,
      limit: 5,
    },
    {
      enabled: debouncedQuery.length >= 2 && isExpanded,
    }
  )

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (value: string) => {
    setQuery(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSearch) {
      onSearch(query)
      setIsExpanded(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const categories = [
    { id: 'politics', label: t('categories.politics'), icon: '🗳️' },
    { id: 'crypto', label: t('categories.crypto'), icon: '₿' },
    { id: 'sports', label: t('categories.sports'), icon: '⚽' },
    { id: 'economics', label: t('categories.economics'), icon: '📊' },
    { id: 'technology', label: t('categories.technology'), icon: '💻' },
    { id: 'entertainment', label: t('categories.entertainment'), icon: '🎬' },
  ]

  const isMinimal = variant === 'minimal'

  return (
    <div
      ref={containerRef}
      className={cn(
        // Prevent layout jump and overflow in navbar
        "relative max-w-full",
        className
      )}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative transition-all duration-200",
          !isMinimal && "will-change-auto"
        )}>
          <Search className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
            isExpanded ? "text-primary" : "text-muted-foreground",
            isMinimal && "h-4 w-4"
          )} />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder || t('search.placeholder')}
            className={cn(
              // Exatamente o mesmo efeito do input de referência
              "w-full pl-10 pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60",
              // apenas controla a altura conforme variante
              isMinimal ? "h-9" : "h-10"
            )}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isExpanded && !isMinimal && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-2 z-[60]",
            "rounded-lg overflow-hidden border border-border shadow-web3-2 bg-card"
          )}
          style={{ backgroundColor: "hsl(var(--card))" }}
        >
          <div className="max-h-[60vh] overflow-y-auto bg-card">
            {/* Categories */}
            <div className="p-4 border-b border-border bg-card">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {query.length >= 2 && (
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Mercados de Predição
                </h3>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-pulse">Buscando mercados...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all duration-200 group bg-card"
                        onClick={() => {
                          router.push(`/pt/market/${result.slug}`)
                          setIsExpanded(false)
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200">
                            {categoryIcons[result.category] || '🔮'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{result.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {result.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{result.betCount} apostas</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Encerra em {new Date(result.closesAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-[hsl(var(--yes))]">
                            {Math.round((Number(result.outcomes?.find((o: any) => o.name === 'YES')?.probability) || 0.5) * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Sim</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div>Nenhum mercado encontrado para "{query}"</div>
                    <div className="text-sm mt-2">Tente buscar por outros termos</div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state when no query */}
            {query.length < 2 && (
              <div className="p-8 text-center text-muted-foreground bg-card">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <div>Digite pelo menos 2 caracteres para buscar</div>
                <div className="text-sm mt-2">Busque por títulos ou descrições de mercados</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}