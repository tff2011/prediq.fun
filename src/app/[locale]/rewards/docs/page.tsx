'use client'

import { useTranslations } from 'next-intl'
import { 
  BookOpen,
  Gift,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowLeft,
  Info,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

interface RewardsDocsPageProps {
  params: {
    locale: string
  }
}

export default function RewardsDocsPage({ params }: RewardsDocsPageProps) {
  const t = useTranslations('rewards')

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/${params.locale}/rewards`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rewards
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
          <Gift className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground">Liquidity Rewards</h1>
          <p className="text-muted-foreground">Learn how to earn rewards merely by placing trades on Polymarket</p>
        </div>
      </div>

      {/* Content Container */}
      <div className="rounded-xl p-6 border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--card)/0.3)] backdrop-blur-md space-y-8">
        
        {/* Introduction */}
        <section>
          <p className="text-lg text-foreground mb-4">
            With Polymarket's Liquidity Rewards Program, you can earn money by placing limit orders that help keep the market active and balanced.
          </p>
        </section>

        {/* Overview Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">The closer your orders are to the market's average price, the more you earn.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">The reward amount depends on how helpful your orders are in terms of size and pricing compared to others.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">The more competitive your limit orders, the more you can make.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">You get paid daily based on how much your orders add to the market, and can use our Rewards page to check your current earnings for the day, which markets have rewards in place, as well as how much.</p>
            </div>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">The minimum reward payout is <strong>$1</strong>; amounts below this will not be paid.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Simply put, the more you help the market by placing good orders, the more rewards you earn!
            </p>
          </div>
        </section>

        {/* Seeing Rewards Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-500" />
            Seeing Rewards in the Order Book
          </h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Viewing Rewards</h3>
          <div className="space-y-4">
            <p className="text-foreground">
              The total rewards, max spread, and minimum shares required to earn rewards vary by market. You can view the rewards for a given market in its Order Book.
            </p>
            <p className="text-foreground">
              On the Polymarket order book, you can hover over the Rewards text to see the amount of rewards available in total on each market.
            </p>
            <p className="text-foreground">
              The <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">blue highlighted lines</Badge> correspond to the max spread — meaning the farthest distance your limit order can be from the midpoint of the market to earn rewards.
            </p>
            <p className="text-foreground">
              In the example below, because the max spread is <strong>3c</strong>, every order within 3c of the midpoint is eligible for rewards. If the midpoint is &lt; $0.10, you need to have orders on both sides to qualify.
            </p>
          </div>

          {/* Example Visualization */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="text-sm font-medium text-foreground mb-2">Example Order Book with Rewards:</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                <span>Order at 47¢</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Eligible for Rewards</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span>Midpoint: 50¢</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Market Center</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                <span>Order at 53¢</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Eligible for Rewards</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded opacity-60">
                <span>Order at 45¢</span>
                <Badge variant="outline">Outside Max Spread</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Earning Rewards Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-yellow-500" />
            Earning Rewards
          </h2>
          <p className="text-foreground mb-4">
            When your orders are earning rewards you'll see a blue highlight around the clock icon, as shown below:
          </p>

          {/* Visual Example */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-full border-2 border-blue-500">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Your order is earning rewards!</span>
            </div>
          </div>
        </section>

        {/* Learn More Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-purple-500" />
            Learn More
          </h2>
          <div className="space-y-4">
            <p className="text-foreground">
              Rewards are paid out automatically every day at ~midnight UTC. Your history on your portfolio page will reflect rewards paid to your address.
            </p>
            <p className="text-foreground">
              To read more about the specific calculations and formulas that determine rewards, visit our{' '}
              <Link href="#" className="text-primary hover:text-primary/80 underline">
                Rewards Documentation
              </Link>.
            </p>
          </div>

          {/* Key Points */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Daily Payouts</h4>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Rewards are distributed automatically every day at midnight UTC
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">Minimum Payout</h4>
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                You must earn at least $1 in rewards to receive a payout
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-6 border-t border-border/50">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-3">Ready to start earning rewards?</h3>
            <p className="text-muted-foreground mb-6">
              Check out the current reward markets and start placing orders today!
            </p>
            <Link href={`/${params.locale}/rewards`}>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                <Gift className="w-4 h-4 mr-2" />
                View Reward Markets
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}