'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { 
  Trophy,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface LeaderboardPageProps {
  params: {
    locale: string
  }
}

interface LeaderUser {
  id: string
  rank: number
  name: string
  address?: string
  avatar?: string
  volume?: number
  profit?: number
  isCurrentUser?: boolean
}

// Mock leaderboard data - replace with real API call
const mockVolumeData: LeaderUser[] = [
  { id: '1', rank: 1, name: 'HyperLiquid0xb', avatar: '/avatars/1.jpg', volume: 15128092 },
  { id: '2', rank: 2, name: 'chubbito', avatar: '/avatars/2.jpg', volume: 6124410 },
  { id: '3', rank: 3, name: '0x7fB7Ad0d194D7123e711e7db6C9D41...', address: '0x7fB7Ad0d194D7123e711e7db6C9D41', avatar: '/avatars/3.jpg', volume: 5625018 },
  { id: '4', rank: 4, name: 'InfiniteCrypt0', avatar: '/avatars/4.jpg', volume: 4198636 },
  { id: '5', rank: 5, name: '0xb68.568', address: '0xb68568', avatar: '/avatars/5.jpg', volume: 2979242 },
  { id: '6', rank: 6, name: 'bestfriends', avatar: '/avatars/6.jpg', volume: 2940769 },
  { id: '7', rank: 7, name: '0xFBA6aF103a629A538664136a418300...', address: '0xFBA6aF103a629A538664136a418300', avatar: '/avatars/7.jpg', volume: 2928157 },
  { id: '8', rank: 8, name: 'ComTruise', avatar: '/avatars/8.jpg', volume: 2920181 },
  { id: '9', rank: 9, name: '0xfb1.63e', address: '0xfb163e', avatar: '/avatars/9.jpg', volume: 2822300 },
  { id: '10', rank: 10, name: 'Dragonfly-Capital', avatar: '/avatars/10.jpg', volume: 2599209 },
  { id: '11', rank: 11, name: 'Ziigmund', avatar: '/avatars/11.jpg', volume: 2511584 },
  { id: '12', rank: 12, name: 'wokerjoesleeper', avatar: '/avatars/12.jpg', volume: 2408483 },
  { id: '13', rank: 13, name: '0x7694E0Af0d79Cb4cF15319b51468c6...', address: '0x7694E0Af0d79Cb4cF15319b51468c6', avatar: '/avatars/13.jpg', volume: 2091401 },
  { id: '14', rank: 14, name: '0x3d2.360', address: '0x3d2360', avatar: '/avatars/14.jpg', volume: 2043415 },
  { id: '15', rank: 15, name: 'nxyobrp', avatar: '/avatars/15.jpg', volume: 1970737 },
  { id: '16', rank: 16, name: 'interstellaar', avatar: '/avatars/16.jpg', volume: 1797105 },
  { id: '17', rank: 17, name: 'printa', avatar: '/avatars/17.jpg', volume: 1559356 }
]

const mockProfitData: LeaderUser[] = [
  { id: '1', rank: 1, name: 'HyperLiquid0xb', avatar: '/avatars/1.jpg', profit: 1166916 },
  { id: '2', rank: 2, name: 'bestfriends', avatar: '/avatars/2.jpg', profit: 220762 },
  { id: '3', rank: 3, name: 'thebtcbear', avatar: '/avatars/3.jpg', profit: 171701 },
  { id: '4', rank: 4, name: 'knoxgold', avatar: '/avatars/4.jpg', profit: 118940 },
  { id: '5', rank: 5, name: 'prematch', avatar: '/avatars/5.jpg', profit: 116498 },
  { id: '6', rank: 6, name: 'okokokok12', avatar: '/avatars/6.jpg', profit: 100656 },
  { id: '7', rank: 7, name: 'lifeones', avatar: '/avatars/7.jpg', profit: 100610 },
  { id: '8', rank: 8, name: 'nxyobrp', avatar: '/avatars/8.jpg', profit: 92602 },
  { id: '9', rank: 9, name: 'ContactUsFAQ', avatar: '/avatars/9.jpg', profit: 90049 },
  { id: '10', rank: 10, name: 'JordanistheGoat', avatar: '/avatars/10.jpg', profit: 86574 },
  { id: '11', rank: 11, name: 'ACEE123', avatar: '/avatars/11.jpg', profit: 72278 },
  { id: '12', rank: 12, name: 'poofiee', avatar: '/avatars/12.jpg', profit: 63381 },
  { id: '13', rank: 13, name: 'chubbito', avatar: '/avatars/13.jpg', profit: 60005 },
  { id: '14', rank: 14, name: 'The Spirit of Ukraine-UMA', avatar: '/avatars/14.jpg', profit: 55236 },
  { id: '15', rank: 15, name: 'setsukōworldchampion2026', avatar: '/avatars/15.jpg', profit: 54172 },
  { id: '16', rank: 16, name: 'Bertapotamous', avatar: '/avatars/16.jpg', profit: 49829 },
  { id: '17', rank: 17, name: 'ckw', avatar: '/avatars/17.jpg', profit: 46936 }
]

const timePeriods = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All' }
]

export default function LeaderboardPage({ params }: LeaderboardPageProps) {
  const t = useTranslations('navigation')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedTab, setSelectedTab] = useState<'volume' | 'profit'>('volume')

  const currentData = selectedTab === 'volume' ? mockVolumeData : mockProfitData

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900'
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  // Mock countdown timer
  const resetTime = "28d 4h 49m 38s"

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        </div>

        {/* Time Period Filters */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {timePeriods.map((period) => {
            const isActive = selectedPeriod === period.value
            return (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  // Base styling
                  "relative px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer",
                  "navbar-category", // This applies the LVHA styles from CSS
                  // Underline effect
                  "after:pointer-events-none after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[3px] after:rounded-full after:bg-primary after:transition-all after:duration-200",
                  // Active state class
                  isActive ? "active" : "",
                  // Underline states
                  isActive 
                    ? "after:opacity-100 after:scale-x-100" 
                    : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
                )}
              >
                {period.label}
              </button>
            )
          })}
        </div>

        {/* Reset Timer */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Resets in {resetTime}</span>
        </div>
      </div>

      {/* Rankings Container */}
      <div className="rounded-xl p-4 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md">
        {/* Volume and Profit Tabs */}
        <div className="grid grid-cols-2 gap-6">
          {/* Volume Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-foreground">Volume</h2>
            </div>
            
            <div className="space-y-2">
              {mockVolumeData.map((user) => (
                <div
                  key={user.id}
                  className="frosted border border-[hsl(var(--border)/0.6)] rounded-xl shadow-web3-1 p-3 hover:shadow-web3-2 hover:-translate-y-0.5 transition-all ease-web3 duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      getRankBadgeColor(user.rank)
                    )}>
                      {user.rank}
                    </div>

                    {/* User Avatar */}
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {user.address 
                          ? `${user.address}...` 
                          : user.name
                        }
                      </span>
                    </div>

                    {/* Volume */}
                    <div className="text-sm font-semibold text-foreground flex-shrink-0">
                      {formatCurrency(user.volume!)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-foreground">Profit</h2>
            </div>
            
            <div className="space-y-2">
              {mockProfitData.map((user) => (
                <div
                  key={user.id}
                  className="frosted border border-[hsl(var(--border)/0.6)] rounded-xl shadow-web3-1 p-3 hover:shadow-web3-2 hover:-translate-y-0.5 transition-all ease-web3 duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      getRankBadgeColor(user.rank)
                    )}>
                      {user.rank}
                    </div>

                    {/* User Avatar */}
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {user.address 
                          ? `${user.address}...` 
                          : user.name
                        }
                      </span>
                    </div>

                    {/* Profit */}
                    <div className="text-sm font-semibold text-green-500 flex-shrink-0">
                      {formatCurrency(user.profit!)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}