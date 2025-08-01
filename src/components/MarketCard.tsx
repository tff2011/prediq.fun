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
  const t = useTranslations('markets.card')
  
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
  
  return (
    <Card className="cursor-pointer hover:shadow-xl transition-all duration-200 border-border overflow-hidden group">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          {category && (
            <Badge variant={getCategoryVariant(category)} className="mb-2">
              {category}
            </Badge>
          )}
          <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {question}
          </CardTitle>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 bg-success/10 border border-success/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success">
              {yesPercentage}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">{t('yes')}</div>
          </div>
          <div className="flex-1 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-destructive">
              {noPercentage}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">{t('no')}</div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {t('volume')}
            </span>
            <span className="font-semibold text-foreground">{volume}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {t('traders')}
            </span>
            <span className="font-semibold text-foreground">{traders}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('closes')}
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