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
    const baseStyles = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border"
    
    if (categoryId === 'all') {
      return cn(
        baseStyles,
        isSelected 
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent hover:from-violet-700 hover:to-indigo-700"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500"
      )
    }
    
    const categoryColors = {
      politics: isSelected
        ? "bg-indigo-600 text-white border-transparent hover:bg-indigo-700"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500",
      crypto: isSelected
        ? "bg-amber-600 text-white border-transparent hover:bg-amber-700"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500",
      sports: isSelected
        ? "bg-emerald-600 text-white border-transparent hover:bg-emerald-700"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500",
      economics: isSelected
        ? "bg-sky-600 text-white border-transparent hover:bg-sky-700"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500",
    }
    
    return cn(baseStyles, categoryColors[categoryId as keyof typeof categoryColors])
  }
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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