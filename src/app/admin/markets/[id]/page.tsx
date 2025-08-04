'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function EditMarketPage() {
  const router = useRouter();
  const params = useParams();
  const marketId = params.id as string;

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [resolvesAt, setResolvesAt] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [winningOutcome, setWinningOutcome] = useState<'YES' | 'NO'>('YES');

  // getById expects an object with select/include; guard enable until id exists
  const { data: market, isLoading } = api.market.getById.useQuery(
    { id: marketId },
    { enabled: !!marketId }
  );

  useEffect(() => {
    if (market) {
      // Align with current Market type fields
      setQuestion((market as any).title ?? (market as any).question ?? '');
      setDescription((market as any).description ?? '');
      setClosesAt(format(new Date((market as any).closesAt ?? (market as any).closesAt), "yyyy-MM-dd'T'HH:mm"));
      const resolvedAt = (market as any).resolvedAt ?? (market as any).resolvesAt ?? null;
      setResolvesAt(resolvedAt ? format(new Date(resolvedAt), "yyyy-MM-dd'T'HH:mm") : '');
      setStatus((market as any).status ?? '');
    }
  }, [market]);

  const updateMutation = api.admin.updateMarket.useMutation({
    onSuccess: () => {
      router.push('/admin/markets');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const resolveMutation = api.admin.resolveMarket.useMutation({
    onSuccess: () => {
      router.push('/admin/markets');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    updateMutation.mutate({
      id: marketId,
      question,
      description: description || undefined,
      closesAt: new Date(closesAt),
      resolvesAt: resolvesAt ? new Date(resolvesAt) : undefined,
      status: status as any,
    });
  };

  const handleResolve = () => {
    resolveMutation.mutate({
      marketId,
      winningOutcome,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Market not found</AlertTitle>
          <AlertDescription>
            The market you are looking for does not exist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const yesOutcome = market.outcomes.find(o => o.name === 'YES');
  const noOutcome = market.outcomes.find(o => o.name === 'NO');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/markets">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Market</h1>
        </div>
        {market.status === 'ACTIVE' && (
          <Button
            variant="outline"
            onClick={() => setShowResolveDialog(true)}
            className="cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolve Market
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Market Details</CardTitle>
            <Badge className={`${market.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
              {market.status}
            </Badge>
          </div>
          <CardDescription>
            Event: {(market as any).event?.title ?? '—'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                disabled={updateMutation.isPending || market.status === 'RESOLVED'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={updateMutation.isPending || market.status === 'RESOLVED'}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closesAt">Closes At</Label>
                <Input
                  id="closesAt"
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  required
                  disabled={updateMutation.isPending || market.status === 'RESOLVED'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolvesAt">Resolves At</Label>
                <Input
                  id="resolvesAt"
                  type="datetime-local"
                  value={resolvesAt}
                  onChange={(e) => setResolvesAt(e.target.value)}
                  disabled={updateMutation.isPending || market.status === 'RESOLVED'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                disabled={updateMutation.isPending || market.status === 'RESOLVED'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Probabilities</Label>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-lg bg-[hsl(var(--yes)/0.1)] text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--yes))]">
                    {yesOutcome ? Math.round(Number(yesOutcome.probability) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">YES</div>
                </div>
                <div className="flex-1 p-4 rounded-lg bg-[hsl(var(--no)/0.1)] text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--no))]">
                    {noOutcome ? Math.round(Number(noOutcome.probability) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">NO</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Volume:</span>{' '}
                <span className="font-medium">${Number(market.volume).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Bets:</span>{' '}
                <span className="font-medium">{market._count.bets}</span>
              </div>
            </div>

            {market.status !== 'RESOLVED' && (
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="cursor-pointer"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Link href="/admin/markets">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    Cancel
                  </Button>
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {showResolveDialog && (
        <Card>
          <CardHeader>
            <CardTitle>Resolve Market</CardTitle>
            <CardDescription>
              Select the winning outcome. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Winning Outcome</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={winningOutcome === 'YES' ? 'default' : 'outline'}
                  onClick={() => setWinningOutcome('YES')}
                  className="cursor-pointer"
                >
                  YES
                </Button>
                <Button
                  variant={winningOutcome === 'NO' ? 'default' : 'outline'}
                  onClick={() => setWinningOutcome('NO')}
                  className="cursor-pointer"
                >
                  NO
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Resolving the market will:
                <ul className="list-disc list-inside mt-2">
                  <li>Pay out winners based on their shares</li>
                  <li>Mark the market as resolved</li>
                  <li>Prevent any further trading</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                className="cursor-pointer"
              >
                {resolveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  'Resolve Market'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResolveDialog(false)}
                disabled={resolveMutation.isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}