'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { 
  Gift,
  Search,
  Clock,
  DollarSign,
  TrendingUp,
  Info,
  ExternalLink,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface RewardsPageProps {
  params: {
    locale: string
  }
}

interface RewardMarket {
  id: string
  title: string
  category: string
  maxSpread: number
  minShares: number
  totalReward: number
  earnings: {
    yes: number
    no: number
  }
  price: {
    yes: number
    no: number
  }
  completion: number
  icon?: string
}

// Mock rewards data - replace with real API call
const mockRewardsData: RewardMarket[] = [
  {
    id: '1',
    title: 'Will a dildo be thrown onto the court at a WNBA game on Wednesday?',
    category: 'sports',
    maxSpread: 3,
    minShares: 20,
    totalReward: 250,
    earnings: { yes: 15.5, no: 84.5 },
    price: { yes: 15, no: 85 },
    completion: 75,
    icon: '🏀'
  },
  {
    id: '2',
    title: 'Will a dildo be thrown onto the court at a WNBA game on Thursday?',
    category: 'sports',
    maxSpread: 3,
    minShares: 20,
    totalReward: 250,
    earnings: { yes: 27.5, no: 72.5 },
    price: { yes: 28, no: 72 },
    completion: 60,
    icon: '🏀'
  },
  {
    id: '3',
    title: 'Will a dildo be thrown onto the court at a WNBA game on Friday?',
    category: 'sports',
    maxSpread: 3,
    minShares: 20,
    totalReward: 30,
    earnings: { yes: 36, no: 64 },
    price: { yes: 36, no: 64 },
    completion: 80,
    icon: '🏀'
  },
  {
    id: '4',
    title: 'Will a dildo be thrown onto the court at a WNBA game on Saturday?',
    category: 'sports',
    maxSpread: 3,
    minShares: 20,
    totalReward: 30,
    earnings: { yes: 27, no: 73 },
    price: { yes: 27, no: 73 },
    completion: 65,
    icon: '🏀'
  },
  {
    id: '5',
    title: 'Another dildo thrown at WNBA game by Friday?',
    category: 'sports',
    maxSpread: 3,
    minShares: 20,
    totalReward: 200,
    earnings: { yes: 62.5, no: 37.5 },
    price: { yes: 62, no: 38 },
    completion: 90,
    icon: '🏀'
  },
  {
    id: '6',
    title: 'Will Russia capture Dovha Balka by October 31?',
    category: 'politics',
    maxSpread: 3,
    minShares: 20,
    totalReward: 50,
    earnings: { yes: 48, no: 52 },
    price: { yes: 48, no: 52 },
    completion: 70,
    icon: '🗳️'
  },
  {
    id: '7',
    title: 'Will "Freakier Friday" Opening Weekend Box Office be less than $29m?',
    category: 'entertainment',
    maxSpread: 3,
    minShares: 20,
    totalReward: 30,
    earnings: { yes: 47.5, no: 52.5 },
    price: { yes: 47, no: 53 },
    completion: 55,
    icon: '🎬'
  }
]

const categories = [
  { value: 'all', label: 'All' },
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'culture', label: 'Pop Culture' },
  { value: 'world', label: 'Middle East' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Science' }
]

export default function RewardsPage({ params }: RewardsPageProps) {
  const t = useTranslations('rewards')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter markets based on selected filters
  const filteredMarkets = useMemo(() => {
    return mockRewardsData.filter(market => {
      // Category filter
      if (selectedCategory !== 'all' && market.category !== selectedCategory) {
        return false
      }
      
      // Search filter
      if (searchQuery) {
        return market.title.toLowerCase().includes(searchQuery.toLowerCase())
      }
      
      return true
    })
  }, [selectedCategory, searchQuery])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crypto':
        return '₿'
      case 'politics':
        return '🗳️'
      case 'sports':
        return '⚽'
      case 'entertainment':
        return '🎬'
      case 'science':
        return '🔬'
      case 'business':
        return '💼'
      default:
        return '❓'
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount}`
  }

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'bg-green-500'
    if (completion >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const totalEarnings = "0.00"
  const currentDate = "AUG 6 EARNINGS"

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-xl p-6 mb-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">Daily Rewards</h1>
              <p className="text-white/90 max-w-lg">
                Earn rewards by placing orders within the spread. Rewards are distributed directly to wallets every day at midnight UTC. 
                <Link href={`/${params.locale}/rewards/docs`} className="text-white underline ml-1 hover:text-white/80">
                  Learn more
                </Link>
              </p>
            </div>
            
            {/* Earnings Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
              <div className="text-white/70 text-sm font-medium">{currentDate}</div>
              <div className="text-white text-3xl font-bold">${totalEarnings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto">
        {categories.map((category) => {
          const isActive = selectedCategory === category.value
          return (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Markets Table */}
      <div className="rounded-xl p-4 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-muted-foreground border-b border-border/50">
          <div className="col-span-4">Market</div>
          <div className="col-span-1 text-center">Max Spread</div>
          <div className="col-span-1 text-center">Min Shares</div>
          <div className="col-span-1 text-center">Reward</div>
          <div className="col-span-1 text-center">Comp.</div>
          <div className="col-span-2 text-center">Earnings</div>
          <div className="col-span-1 text-center">Percent</div>
          <div className="col-span-1 text-center">Price</div>
        </div>

        {/* Market Rows */}
        <div className="space-y-2 mt-3">
          {filteredMarkets.map((market) => (
            <div
              key={market.id}
              className="frosted border border-[hsl(var(--border)/0.6)] rounded-xl shadow-web3-1 p-3 hover:shadow-web3-2 hover:-translate-y-0.5 transition-all ease-web3 duration-200 cursor-pointer"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Market Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-lg flex-shrink-0">
                    {market.icon || getCategoryIcon(market.category)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2">
                      {market.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">Rules</div>
                  </div>
                </div>

                {/* Max Spread */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-medium">±{market.maxSpread}¢</span>
                </div>

                {/* Min Shares */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-medium">{market.minShares}</span>
                </div>

                {/* Reward */}
                <div className="col-span-1 text-center">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    {formatCurrency(market.totalReward)}
                  </Badge>
                </div>

                {/* Completion */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300", getCompletionColor(market.completion))}
                        style={{ width: `${market.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div className="col-span-2 text-center">
                  <div className="text-xs space-y-1">
                    <div className="text-blue-600">💰 ${market.earnings.yes.toFixed(2)}</div>
                  </div>
                </div>

                {/* Percent */}
                <div className="col-span-1 text-center">
                  <div className="text-xs space-y-1">
                    <div className="text-green-600">Yes {market.earnings.yes}¢</div>
                    <div className="text-red-600">No {market.earnings.no}¢</div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 text-center">
                  <div className="text-xs space-y-1">
                    <div className="text-green-600">Yes {market.price.yes}¢</div>
                    <div className="text-red-600">No {market.price.no}¢</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMarkets.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reward markets found</h3>
              <p className="text-muted-foreground">
                No markets match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>

        {/* Documentation Link */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <Link 
            href={`/${params.locale}/rewards/docs`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Learn more about Liquidity Rewards
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}