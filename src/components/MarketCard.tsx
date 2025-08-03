'use client'

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
      <div className="cursor-pointer transition-all duration-300 group hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/25 hover:-translate-y-1 w-full h-[200px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex flex-col h-full justify-between p-4">
        {/* Header with image and title */}
        <div className="flex gap-3 items-center">
          <div className="w-[38px] h-[38px] flex-shrink-0">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Market icon" 
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl rounded-md">
                {getCategoryIcon(category)}
              </div>
            )}
          </div>
          <h3 className="text-[15px] font-semibold leading-tight line-clamp-2 text-foreground flex-1">
            {question}
          </h3>
        </div>
        
        {/* Yes/No Buttons */}
        <div className="flex gap-2">
          <div className="flex-1 bg-[hsl(var(--yes-container))] dark:bg-[hsl(var(--yes)/0.3)] border-0 rounded-md py-3 px-3 h-16 transition-colors duration-150 cursor-pointer hover:bg-[hsl(var(--yes-container)/0.7)] dark:hover:bg-[hsl(var(--yes)/0.4)] group/yes">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold text-[hsl(var(--yes-foreground))] dark:text-[hsl(var(--yes-foreground))] tracking-tight">
                  {yesPercentage}%
                </div>
                <div className="text-xs text-[hsl(var(--yes-foreground)/0.8)] dark:text-[hsl(var(--yes-foreground)/0.7)] uppercase font-medium tracking-wide">
                  {t('card.yes')}
                </div>
              </div>
              <Triangle className="w-4 h-4 fill-current text-[hsl(var(--yes-foreground))] dark:text-[hsl(var(--yes-foreground))]" />
            </div>
          </div>
          <div className="flex-1 bg-[hsl(var(--no-container))] dark:bg-[hsl(var(--no)/0.3)] border-0 rounded-md py-3 px-3 h-16 transition-colors duration-150 cursor-pointer hover:bg-[hsl(var(--no-container)/0.7)] dark:hover:bg-[hsl(var(--no)/0.4)] group/no">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-2xl font-semibold text-[hsl(var(--no-foreground))] dark:text-[hsl(var(--no-foreground))] tracking-tight">
                  {noPercentage}%
                </div>
                <div className="text-xs text-[hsl(var(--no-foreground)/0.8)] dark:text-[hsl(var(--no-foreground)/0.7)] uppercase font-medium tracking-wide">
                  {t('card.no')}
                </div>
              </div>
              <Triangle className="w-4 h-4 fill-current text-[hsl(var(--no-foreground))] dark:text-[hsl(var(--no-foreground))] rotate-180" />
            </div>
          </div>
        </div>
        
        {/* Footer info - professional layout */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-2">
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="font-medium text-foreground truncate text-[11px]">{volume}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
              <Users className="w-3 h-3" />
            </div>
            <div className="font-medium text-foreground text-[11px]">{traders}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3" />
            </div>
            <div className="font-medium text-foreground text-[11px]">
              {new Date(endsAt).toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
          </div>
        </div>
        </div>
      </div>
    </Link>
  )
}