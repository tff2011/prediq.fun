'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface PriceData {
  time: string
  yes: number
  no: number
}

interface MarketData {
  id: string
  oddsYes: number
  oddsNo: number
}

interface PriceChartProps {
  data: MarketData
}

export function PriceChart({ data }: PriceChartProps) {
  const t = useTranslations('markets')
  const [timeframe, setTimeframe] = useState('24h')

  // Generate deterministic mock data based on market ID
  const generateMockData = (hours: number): PriceData[] => {
    const now = new Date()
    const mockData: PriceData[] = []
    
    // Use market ID to seed deterministic pseudo-random
    const seed = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const baseYes = data.oddsYes
      const baseNo = data.oddsNo
      
      // Generate deterministic variation based on seed and index
      const yesVariation = ((Math.sin(seed + i * 0.1) + 1) / 2 - 0.5) * 10
      const noVariation = ((Math.cos(seed + i * 0.1) + 1) / 2 - 0.5) * 10
      
      mockData.push({
        time: time.toISOString(),
        yes: Math.max(5, Math.min(95, baseYes + yesVariation)),
        no: Math.max(5, Math.min(95, baseNo + noVariation))
      })
    }
    
    return mockData
  }

  const getHoursFromTimeframe = (tf: string): number => {
    switch (tf) {
      case '1h': return 1
      case '24h': return 24
      case '7d': return 24 * 7
      case '30d': return 24 * 30
      default: return 24
    }
  }

  const chartData = generateMockData(getHoursFromTimeframe(timeframe))
  
  // Calculate chart dimensions and scaling
  const chartWidth = 100 // percentage
  const chartHeight = 200 // pixels
  const maxValue = 100
  const minValue = 0
  
  // Generate SVG path for line chart
  const generatePath = (values: number[], _color: 'yes' | 'no'): string => {
    if (values.length === 0) return ''
    
    const stepX = chartWidth / (values.length - 1)
    
    return values
      .map((value, index) => {
        const x = (index * stepX)
        const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const yesValues = chartData.map(d => d.yes)
  const noValues = chartData.map(d => d.no)
  
  const yesPath = generatePath(yesValues, 'yes')
  const noPath = generatePath(noValues, 'no')

  return (
    <div className="space-y-4">
      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {['1h', '24h', '7d', '30d'].map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className="text-xs"
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative bg-muted/20 rounded-lg p-4">
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          {/* Grid Lines */}
          <svg 
            width="100%" 
            height={chartHeight} 
            className="absolute inset-0"
            preserveAspectRatio="none"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((value) => {
              const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
              return (
                <g key={value}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <text
                    x="-5"
                    y={y + 3}
                    fontSize="10"
                    fill="hsl(var(--muted-foreground))"
                    textAnchor="end"
                  >
                    {value}%
                  </text>
                </g>
              )
            })}
            
            {/* Chart Lines */}
            <path
              d={yesPath}
              fill="none"
              stroke="hsl(var(--yes))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={noPath}
              fill="none"
              stroke="hsl(var(--no))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {/* Current Price Indicators */}
          <div className="absolute top-4 right-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--yes))]" />
              <span className="font-medium text-[hsl(var(--yes-foreground))]">
                SIM {data.oddsYes}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--no))]" />
              <span className="font-medium text-[hsl(var(--no-foreground))]">
                NÃO {data.oddsNo}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Time Labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>
            {timeframe === '1h' ? t('event.chart.timeframes.lastHour') : 
             timeframe === '24h' ? t('event.chart.timeframes.last24h') :
             timeframe === '7d' ? t('event.chart.timeframes.last7d') : t('event.chart.timeframes.last30d')}
          </span>
          <span>{t('event.chart.timeframes.now')}</span>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-[hsl(var(--yes-container))] dark:bg-[hsl(var(--yes)/0.2)] rounded-lg border border-[hsl(var(--yes)/0.3)]">
          <div className="text-[hsl(var(--yes-foreground))] font-medium">SIM</div>
          <div className="text-lg font-bold text-foreground">{data.oddsYes}%</div>
          <div className="text-xs text-muted-foreground">
            +{Math.abs(data.oddsYes - 50).toFixed(1)}% {t('event.chart.change.today')}
          </div>
        </div>
        <div className="p-3 bg-[hsl(var(--no-container))] dark:bg-[hsl(var(--no)/0.2)] rounded-lg border border-[hsl(var(--no)/0.3)]">
          <div className="text-[hsl(var(--no-foreground))] font-medium">NÃO</div>
          <div className="text-lg font-bold text-foreground">{data.oddsNo}%</div>
          <div className="text-xs text-muted-foreground">
            {data.oddsNo > 50 ? '+' : '-'}{Math.abs(data.oddsNo - 50).toFixed(1)}% {t('event.chart.change.today')}
          </div>
        </div>
      </div>
    </div>
  )
}