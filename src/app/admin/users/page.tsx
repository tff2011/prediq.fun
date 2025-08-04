'use client';

import { useState } from 'react';
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
  Search, 
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Ban,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>();

  const { data, isLoading, refetch } = api.admin.getAllUsers.useQuery({
    page,
    search: search || undefined,
    status: status as "active" | "suspended" | undefined,
  });

  const suspendMutation = api.admin.suspendUser.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const activateMutation = api.admin.activateUser.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const updateBalanceMutation = api.admin.updateUserBalance.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleSuspend = (userId: string) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      suspendMutation.mutate(userId);
    }
  };

  const handleActivate = (userId: string) => {
    activateMutation.mutate(userId);
  };

  const handleAddBalance = (userId: string) => {
    const amount = prompt('Enter amount to add:');
    if (amount && !isNaN(Number(amount))) {
      updateBalanceMutation.mutate({
        userId,
        amount: Number(amount),
        operation: 'add',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
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
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Total: {data?.pagination.total || 0}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? undefined : value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Total Wagered</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.users.map((user) => {
                      const profitLoss = Number(user.balance) - 1000; // Assuming 1000 starting balance
                      const isProfitable = profitLoss >= 0;
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">
                              {user.name || 'Anonymous'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-medium">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {Number(user.balance).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              ${Number(user.totalInvested).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={isProfitable ? 'text-green-600' : 'text-red-600'}
                            >
                              {isProfitable ? '+' : ''}{profitLoss.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {user.emailVerified ? format(new Date(user.emailVerified), 'MMM d, yyyy') : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {false ? (
                              <Badge variant="destructive">
                                <Ban className="h-3 w-3 mr-1" />
                                Suspended
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="cursor-pointer"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleAddBalance(user.id)}
                                  className="cursor-pointer"
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Add Balance
                                </DropdownMenuItem>
                                {false ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleActivate(user.id)}
                                    className="cursor-pointer text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleSuspend(user.id)}
                                    className="cursor-pointer text-destructive"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {data?.stats.activeUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspended Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {data?.stats.suspendedUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {Number(data?.stats.totalBalance || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}