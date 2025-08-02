'use client'

import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl'
import { TrendingUp, Users, Calendar, Triangle } from 'lucide-react'
import Link from 'next/link'
import { generateEventUrl } from '@/lib/slug'

interface Props {
  id: string
  question: string
  volume: string
  endsAt: string
  category?: string
  imageUrl?: string
  locale?: string
}

export function MarketCard({ id, question, volume, endsAt, category, imageUrl, locale = 'pt' }: Props) {
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
  
  // Get category icon
  const getCategoryIcon = (cat?: string): string => {
    const iconMap: Record<string, string> = {
      'Política': '🗳️',
      'Cripto': '₿',
      'Esportes': '⚽',
      'Economia': '📊',
      'Tecnologia': '💻',
      'Mundo': '🌍'
    }
    return iconMap[cat ?? ''] ?? '❓'
  }

  const eventUrl = generateEventUrl(question, locale)

  return (
    <Link href={eventUrl}>
      <Card className="market-card-light-hover market-card-dark-hover cursor-pointer transition-all duration-200 ease-in-out border border-border/60 group bg-card text-foreground shadow-sm hover:border-border w-full h-[180px] flex flex-col">
      <CardContent className="px-2 pt-3 pb-2 flex flex-col h-full justify-between">
        {/* Header with image and title */}
        <div className="flex gap-3 items-center">
          <div className="w-[38px] h-[38px] flex-shrink-0">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Market icon" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl rounded-lg">
                {getCategoryIcon(category)}
              </div>
            )}
          </div>
          <CardTitle className="text-[15px] font-extrabold leading-tight line-clamp-2 group-hover:text-primary group-hover:underline transition-all duration-300 flex-1">
            {question}
          </CardTitle>
        </div>
        
        {/* Yes/No Buttons */}
        <div className="flex gap-2">
          <div className="flex-1 bg-[rgb(var(--yes)/0.2)] border border-[rgb(var(--yes)/0.4)] rounded-lg py-2 px-2 h-14 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-md hover:border-[rgb(var(--yes)/0.6)] hover:bg-[rgb(var(--yes)/0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-xl font-bold text-[rgb(var(--yes))] transition-transform duration-300 hover:scale-105">
                  {yesPercentage}%
                </div>
                <div className="text-xs text-[rgb(var(--yes))] uppercase font-semibold tracking-wider">
                  {t('card.yes')}
                </div>
              </div>
              <Triangle className="w-4 h-4 fill-current text-[rgb(var(--yes))]" />
            </div>
          </div>
          <div className="flex-1 bg-[rgb(var(--no)/0.2)] border border-[rgb(var(--no)/0.4)] rounded-lg py-2 px-2 h-14 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-md hover:border-[rgb(var(--no)/0.6)] hover:bg-[rgb(var(--no)/0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-xl font-bold text-[rgb(var(--no))] transition-transform duration-300 hover:scale-105">
                  {noPercentage}%
                </div>
                <div className="text-xs text-[rgb(var(--no))] uppercase font-semibold tracking-wider">
                  {t('card.no')}
                </div>
              </div>
              <Triangle className="w-4 h-4 fill-current text-[rgb(var(--no))] rotate-180" />
            </div>
          </div>
        </div>
        
        {/* Footer info - centered */}
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="font-semibold text-foreground truncate">{volume}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
            </div>
            <div className="font-semibold text-foreground">{traders}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
            </div>
            <div className="font-semibold text-foreground">
              {new Date(endsAt).toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}