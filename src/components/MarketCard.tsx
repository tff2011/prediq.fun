'use client'

import { Card, CardTitle, CardContent } from "@/components/ui/card"
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
      <Card className="cursor-pointer transition-all duration-200 ease-in-out border border-border group bg-card hover:bg-muted/20 w-full h-[180px] flex flex-col shadow-sm hover:shadow-md">
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
          <CardTitle className="text-[15px] font-extrabold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200 flex-1">
            {question}
          </CardTitle>
        </div>
        
        {/* Yes/No Buttons */}
        <div className="flex gap-2">
          <div className="flex-1 bg-[hsl(var(--yes-container))] dark:bg-[hsl(var(--yes)/0.3)] border border-[hsl(var(--yes-container))] dark:border-[hsl(var(--yes)/0.6)] rounded-lg py-2 px-2 h-14 transition-all duration-200 cursor-pointer hover:bg-[hsl(var(--yes-container)/0.8)] dark:hover:bg-[hsl(var(--yes)/0.5)] group/yes">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-xl font-bold text-[hsl(var(--yes-foreground))] dark:text-[hsl(var(--yes-foreground))] transition-transform duration-200 group-hover/yes:scale-105">
                  {yesPercentage}%
                </div>
                <div className="text-xs text-[hsl(var(--yes-foreground))] dark:text-[hsl(var(--yes-foreground)/0.8)] uppercase font-semibold tracking-wider">
                  {t('card.yes')}
                </div>
              </div>
              <Triangle className="w-4 h-4 fill-current text-[hsl(var(--yes-foreground))] dark:text-[hsl(var(--yes-foreground))]" />
            </div>
          </div>
          <div className="flex-1 bg-[hsl(var(--no-container))] dark:bg-[hsl(var(--no)/0.3)] border border-[hsl(var(--no-container))] dark:border-[hsl(var(--no)/0.6)] rounded-lg py-2 px-2 h-14 transition-all duration-200 cursor-pointer hover:bg-[hsl(var(--no-container)/0.8)] dark:hover:bg-[hsl(var(--no)/0.5)] group/no">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-xl font-bold text-[hsl(var(--no-foreground))] dark:text-[hsl(var(--no-foreground))] transition-transform duration-200 group-hover/no:scale-105">
                  {noPercentage}%
                </div>
                <div className="text-xs text-[hsl(var(--no-foreground))] dark:text-[hsl(var(--no-foreground)/0.8)] uppercase font-semibold tracking-wider">
                  {t('card.no')}
                </div>
              </div>
              <Triangle className="w-4 h-4 fill-current text-[hsl(var(--no-foreground))] dark:text-[hsl(var(--no-foreground))] rotate-180" />
            </div>
          </div>
        </div>
        
        {/* Footer info - centered */}
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="font-semibold text-primary truncate">{volume}</div>
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