'use client'

import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl'
import { TrendingUp, Users, Calendar } from 'lucide-react'

interface Props {
  id: string
  question: string
  volume: string
  endsAt: string
  category?: string
}

export function MarketCard({ id, question, volume, endsAt, category }: Props) {
  const t = useTranslations('markets')
  
  // Use a deterministic value based on the market ID to avoid hydration issues
  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
  
  const marketHash = hashCode(id)
  const yesPercentage = 20 + (marketHash % 60) // Range: 20-79
  const noPercentage = 100 - yesPercentage
  const traders = 100 + (marketHash % 900) // Range: 100-999
  
  type CategoryVariant = 'default' | 'politics' | 'crypto' | 'sports' | 'economics'
  
  const getCategoryVariant = (cat?: string): CategoryVariant => {
    const categoryMap: Record<string, CategoryVariant> = {
      'Política': 'politics',
      'Cripto': 'crypto',
      'Esportes': 'sports',
      'Economia': 'economics'
    }
    return categoryMap[cat ?? ''] ?? 'default'
  }
  
  // Get translated category name
  const getTranslatedCategory = (cat?: string): string => {
    if (!cat) return ''
    const variant = getCategoryVariant(cat)
    return variant !== 'default' ? t(`categories.${variant}`) : cat
  }
  
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-border/60 group bg-card text-foreground shadow-sm hover:border-border">
      <CardContent className="p-6">
        {category && (
          <div className="mt-2 mb-4">
            <Badge variant={getCategoryVariant(category)} className="inline-block">
              {getTranslatedCategory(category)}
            </Badge>
          </div>
        )}
        <div className="mb-6">
          <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {question}
          </CardTitle>
        </div>
        
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-green-50 dark:bg-[hsl(var(--yes)/0.25)] border border-green-200 dark:border-[hsl(var(--yes))] rounded-xl p-4 text-center hover:bg-green-100 dark:hover:bg-[hsl(var(--yes)/0.32)] transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-[hsl(var(--yes)/0.3)]">
            <div className="text-3xl font-bold text-[hsl(var(--yes))]">
              {yesPercentage}%
            </div>
            <div className="text-xs text-[hsl(var(--yes)/0.8)] dark:text-[hsl(var(--yes))] uppercase font-semibold tracking-wider mt-1">{t('card.yes')}</div>
          </div>
          <div className="flex-1 bg-red-50 dark:bg-[hsl(var(--no)/0.25)] border border-red-200 dark:border-[hsl(var(--no))] rounded-xl p-4 text-center hover:bg-red-100 dark:hover:bg-[hsl(var(--no)/0.32)] transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-red-300 dark:hover:border-[hsl(var(--no)/0.3)]">
            <div className="text-3xl font-bold text-[hsl(var(--no))]">
              {noPercentage}%
            </div>
            <div className="text-xs text-[hsl(var(--no)/0.8)] dark:text-[hsl(var(--no))] uppercase font-semibold tracking-wider mt-1">{t('card.no')}</div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t('card.volume')}
            </span>
            <span className="font-semibold text-foreground">{volume}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {t('card.traders')}
            </span>
            <span className="font-semibold text-foreground">{traders}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('card.closes')}
            </span>
            <span className="font-semibold text-foreground">
              {new Date(endsAt).toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}