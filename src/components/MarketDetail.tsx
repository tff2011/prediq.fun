'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    return (betAmount / odds * 100).toFixed(2)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge variant={getCategoryVariant(data.category)}>
                {data.category}
              </Badge>
              <CardTitle className="text-2xl md:text-3xl">{data.title || data.question}</CardTitle>
              {data.description && (
                <p className="text-muted-foreground mt-2">{data.description}</p>
              )}
            </div>
            <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
              {t(`status.${data.status}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart and Trading */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChartLine className="w-5 h-5" />
                  <CardTitle className="text-lg">{t('event.chart.title')}</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[rgb(var(--yes))]" />
                    <span>SIM {data.oddsYes}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[rgb(var(--no))]" />
                    <span>NÃO {data.oddsNo}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PriceChart data={data} />
            </CardContent>
          </Card>

          {/* Trading Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('event.trading.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all duration-300 ease-in-out ${
                    selectedOutcome === 'yes' 
                      ? 'ring-2 ring-[rgb(var(--yes))] bg-[rgb(var(--yes)/0.1)] shadow-lg' 
                      : 'hover:shadow-lg hover:bg-[rgb(var(--yes)/0.05)] hover:border-[rgb(var(--yes)/0.3)]'
                  }`}
                  onClick={() => setSelectedOutcome('yes')}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <h4 className="text-lg font-bold text-[rgb(var(--yes))]">
                      {t('card.yes')}
                    </h4>
                    <div className="text-2xl font-bold text-foreground">{data.oddsYes}%</div>
                    <p className="text-xs text-muted-foreground">
                      R$ 0,{data.oddsYes.toString().padStart(2, '0')}
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-300 ease-in-out ${
                    selectedOutcome === 'no' 
                      ? 'ring-2 ring-[rgb(var(--no))] bg-[rgb(var(--no)/0.1)] shadow-lg' 
                      : 'hover:shadow-lg hover:bg-[rgb(var(--no)/0.05)] hover:border-[rgb(var(--no)/0.3)]'
                  }`}
                  onClick={() => setSelectedOutcome('no')}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <h4 className="text-lg font-bold text-[rgb(var(--no))]">
                      {t('card.no')}
                    </h4>
                    <div className="text-2xl font-bold text-foreground">{data.oddsNo}%</div>
                    <p className="text-xs text-muted-foreground">
                      R$ 0,{data.oddsNo.toString().padStart(2, '0')}
                    </p>
                  </CardContent>
                </Card>
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
                        <span className="font-semibold text-[rgb(var(--yes))]">
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
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    {t('event.trading.predict')} {selectedOutcome === 'yes' ? t('card.yes') : t('card.no')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Book and Context */}
        <div className="space-y-6">
          {/* Order Book */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                <CardTitle className="text-lg">{t('event.orderbook.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <OrderBook data={data} />
            </CardContent>
          </Card>

          {/* Market Context & Rules */}
          <Card>
            <CardContent className="p-0">
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
                    {data.description || t('event.context.description')}
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comments Section - Full Width */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <CardTitle className="text-lg">{t('event.comments.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CommentsSection marketId={data.id} />
        </CardContent>
      </Card>

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
export function MarketDetail({ market, locale }: { market: any, locale: string }) {
  return <MarketDetailComponent data={market} />
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