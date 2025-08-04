'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Slider } from '~/components/ui/slider';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function NewMarketPage() {
  const router = useRouter();
  const [eventId, setEventId] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [resolvesAt, setResolvesAt] = useState('');
  const [initialYesPrice, setInitialYesPrice] = useState(0.5);
  const [error, setError] = useState('');

  const { data: events } = api.admin.getAllEvents.useQuery({
    page: 1,
    limit: 100,
    status: "LIVE",
  });

  const createMutation = api.admin.createMarket.useMutation({
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

    if (!eventId || !question || !closesAt) {
      setError('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      eventId,
      question,
      description: description || undefined,
      closesAt: new Date(closesAt),
      resolvesAt: resolvesAt ? new Date(resolvesAt) : undefined,
      initialYesPrice,
    });
  };

  // Set default dates (closes in 7 days, resolves in 8 days)
  const defaultClosesAt = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm");
  const defaultResolvesAt = format(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/markets">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Market</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Market</CardTitle>
          <CardDescription>
            Create a new prediction market with YES/NO outcomes
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
              <Label htmlFor="event">Event *</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                type="text"
                placeholder="Will Brazil win the 2026 World Cup?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional details about the market..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createMutation.isPending}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closesAt">Closes At *</Label>
                <Input
                  id="closesAt"
                  type="datetime-local"
                  value={closesAt || defaultClosesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolvesAt">Resolves At</Label>
                <Input
                  id="resolvesAt"
                  type="datetime-local"
                  value={resolvesAt || defaultResolvesAt}
                  onChange={(e) => setResolvesAt(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial YES Probability</Label>
              <div className="space-y-4">
                <Slider
                  id="initialPrice"
                  min={1}
                  max={99}
                  step={1}
                  value={[initialYesPrice * 100]}
                  onValueChange={(value) => setInitialYesPrice((value[0] ?? 50) / 100)}
                  disabled={createMutation.isPending}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-24 text-center p-2 rounded bg-[hsl(var(--yes)/0.1)] text-[hsl(var(--yes))]">
                      YES: {Math.round(initialYesPrice * 100)}%
                    </div>
                    <div className="w-24 text-center p-2 rounded bg-[hsl(var(--no)/0.1)] text-[hsl(var(--no))]">
                      NO: {Math.round((1 - initialYesPrice) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="cursor-pointer"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Market'
                )}
              </Button>
              <Link href="/admin/markets">
                <Button type="button" variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}