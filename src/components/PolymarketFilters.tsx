'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'

const categories = [
  { id: 'politics', name: 'politics' },
  { id: 'crypto', name: 'crypto' },
  { id: 'sports', name: 'sports' },
  { id: 'economics', name: 'economics' },
  { id: 'technology', name: 'technology' },
  { id: 'world', name: 'world' },
]

interface PolymarketFiltersProps {
  onSearch?: (query: string) => void
  onCategoryChange?: (category: string) => void
  onSortChange?: (sort: string) => void
  onFrequencyChange?: (frequency: string) => void
  onToggleSports?: (hide: boolean) => void
  onToggleCrypto?: (hide: boolean) => void
}

export function PolymarketFilters({
  onSearch,
  onCategoryChange,
  onSortChange,
  onFrequencyChange,
  onToggleSports,
  onToggleCrypto
}: PolymarketFiltersProps) {
  const t = useTranslations('markets')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('24hr Volume')
  const [frequency, setFrequency] = useState('All')
  const [hideSports, setHideSports] = useState(false)
  const [hideCrypto, setHideCrypto] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const frequencyDropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
      if (frequencyDropdownRef.current && !frequencyDropdownRef.current.contains(event.target as Node)) {
        setShowFrequencyDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? '' : categoryId
    setSelectedCategory(newCategory)
    onCategoryChange?.(newCategory)
  }

  return (
    <div className="w-full bg-card">
      {/* First row - Search, Filter button, and Categories */}
      <div>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer hover:shadow-md hover:scale-105",
                  showFilters 
                    ? "bg-muted text-foreground border-muted-foreground hover:bg-muted/80" 
                    : "bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Filter className="h-4 w-4" />
                {t('search.filters')}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out cursor-pointer border hover:scale-105",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent hover:from-violet-700 hover:to-indigo-700 hover:shadow-md"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                  )}
                >
                  {t(`categories.${category.name}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Sort options and toggles */}
      {showFilters && (
        <div className="bg-card/50 animate-in slide-in-from-top-4 duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              {/* Sort by dropdown */}
              <div ref={sortDropdownRef} className="flex items-center gap-2 relative">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1 px-2 py-1 text-foreground hover:bg-accent hover:text-accent-foreground rounded font-medium cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                >
                  {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-32 backdrop-blur-sm">
                    {['24hr Volume', 'Volume', 'Activity', 'Newest', 'Ending Soon'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option)
                          onSortChange?.(option)
                          setShowSortDropdown(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-all duration-200 hover:scale-[1.02]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Frequency dropdown */}
              <div ref={frequencyDropdownRef} className="flex items-center gap-2 relative">
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <button
                  onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                  className="flex items-center gap-1 px-2 py-1 text-foreground hover:bg-accent hover:text-accent-foreground rounded font-medium cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                >
                  {frequency}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showFrequencyDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-24 backdrop-blur-sm">
                    {['All', 'Daily', 'Weekly', 'Monthly'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFrequency(option)
                          onFrequencyChange?.(option)
                          setShowFrequencyDropdown(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-all duration-200 hover:scale-[1.02]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle switches */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-sm text-muted-foreground">Hide sports?</span>
                <input
                  type="checkbox"
                  checked={hideSports}
                  onChange={(e) => {
                    setHideSports(e.target.checked)
                    onToggleSports?.(e.target.checked)
                  }}
                  className="w-4 h-4 text-foreground bg-background border-input rounded focus:ring-ring focus:ring-2 cursor-pointer accent-foreground"
                />
              </label>
              
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-sm text-muted-foreground">Hide crypto?</span>
                <input
                  type="checkbox"
                  checked={hideCrypto}
                  onChange={(e) => {
                    setHideCrypto(e.target.checked)
                    onToggleCrypto?.(e.target.checked)
                  }}
                  className="w-4 h-4 text-foreground bg-background border-input rounded focus:ring-ring focus:ring-2 cursor-pointer accent-foreground"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}