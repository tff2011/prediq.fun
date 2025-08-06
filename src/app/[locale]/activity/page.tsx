'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { 
  Activity,
  ExternalLink,
  ChevronDown,
  Bitcoin,
  TrendingUp,
  User,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ActivityPageProps {
  params: {
    locale: string
  }
}

interface ActivityItem {
  id: string
  user: {
    name: string
    address?: string
    avatar?: string
  }
  action: 'bought' | 'sold'
  outcome: 'Yes' | 'No' | 'Up' | 'Down' | 'Giants' | 'Pirates'
  market: {
    title: string
    category: string
    icon?: string
  }
  amount: number
  price: number
  timestamp: string
  txHash?: string
}

// Mock activity data - replace with real API call
const mockActivityData: ActivityItem[] = [
  {
    id: '1',
    user: { name: 'potfund', avatar: '/avatars/1.jpg' },
    action: 'sold',
    outcome: 'No',
    market: { 
      title: 'Will Trump attend Hulk Hogan\'s funeral?', 
      category: 'politics',
      icon: '/avatars/trump.jpg'
    },
    amount: 294,
    price: 98,
    timestamp: '2s ago',
    txHash: '0x1234567890abcdef'
  },
  {
    id: '2',
    user: { name: 'MojAlaki', avatar: '/avatars/2.jpg' },
    action: 'bought',
    outcome: 'No',
    market: { 
      title: 'Will Iran withdraw from the NPT in 2025?', 
      category: 'politics',
      icon: '/flags/iran.jpg'
    },
    amount: 22.80,
    price: 76,
    timestamp: '3s ago',
    txHash: '0x2345678901bcdef0'
  },
  {
    id: '3',
    user: { name: 'dadinyos', avatar: '/avatars/3.jpg' },
    action: 'bought',
    outcome: 'Up',
    market: { 
      title: 'Bitcoin Up or Down - August 5, 7PM ET', 
      category: 'crypto'
    },
    amount: 50.00,
    price: 62,
    timestamp: '14s ago',
    txHash: '0x3456789012cdef01'
  },
  {
    id: '4',
    user: { name: '0x79DbCgK6f24349...', address: '0x79DbCgK6f24349', avatar: '/avatars/4.jpg' },
    action: 'bought',
    outcome: 'Down',
    market: { 
      title: 'Bitcoin Up or Down - August 5, 7PM ET', 
      category: 'crypto'
    },
    amount: 14.80,
    price: 39,
    timestamp: '14s ago',
    txHash: '0x4567890123def012'
  },
  {
    id: '5',
    user: { name: 'brevnmonique997...', avatar: '/avatars/5.jpg' },
    action: 'bought',
    outcome: 'No',
    market: { 
      title: 'Will Andy Beshear win the 2028 US Presidential Election?', 
      category: 'politics',
      icon: '/avatars/beshear.jpg'
    },
    amount: 12.41,
    price: 95,
    timestamp: '16s ago',
    txHash: '0x567890134ef01234'
  }
]

const categories = [
  { value: 'all', label: 'All' },
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'culture', label: 'Culture' },
  { value: 'world', label: 'World' },
  { value: 'economy', label: 'Economy' },
  { value: 'trump', label: 'Trump' }
]

const amountFilters = [
  { value: 'none', label: 'None' },
  { value: '10', label: '$10' },
  { value: '100', label: '$100' },
  { value: '1000', label: '$1,000' },
  { value: '10000', label: '$10,000' },
  { value: '100000', label: '$100,000' }
]

export default function ActivityPage({ params }: ActivityPageProps) {
  const t = useTranslations('navigation')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [amountFilter, setAmountFilter] = useState('none')

  // Filter activities based on selected filters
  const filteredActivities = useMemo(() => {
    return mockActivityData.filter(activity => {
      // Category filter
      if (categoryFilter !== 'all' && activity.market.category !== categoryFilter) {
        return false
      }
      
      // Amount filter
      if (amountFilter !== 'none') {
        const minAmount = parseFloat(amountFilter)
        if (activity.amount < minAmount) {
          return false
        }
      }
      
      return true
    })
  }, [categoryFilter, amountFilter])

  const getOutcomeColor = (outcome: string, action: string) => {
    if (action === 'sold') return 'text-red-500'
    
    switch (outcome.toLowerCase()) {
      case 'yes':
      case 'up':
      case 'giants':
        return 'text-[hsl(var(--yes))]'
      case 'no':
      case 'down':
      case 'pirates':
        return 'text-[hsl(var(--no))]'
      default:
        return 'text-foreground'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crypto':
        return '₿'
      case 'politics':
        return '🗳️'
      case 'sports':
        return '⚽'
      default:
        return '❓'
    }
  }

  const openPolygonScan = (txHash: string) => {
    window.open(`https://polygonscan.com/tx/${txHash}`, '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Activity</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[100px] cursor-pointer">
                {categories.find(c => c.value === categoryFilter)?.label || 'All'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-50 backdrop-blur-sm">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => setCategoryFilter(category.value)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Amount Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px] cursor-pointer">
                Min amount
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-card border border-border shadow-lg z-50 backdrop-blur-sm">
              {amountFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.value}
                  onClick={() => setAmountFilter(filter.value)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {filter.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl p-4 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md">
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="frosted border border-[hsl(var(--border)/0.6)] rounded-xl shadow-web3-1 p-4 hover:shadow-web3-2 hover:-translate-y-0.5 transition-all ease-web3 duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Market Icon */}
                <div className="flex-shrink-0">
                  {activity.market.category === 'crypto' ? (
                    <div className="w-[38px] h-[38px] rounded-md bg-orange-500/20 flex items-center justify-center text-xl">
                      ₿
                    </div>
                  ) : (
                    <div className="w-[38px] h-[38px] rounded-md flex items-center justify-center text-xl">
                      {getCategoryIcon(activity.market.category)}
                    </div>
                  )}
                </div>

                {/* Activity Content - 2 Lines */}
                <div className="flex-1 min-w-0">
                  {/* First Line - Market Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-foreground line-clamp-1">{activity.market.title}</span>
                  </div>
                  
                  {/* Second Line - User Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <span className="font-medium text-foreground">
                      {activity.user.address 
                        ? `${activity.user.address}...` 
                        : activity.user.name
                      }
                    </span>
                    
                    <span>{activity.action}</span>
                    
                    <Badge 
                      variant="secondary" 
                      className={`${getOutcomeColor(activity.outcome, activity.action)} bg-transparent border text-xs`}
                    >
                      {activity.outcome}
                    </Badge>
                    
                    <span>at {activity.price}¢</span>
                    <span>(${activity.amount.toLocaleString()})</span>
                  </div>
                </div>

                {/* Timestamp and Action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                  
                  {activity.txHash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPolygonScan(activity.txHash!)}
                      className="p-1 h-8 w-8 cursor-pointer hover:bg-accent"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activity found</h3>
              <p className="text-muted-foreground">
                No transactions match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}