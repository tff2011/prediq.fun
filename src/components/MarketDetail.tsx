'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { TrendingUp, Users, Droplets, Calendar, Info } from 'lucide-react'
import { useState } from 'react'

interface MarketData {
  id: string
  question: string
  description?: string
  endsAt: string
  volume: string
  category: string
  oddsYes: number
  oddsNo: number
  totalBets: number
  liquidity: string
  status: 'active' | 'closed' | 'resolved'
}

export function MarketDetailComponent({ data }: { data: MarketData }) {
  const t = useTranslations('markets')
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null)
  const [amount, setAmount] = useState('')

  if (!data) return <MarketDetailSkeleton />

  const getCategoryVariant = (cat: string): any => {
    const categoryMap: Record<string, any> = {
      'Política': 'politics',
      'Cripto': 'crypto',
      'Esportes': 'sports',
      'Economia': 'economics'
    }
    return categoryMap[cat] || 'default'
  }

  const calculatePayout = (outcome: 'yes' | 'no') => {
    const odds = outcome === 'yes' ? data.oddsYes : data.oddsNo
    const betAmount = parseFloat(amount) || 0
    return (betAmount * odds).toFixed(2)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge variant={getCategoryVariant(data.category)}>
                {data.category}
              </Badge>
              <CardTitle className="text-2xl md:text-3xl">{data.question}</CardTitle>
              {data.description && (
                <p className="text-muted-foreground mt-2">{data.description}</p>
              )}
            </div>
            <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
              {t(`status.${data.status}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>{t('card.volume')}</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{data.volume}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Total de Apostas</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{data.totalBets.toLocaleString('pt-BR')}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="w-4 h-4" />
                <span>{t('card.liquidity')}</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{data.liquidity}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{t('card.closes')}</span>
              </div>
              <p className="text-xl font-semibold text-foreground">
                {new Date(data.endsAt).toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Betting Interface */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Fazer Aposta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedOutcome === 'yes' 
                    ? 'ring-2 ring-success bg-success/10' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedOutcome('yes')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <h4 className="text-xl font-bold text-success">
                    {t('card.yes')}
                  </h4>
                  <div className="text-3xl font-bold text-foreground">{data.oddsYes}x</div>
                  <p className="text-sm text-muted-foreground">
                    Probabilidade: {(100 / data.oddsYes).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedOutcome === 'no' 
                    ? 'ring-2 ring-destructive bg-destructive/10' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedOutcome('no')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <h4 className="text-xl font-bold text-destructive">
                    {t('card.no')}
                  </h4>
                  <div className="text-3xl font-bold text-foreground">{data.oddsNo}x</div>
                  <p className="text-sm text-muted-foreground">
                    Probabilidade: {(100 / data.oddsNo).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {selectedOutcome && (
              <Card className="mt-4">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Valor da Aposta (R$)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <div className="p-4 bg-muted rounded-md space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aposta:</span>
                        <span className="text-foreground">R$ {parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Retorno potencial:</span>
                        <span className="font-semibold text-success">
                          R$ {calculatePayout(selectedOutcome)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    Apostar {selectedOutcome === 'yes' ? t('card.yes') : t('card.no')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
            <Info className="w-5 h-5 text-info mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">Como funciona?</p>
              <p className="text-muted-foreground">
                Compre ações de SIM ou NÃO. Se sua previsão estiver correta quando o mercado 
                resolver, cada ação valerá R$1. Você pode vender suas ações a qualquer momento 
                antes da resolução.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MarketDetailSkeleton() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}