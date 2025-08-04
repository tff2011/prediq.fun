'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

const categories = [
  { id: 'politics', name: 'politics' },
  { id: 'crypto', name: 'crypto' },
  { id: 'sports', name: 'sports' },
  { id: 'economics', name: 'economics' },
  { id: 'technology', name: 'technology' },
  { id: 'world', name: 'world' },
]

const getCategorySelectedStyle = (categoryId: string): string => {
  const styles: Record<string, string> = {
    politics: "bg-blue-600 text-white border-transparent hover:bg-blue-700 hover:shadow-md",
    crypto: "bg-orange-600 text-white border-transparent hover:bg-orange-700 hover:shadow-md",
    sports: "bg-green-600 text-white border-transparent hover:bg-green-700 hover:shadow-md",
    economics: "bg-purple-600 text-white border-transparent hover:bg-purple-700 hover:shadow-md",
    technology: "bg-indigo-600 text-white border-transparent hover:bg-indigo-700 hover:shadow-md",
    world: "bg-red-600 text-white border-transparent hover:bg-red-700 hover:shadow-md",
  }
  return styles[categoryId] ?? "bg-gray-600 text-white border-transparent hover:bg-gray-700 hover:shadow-md"
}

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
  const [sortBy, setSortBy] = useState('24hrVolume')
  const [frequency, setFrequency] = useState('all')
  const [hideSports, setHideSports] = useState(false)
  const [hideCrypto, setHideCrypto] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const frequencyDropdownRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // Check if we need to show arrows
  const checkArrows = () => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

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

  // Check arrows on mount and resize
  useEffect(() => {
    checkArrows()
    window.addEventListener('resize', checkArrows)
    return () => window.removeEventListener('resize', checkArrows)
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

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200
      const newScrollLeft = direction === 'left' 
        ? categoriesRef.current.scrollLeft - scrollAmount
        : categoriesRef.current.scrollLeft + scrollAmount
      
      categoriesRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkArrows, 300)
    }
  }

  return (
    <div className="w-full">
      {/* First row - Search, Filter button, and Categories */}
      <div>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-muted/30 border-0 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/50 focus:bg-background"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer hover:bg-accent/10",
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

            {/* Category pills with arrow navigation */}
            <div className="relative flex items-center w-full lg:w-auto">
              {/* Left Arrow */}
              <button
                onClick={() => scrollCategories('left')}
                className={cn(
                  "absolute left-0 z-10 h-8 w-8 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-full shadow-sm cursor-pointer hover:bg-accent transition-colors duration-150",
                  showLeftArrow ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Categories container */}
              <div 
                ref={categoriesRef}
                onScroll={checkArrows}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth w-full px-12"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer",
                      selectedCategory === category.id
                        ? getCategorySelectedStyle(category.id)
                        : "bg-muted/30 text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {t(`categories.${category.name}`)}
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCategories('right')}
                className={cn(
                  "absolute right-0 z-10 h-8 w-8 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-full shadow-sm cursor-pointer hover:bg-accent transition-colors duration-150",
                  showRightArrow ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second row - Sort options and toggles */}
      {showFilters && (
        <div className="bg-muted/10 animate-in slide-in-from-top-4 duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Sort by dropdown */}
              <div ref={sortDropdownRef} className="flex items-center gap-2 relative">
                <span className="text-sm text-muted-foreground">{t('filters.sortBy')}</span>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1 px-2 py-1 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md font-medium cursor-pointer transition-colors duration-150"
                >
                  {t(`filters.sortOptions.${sortBy}`)}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card rounded-lg shadow-lg z-50 min-w-32 backdrop-blur-sm">
                    {['24hrVolume', 'volume', 'activity', 'newest', 'endingSoon'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option)
                          onSortChange?.(option)
                          setShowSortDropdown(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-colors duration-150"
                      >
                        {t(`filters.sortOptions.${option}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Frequency dropdown */}
              <div ref={frequencyDropdownRef} className="flex items-center gap-2 relative">
                <span className="text-sm text-muted-foreground">{t('filters.frequency')}</span>
                <button
                  onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                  className="flex items-center gap-1 px-2 py-1 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md font-medium cursor-pointer transition-colors duration-150"
                >
                  {t(`filters.frequencyOptions.${frequency}`)}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showFrequencyDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card rounded-lg shadow-lg z-50 min-w-24 backdrop-blur-sm">
                    {['all', 'daily', 'weekly', 'monthly'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFrequency(option)
                          onFrequencyChange?.(option)
                          setShowFrequencyDropdown(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-colors duration-150"
                      >
                        {t(`filters.frequencyOptions.${option}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle switches */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-sm text-muted-foreground">{t('filters.hideSports')}</span>
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
                <span className="text-sm text-muted-foreground">{t('filters.hideCrypto')}</span>
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