'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', name: 'all' },
  { id: 'politics', name: 'politics' },
  { id: 'crypto', name: 'crypto' },
  { id: 'sports', name: 'sports' },
  { id: 'economics', name: 'economics' },
]

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void
  selectedCategory: string
}

export function CategoryFilter({ onCategoryChange, selectedCategory }: CategoryFilterProps) {
  const t = useTranslations('markets.categories')
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            "hover:shadow-md",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {t(category.name)}
        </button>
      ))}
    </div>
  )
}