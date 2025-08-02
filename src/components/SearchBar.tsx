'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  variant?: 'default' | 'header'
}

// Mock data for search suggestions
const mockTopics = [
  { id: 'politics', name: 'politics' },
  { id: 'crypto', name: 'crypto' },
  { id: 'sports', name: 'sports' },
  { id: 'economics', name: 'economics' },
  { id: 'technology', name: 'technology' },
]

const mockSearchResults = [
  {
    id: '1',
    question: 'Lula será reeleito em 2026?',
    category: 'Política',
    probability: 72,
    endDate: '2026-10-02',
    icon: '🗳️'
  },
  {
    id: '2',
    question: 'Bitcoin ultrapassa R$500k até Dez/2025?',
    category: 'Cripto',
    probability: 38,
    endDate: '2025-12-31',
    icon: '₿'
  },
  {
    id: '3',
    question: 'Brasil vence a Copa do Mundo 2026?',
    category: 'Esportes',
    probability: 15,
    endDate: '2026-07-19',
    icon: '⚽'
  },
  {
    id: '4',
    question: 'Taxa Selic abaixo de 10% em 2025?',
    category: 'Economia',
    probability: 65,
    endDate: '2025-12-31',
    icon: '📊'
  },
]

export function SearchBar({ onSearch, placeholder, className = "", variant = 'default' }: SearchBarProps) {
  const t = useTranslations('navigation')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'active' | 'ended'>('active')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside to close expanded search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    
    if (onSearch) {
      onSearch(query)
    } else {
      // Default behavior: navigate to markets page with search query
      router.push(`/pt/markets?q=${encodeURIComponent(query)}`)
    }
    
    setIsSearching(false)
    setIsExpanded(false)
  }

  const clearSearch = () => {
    setQuery('')
    setSelectedTopic('')
    if (onSearch) {
      onSearch('')
    }
  }

  const handleInputFocus = () => {
    if (variant === 'header' && query.trim()) {
      setIsExpanded(true)
    }
  }

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(selectedTopic === topicId ? '' : topicId)
  }

  // Filter results based on query and selected topic
  const filteredResults = mockSearchResults.filter(result => {
    const matchesQuery = !query || result.question.toLowerCase().includes(query.toLowerCase())
    const matchesTopic = !selectedTopic || result.category.toLowerCase() === selectedTopic.toLowerCase()
    return matchesQuery && matchesTopic
  })

  if (variant === 'header') {
    return (
      <div ref={searchRef} className={`relative ${className}`}>
        <form onSubmit={handleSearch} className="relative z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (e.target.value.trim() && variant === 'header') {
                  setIsExpanded(true)
                } else if (!e.target.value.trim() && variant === 'header') {
                  setIsExpanded(false)
                }
              }}
              onFocus={handleInputFocus}
              placeholder={placeholder ?? t('search.placeholder')}
              className="pl-10 pr-8 header-search !bg-card !bg-opacity-100 border-border focus:ring-2 focus:ring-ring transition-all duration-200 shadow-sm"
              disabled={isSearching}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 transition-all duration-200 hover:scale-110"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>

        {/* Expanded Search Results */}
        {isExpanded && query.trim() && (
          <div
            className="absolute top-full left-0 right-0 mt-2 z-[60]"
          >
            {/* Card-style container following MarketCard pattern for solid, opaque background */}
            <div className="rounded-lg border border-border/60 bg-card text-foreground shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out backdrop-blur-sm">
              <div className="p-6">
                {/* Topics Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">{t('search.topics')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockTopics.map((topic) => (
                      <Button
                        key={topic.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTopicClick(topic.id)}
                        className={cn(
                          "text-xs cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105",
                          selectedTopic === topic.id && "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                        )}
                      >
                        {t(`categories.${topic.name}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                  <Button
                    type="button"
                    variant={selectedFilter === 'active' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedFilter('active')}
                    className="text-xs cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 text-foreground"
                  >
                    {t('search.active')}
                  </Button>
                  <Button
                    type="button"
                    variant={selectedFilter === 'ended' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedFilter('ended')}
                    className="text-xs cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 text-foreground"
                  >
                    {t('search.ended')}
                  </Button>
                  <div className="ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-700 dark:text-primary hover:text-blue-800 dark:hover:text-primary/80 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                      onClick={() => {
                        const searchQuery = query || selectedTopic
                        router.push(`/pt/search?q=${encodeURIComponent(searchQuery)}`)
                        setIsExpanded(false)
                      }}
                    >
                      {t('search.seeAll')}
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                <div className="space-y-2">
                  {filteredResults.length > 0 ? (
                    filteredResults.slice(0, 6).map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:border-border hover:shadow-md cursor-pointer transition-all duration-300 ease-in-out group bg-card hover:bg-accent/10 dark:hover:bg-accent/20"
                        onClick={() => {
                          router.push(`/pt/market/${result.id}`)
                          setIsExpanded(false)
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-muted border border-border/50 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors duration-300">
                              {result.question}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs border-border/60">
                                {result.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(result.endDate).toLocaleDateString('pt-BR', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-lg font-bold text-foreground">
                            {result.probability}%
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider">
                            SIM
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('search.noResults')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? t('search.placeholder')}
          className="pl-10 pr-24 !bg-card border-border focus:ring-2 focus:ring-ring transition-all duration-200 shadow-sm"
          disabled={isSearching}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSearching || !query.trim()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            t('search.search')
          )}
        </Button>
      </div>
    </form>
  )
}