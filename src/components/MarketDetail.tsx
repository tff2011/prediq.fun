'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import { TrendingUp, Users, Droplets, Calendar, Info, ChartLine, MessageSquare, FileText, BookOpen, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { PriceChart } from '@/components/charts/PriceChart'
import { OrderBook } from '@/components/trading/OrderBook'
import { CommentsSection } from '@/components/CommentsSection'

interface MarketData {
  id: string
  question?: string
  title?: string
  slug?: string
  description?: string
  endsAt: string
  volume: string
  category: string
  oddsYes: number
  oddsNo: number
  totalBets: number
  liquidity: string
  status: 'active' | 'closed' | 'resolved'
  traders?: number
}

export function MarketDetailComponent({ data }: { data: MarketData }) {
  const t = useTranslations('markets')
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null)
  const [amount, setAmount] = useState('')

  if (!data) return <MarketDetailSkeleton />

  const getCategoryVariant = (cat: string): "default" | "secondary" | "destructive" | "outline" | "politics" | "crypto" | "sports" | "economics" => {
    const categoryMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "politics" | "crypto" | "sports" | "economics"> = {
      'Política': 'politics',
      'Cripto': 'crypto',
      'Esportes': 'sports',
      'Economia': 'economics'
    }
    return categoryMap[cat] ?? 'default'
  }

  const calculatePayout = (outcome: 'yes' | 'no') => {
    const odds = outcome === 'yes' ? data.oddsYes : data.oddsNo
    const betAmount = parseFloat(amount) ?? 0
    return (betAmount / odds * 100).toFixed(2)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-muted/5 rounded-lg p-6">
        <div>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge variant={getCategoryVariant(data.category)}>
                {data.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-semibold">{data.title ?? data.question}</h1>
              {data.description && (
                <p className="text-muted-foreground mt-2">{data.description}</p>
              )}
            </div>
            <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
              {t(`status.${data.status}`)}
            </Badge>
          </div>
        </div>
        <div className="mt-6">
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
                <span>{t('event.stats.totalPredictions')}</span>
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
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart and Trading */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-muted/5 rounded-lg p-6">
            <div className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChartLine className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">{t('event.chart.title')}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--yes))]" />
                    <span>SIM {data.oddsYes}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--no))]" />
                    <span>NAO {data.oddsNo}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <PriceChart data={data} />
            </div>
          </div>

          {/* Trading Interface */}
          <div className="bg-muted/5 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{t('event.trading.title')}</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`cursor-pointer transition-all duration-300 ease-in-out rounded-md p-4 text-center space-y-2 ${
                    selectedOutcome === 'yes' 
                      ? 'ring-2 ring-[hsl(var(--yes))] bg-[hsl(var(--yes)/0.1)]' 
                      : 'hover:bg-[hsl(var(--yes)/0.05)] bg-muted/20'
                  }`}
                  onClick={() => setSelectedOutcome('yes')}
                >
                  <h4 className="text-lg font-bold text-[hsl(var(--yes))]">
                    {t('card.yes')}
                  </h4>
                  <div className="text-2xl font-bold text-foreground">{data.oddsYes}%</div>
                  <p className="text-xs text-muted-foreground">
                    R$ 0,{data.oddsYes.toString().padStart(2, '0')}
                  </p>
                </div>

                <div 
                  className={`cursor-pointer transition-all duration-300 ease-in-out rounded-md p-4 text-center space-y-2 ${
                    selectedOutcome === 'no' 
                      ? 'ring-2 ring-[hsl(var(--no))] bg-[hsl(var(--no)/0.1)]' 
                      : 'hover:bg-[hsl(var(--no)/0.05)] bg-muted/20'
                  }`}
                  onClick={() => setSelectedOutcome('no')}
                >
                  <h4 className="text-lg font-bold text-[hsl(var(--no))]">
                    {t('card.no')}
                  </h4>
                  <div className="text-2xl font-bold text-foreground">{data.oddsNo}%</div>
                  <p className="text-xs text-muted-foreground">
                    R$ 0,{data.oddsNo.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>

              {selectedOutcome && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium text-foreground">{t('event.trading.amount')}</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 w-full p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <div className="p-4 bg-muted rounded-md space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('event.trading.invested')}:</span>
                        <span className="text-foreground">R$ {parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('event.trading.potential')}:</span>
                        <span className="font-semibold text-[hsl(var(--yes))]">
                          R$ {calculatePayout(selectedOutcome)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('event.trading.shares')}:</span>
                        <span className="text-foreground">
                          {Math.floor(parseFloat(amount) / (selectedOutcome === 'yes' ? data.oddsYes : data.oddsNo) * 100)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!amount || (parseFloat(amount) ?? 0) <= 0}
                  >
                    {t('event.trading.predict')} {selectedOutcome === 'yes' ? t('card.yes') : t('card.no')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Order Book and Context */}
        <div className="space-y-6">
          {/* Order Book */}
          <div className="bg-muted/5 rounded-lg p-6">
            <div className="pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                <h3 className="text-lg font-semibold">{t('event.orderbook.title')}</h3>
              </div>
            </div>
            <div>
              <OrderBook data={data} />
            </div>
          </div>

          {/* Market Context & Rules */}
          <div className="bg-muted/5 rounded-lg">
            <div className="p-0">
              <Tabs defaultValue="context" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="context" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('event.context.tab')}
                  </TabsTrigger>
                  <TabsTrigger value="rules" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t('event.rules.tab')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="context" className="p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">{t('event.context.title')}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.description ?? t('event.context.description')}
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>{t('event.context.source')}:</strong> {t('event.context.sourceText')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>{t('event.context.resolution')}:</strong> {t('event.context.resolutionText')}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="rules" className="p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">{t('event.rules.title')}</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {t('event.rules.rule1')}</p>
                    <p>• {t('event.rules.rule2')}</p>
                    <p>• {t('event.rules.rule3')}</p>
                    <p>• {t('event.rules.rule4')}</p>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    {t('event.rules.terms')}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section - Full Width */}
      <div className="bg-muted/5 rounded-lg p-6">
        <div className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{t('event.comments.title')}</h3>
          </div>
        </div>
        <div>
          <CommentsSection marketId={data.id} />
        </div>
      </div>

      {/* Info Alert */}
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
        <Info className="w-5 h-5 text-info mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-semibold mb-1">{t('event.info.title')}</p>
          <p className="text-muted-foreground">
            {t('event.info.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

// Wrapper for new event pages
interface MarketDetailProps {
  market: MarketData
  locale: string
}

export function MarketDetail({ market }: MarketDetailProps) {
  return <MarketDetailComponent data={market} />
}

function MarketDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto bg-muted/5 rounded-lg p-6">
      <div className="mb-6">
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </div>
      <div className="space-y-6">
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
      </div>
    </div>
  )
}