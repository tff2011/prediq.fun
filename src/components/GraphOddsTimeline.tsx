'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from 'next-themes'

interface OddsData {
  timestamp: string
  oddsYes: number
  oddsNo: number
  date: Date
}

interface GraphOddsTimelineProps {
  marketId: string
}

// Mock data generator - replace with actual data fetching
const generateMockOddsHistory = (days = 30): OddsData[] => {
  const data: OddsData[] = []
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Simulate realistic odds movement
    const baseYes = 1.5 + Math.random() * 0.5
    const variation = Math.sin(i / 5) * 0.2 + Math.random() * 0.1
    
    data.push({
      timestamp: date.toISOString(),
      date: date,
      oddsYes: Number((baseYes + variation).toFixed(2)),
      oddsNo: Number((3 - (baseYes + variation)).toFixed(2))
    })
  }
  
  return data
}

export function GraphOddsTimeline({ marketId }: GraphOddsTimelineProps) {
  const { theme } = useTheme()
  const [oddsHistory, setOddsHistory] = useState<OddsData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setOddsHistory(generateMockOddsHistory())
      setIsLoading(false)
    }, 1000)
  }, [marketId])

  const formatData = oddsHistory.map(item => ({
    ...item,
    date: new Date(item.timestamp).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    })
  }))

  const chartColors = {
    yes: theme === 'dark' ? '#22c55e' : '#16a34a',
    no: theme === 'dark' ? '#ef4444' : '#dc2626',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280'
  }

  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      color: string
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}x
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Odds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Odds</CardTitle>
        <p className="text-sm text-muted-foreground">
          Variação das odds nos últimos 30 dias
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formatData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartColors.text}
                fontSize={12}
              />
              <YAxis 
                stroke={chartColors.text}
                fontSize={12}
                domain={[1, 3]}
                ticks={[1, 1.5, 2, 2.5, 3]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '14px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="oddsYes" 
                stroke={chartColors.yes} 
                strokeWidth={2}
                name="SIM" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="oddsNo" 
                stroke={chartColors.no} 
                strokeWidth={2}
                name="NÃO" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Odds para SIM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Odds para NÃO</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}