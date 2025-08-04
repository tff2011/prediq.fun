'use client';

import { api } from '~/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { 
  Calendar, 
  BarChart3, 
  Users, 
  TrendingUp,
  Activity,
  DollarSign 
} from 'lucide-react';
import { getAdminToken } from '~/utils/adminAuth';

export default function AdminDashboard() {
  const token = getAdminToken();
  
  const { data: stats, isLoading } = api.admin.getStats.useQuery(undefined, {
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Events',
      value: stats?.totalEvents ?? 0,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Live Events',
      value: stats?.liveEvents ?? 0,
      icon: Activity,
      color: 'text-green-600',
    },
    {
      title: 'Total Markets',
      value: stats?.totalMarkets ?? 0,
      icon: BarChart3,
      color: 'text-purple-600',
    },
    {
      title: 'Active Markets',
      value: stats?.activeMarkets ?? 0,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-indigo-600',
    },
    {
      title: 'Total Volume',
      value: `$${Number(stats?.totalVolume ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Activity feed coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}