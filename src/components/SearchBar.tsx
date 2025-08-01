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
    if (variant === 'header') {
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
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={placeholder || t('search.placeholder')}
              className="pl-10 pr-8 !bg-card border-border focus:ring-2 focus:ring-ring transition-all duration-200 shadow-sm"
              disabled={isSearching}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>

        {/* Expanded Search Results */}
        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-2xl z-50">
            <div className="p-4">
              {/* Topics Section */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">{t('search.topics')}</h3>
                <div className="flex flex-wrap gap-2">
                  {mockTopics.map((topic) => (
                    <Button
                      key={topic.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTopicClick(topic.id)}
                      className={cn(
                        "text-xs",
                        selectedTopic === topic.id && "bg-primary text-primary-foreground"
                      )}
                    >
                      {t(`categories.${topic.name}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={selectedFilter === 'active' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('active')}
                  className="text-xs"
                >
                  {t('search.active')}
                </Button>
                <Button
                  type="button"
                  variant={selectedFilter === 'ended' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('ended')}
                  className="text-xs"
                >
                  {t('search.ended')}
                </Button>
                <div className="ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80"
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
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => {
                        router.push(`/pt/market/${result.id}`)
                        setIsExpanded(false)
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {result.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
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
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {result.probability}%
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
          placeholder={placeholder || t('search.placeholder')}
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