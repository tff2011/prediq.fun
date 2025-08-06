'use client'

import { useWeb3Auth } from '@/contexts/Web3AuthContext'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Trophy,
  Calendar,
  ExternalLink,
  Copy,
  User,
  DollarSign,
  TrendingDown
} from 'lucide-react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { user } = useWeb3Auth()
  const [activeTab, setActiveTab] = useState('positions')

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      redirect('/')
    }
  }, [user])

  // Get user stats from database
  const { data: userStats, isLoading: statsLoading } = api.user.getStats.useQuery(
    undefined,
    {
      enabled: !!user?.id,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Get user transactions
  const { data: transactions, isLoading: transactionsLoading } = api.user.getTransactions.useQuery(
    { limit: 20 },
    {
      enabled: !!user?.id,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address)
      toast.success(t('addressCopied'))
    }
  }

  // Open wallet in explorer
  const openInExplorer = () => {
    if (user?.address) {
      const explorerUrl = user.chain === 'solana' 
        ? `https://explorer.solana.com/address/${user.address}?cluster=devnet`
        : `https://amoy.polygonscan.com/address/${user.address}`
      window.open(explorerUrl, '_blank')
    }
  }

  if (!user) {
    return null
  }

  // Mock positions data for now (would come from API)
  const positions = []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-8">
          {/* Profile Picture & Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0) || user.address?.slice(2, 4).toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">
                {user.name || `User ${user.address?.slice(0, 6)}`}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.address?.slice(0, 6)}...{user.address?.slice(-4)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="p-1 h-auto hover:bg-muted"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openInExplorer}
                  className="p-1 h-auto hover:bg-muted"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {t('joined')} {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'Jan 2025'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="lg:ml-auto">
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              {t('editProfile')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Portfolio Value */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">{t('stats.portfolioValue')}</span>
              </div>
              <div className="text-2xl font-bold">
                ${((user.totalInvested || 0) + (user.totalWinnings || 0)).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Profit/Loss */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">{t('stats.profitLoss')}</span>
              </div>
              <div className={`text-2xl font-bold ${
                (user.totalWinnings || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(user.totalWinnings || 0) >= 0 ? '+' : ''}${(user.totalWinnings || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Volume Traded */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">{t('stats.volumeTraded')}</span>
              </div>
              <div className="text-2xl font-bold">
                ${(userStats?.totalVolume || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Markets Traded */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">{t('stats.marketsTraded')}</span>
              </div>
              <div className="text-2xl font-bold">
                {userStats?.totalMarkets || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('tabs.positions')}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('tabs.activity')}
            </TabsTrigger>
          </TabsList>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t('tabs.positions')}</h3>
            </div>

            {positions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground mb-2">{t('positions.noPositions')}</div>
                  <p className="text-sm text-muted-foreground">
                    {t('positions.noPositionsDesc')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Positions table header */}
                <div className="hidden lg:grid grid-cols-4 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
                  <div>{t('positions.market')}</div>
                  <div>{t('positions.avg')}</div>
                  <div>{t('positions.current')}</div>
                  <div>{t('positions.value')}</div>
                </div>
                
                {/* Position items would go here */}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{t('tabs.activity')}</h3>
              <Button variant="outline" size="sm">
                {t('activity.minAmount')}
              </Button>
            </div>

            {transactionsLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground">Loading activity...</div>
                </CardContent>
              </Card>
            ) : !transactions?.transactions.length ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground mb-2">{t('activity.noActivity')}</div>
                  <p className="text-sm text-muted-foreground">
                    {t('activity.noActivityDesc')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Activity table header */}
                <div className="hidden lg:grid grid-cols-3 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
                  <div>{t('activity.type')}</div>
                  <div>{t('activity.market')}</div>
                  <div>{t('activity.amount')}</div>
                </div>
                
                {/* Activity items */}
                <div className="space-y-2">
                  {transactions.transactions.map((tx) => (
                    <Card key={tx.id} className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                            tx.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {tx.type === 'DEPOSIT' ? <TrendingUp className="h-4 w-4" /> :
                             tx.type === 'WITHDRAWAL' ? <TrendingDown className="h-4 w-4" /> :
                             <Activity className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{tx.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL' ? 'Account' : 'Market'}
                        </div>
                        <div className="font-semibold">
                          ${tx.amount.toFixed(2)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}