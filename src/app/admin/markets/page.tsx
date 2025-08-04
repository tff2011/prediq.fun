'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const statusColors = {
  ACTIVE: 'bg-green-500',
  CLOSED: 'bg-yellow-500',
  RESOLVED: 'bg-blue-500',
  DISPUTED: 'bg-orange-500',
  CANCELLED: 'bg-red-500',
};

const statusIcons = {
  ACTIVE: Clock,
  CLOSED: XCircle,
  RESOLVED: CheckCircle,
  DISPUTED: AlertCircle,
  CANCELLED: XCircle,
};

export default function AdminMarketsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [eventId, setEventId] = useState<string>();
  const [status, setStatus] = useState<string>();

  const { data: events } = api.admin.getAllEvents.useQuery({
    page: 1,
    limit: 100, // Get all events for the filter
  });

  const { data, isLoading, refetch } = api.admin.getAllMarkets.useQuery({
    page,
    search: search || undefined,
    eventId,
    status,
  });

  const deleteMutation = api.admin.deleteMarket.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this market? This will also delete all associated bets and positions.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Markets</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Markets</h1>
        <Link href="/admin/markets/new">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            New Market
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={eventId || "all"} onValueChange={(value) => setEventId(value === "all" ? undefined : value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events?.events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? undefined : value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="DISPUTED">Disputed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Bets</TableHead>
                    <TableHead>YES %</TableHead>
                    <TableHead>NO %</TableHead>
                    <TableHead>Closes At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.markets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No markets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.markets.map((market) => {
                      const StatusIcon = statusIcons[market.status];
                      return (
                        <TableRow key={market.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">{market.title}</div>
                              {market.description && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {market.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{market.event?.title || 'No Event'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${statusColors[market.status]} text-white`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {market.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              ${Number(market.volume).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {market._count.bets}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-[hsl(var(--yes)/0.1)] text-[hsl(var(--yes))]">
                              {Math.round(Number(market.outcomes.find(o => o.name === 'YES')?.probability || 0.5) * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-[hsl(var(--no)/0.1)] text-[hsl(var(--no))]">
                              {Math.round(Number(market.outcomes.find(o => o.name === 'NO')?.probability || 0.5) * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(market.closesAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin/markets/${market.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(market.id)}
                                disabled={market.status === 'RESOLVED'}
                                className="cursor-pointer text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === data.pagination.totalPages}
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}