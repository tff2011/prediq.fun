'use client'

import { useTranslations } from 'next-intl'

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

interface MarketData {
  id: string
  oddsYes: number
  oddsNo: number
  volume: string
}

interface OrderBookProps {
  data: MarketData
}

export function OrderBook({ data }: OrderBookProps) {
  const t = useTranslations('markets')
  
  // Generate mock order book data
  const generateOrders = (basePrice: number, side: 'buy' | 'sell'): OrderBookEntry[] => {
    const orders: OrderBookEntry[] = []
    let runningTotal = 0
    
    for (let i = 0; i < 8; i++) {
      const priceVariation = side === 'buy' ? -i * 0.5 : i * 0.5
      const price = Math.max(0.01, Math.min(0.99, (basePrice + priceVariation) / 100))
      const amount = Math.floor(Math.random() * 1000) + 100
      runningTotal += amount
      
      orders.push({
        price: price,
        amount: amount,
        total: runningTotal
      })
    }
    
    return orders
  }

  const buyOrdersYes = generateOrders(data.oddsYes, 'buy')
  const sellOrdersYes = generateOrders(data.oddsYes, 'sell')
  const buyOrdersNo = generateOrders(data.oddsNo, 'buy')
  const sellOrdersNo = generateOrders(data.oddsNo, 'sell')

  const maxTotal = Math.max(
    ...buyOrdersYes.map(o => o.total),
    ...sellOrdersYes.map(o => o.total),
    ...buyOrdersNo.map(o => o.total),
    ...sellOrdersNo.map(o => o.total)
  )

  const OrderRow = ({ order, type, maxTotal }: { order: OrderBookEntry, type: 'buy' | 'sell', maxTotal: number }) => {
    const widthPercentage = (order.total / maxTotal) * 100
    const isBuy = type === 'buy'
    
    return (
      <div className="relative flex justify-between items-center px-2 py-1 text-xs hover:bg-muted/30 transition-colors">
        {/* Background bar */}
        <div 
          className={`absolute inset-y-0 right-0 ${
            isBuy ? 'bg-[rgb(var(--yes)/0.1)]' : 'bg-[rgb(var(--no)/0.1)]'
          }`}
          style={{ width: `${widthPercentage}%` }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex justify-between w-full">
          <span className={`font-mono ${
            isBuy ? 'text-[rgb(var(--yes))]' : 'text-[rgb(var(--no))]'
          }`}>
            R$ {order.price.toFixed(3)}
          </span>
          <span className="text-muted-foreground">
            {order.amount.toLocaleString()}
          </span>
          <span className="text-foreground font-medium">
            {order.total.toLocaleString()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* SIM Orders */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-3 h-3 rounded-full bg-[rgb(var(--yes))]" />
          <h4 className="font-semibold text-sm">SIM - {data.oddsYes}%</h4>
        </div>
        
        {/* Header */}
        <div className="flex justify-between px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border">
          <span>{t('event.orderbook.price')}</span>
          <span>{t('event.orderbook.quantity')}</span>
          <span>{t('event.orderbook.total')}</span>
        </div>
        
        {/* Sell Orders (Higher prices) */}
        <div className="space-y-0.5">
          {sellOrdersYes.slice(0, 4).reverse().map((order, index) => (
            <OrderRow 
              key={`sell-yes-${index}`} 
              order={order} 
              type="sell" 
              maxTotal={maxTotal} 
            />
          ))}
        </div>
        
        {/* Current Price */}
        <div className="flex justify-center py-2 border-y border-border">
          <span className="text-sm font-bold text-[rgb(var(--yes))]">
            R$ {(data.oddsYes / 100).toFixed(3)}
          </span>
        </div>
        
        {/* Buy Orders (Lower prices) */}
        <div className="space-y-0.5">
          {buyOrdersYes.slice(0, 4).map((order, index) => (
            <OrderRow 
              key={`buy-yes-${index}`} 
              order={order} 
              type="buy" 
              maxTotal={maxTotal} 
            />
          ))}
        </div>
      </div>
      
      {/* Separator */}
      <div className="border-t border-border pt-4" />
      
      {/* NÃO Orders */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-3 h-3 rounded-full bg-[rgb(var(--no))]" />
          <h4 className="font-semibold text-sm">NÃO - {data.oddsNo}%</h4>
        </div>
        
        {/* Header */}
        <div className="flex justify-between px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border">
          <span>{t('event.orderbook.price')}</span>
          <span>{t('event.orderbook.quantity')}</span>
          <span>{t('event.orderbook.total')}</span>
        </div>
        
        {/* Sell Orders (Higher prices) */}
        <div className="space-y-0.5">
          {sellOrdersNo.slice(0, 4).reverse().map((order, index) => (
            <OrderRow 
              key={`sell-no-${index}`} 
              order={order} 
              type="sell" 
              maxTotal={maxTotal} 
            />
          ))}
        </div>
        
        {/* Current Price */}
        <div className="flex justify-center py-2 border-y border-border">
          <span className="text-sm font-bold text-[rgb(var(--no))]">
            R$ {(data.oddsNo / 100).toFixed(3)}
          </span>
        </div>
        
        {/* Buy Orders (Lower prices) */}
        <div className="space-y-0.5">
          {buyOrdersNo.slice(0, 4).map((order, index) => (
            <OrderRow 
              key={`buy-no-${index}`} 
              order={order} 
              type="buy" 
              maxTotal={maxTotal} 
            />
          ))}
        </div>
      </div>
      
      {/* Summary */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">{t('event.orderbook.spread')} {t('card.yes')}</div>
            <div className="font-medium text-foreground">
              R$ {((sellOrdersYes[0]?.price - buyOrdersYes[0]?.price) * 100).toFixed(1)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">{t('event.orderbook.spread')} {t('card.no')}</div>
            <div className="font-medium text-foreground">
              R$ {((sellOrdersNo[0]?.price - buyOrdersNo[0]?.price) * 100).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}