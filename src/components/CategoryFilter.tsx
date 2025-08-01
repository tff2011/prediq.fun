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
  const t = useTranslations('markets')
  
  const getCategoryStyles = (categoryId: string, isSelected: boolean) => {
    const baseStyles = "px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md cursor-pointer"
    
    if (categoryId === 'all') {
      return cn(
        baseStyles,
        isSelected 
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )
    }
    
    const categoryColors = {
      politics: isSelected 
        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
        : "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/15",
      crypto: isSelected 
        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25" 
        : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/15",
      sports: isSelected 
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
        : "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/15",
      economics: isSelected 
        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25" 
        : "bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20 hover:bg-sky-200 dark:hover:bg-sky-500/15",
    }
    
    return cn(baseStyles, categoryColors[categoryId as keyof typeof categoryColors])
  }
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={getCategoryStyles(category.id, selectedCategory === category.id)}
        >
          {t(`categories.${category.name}`)}
        </button>
      ))}
    </div>
  )
}