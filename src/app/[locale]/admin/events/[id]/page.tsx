'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Skeleton } from '~/components/ui/skeleton';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EventStatus } from '@prisma/client';

const categories = [
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'economics', label: 'Economics' },
  { value: 'technology', label: 'Technology' },
  { value: 'science', label: 'Science' },
  { value: 'other', label: 'Other' },
];

const sports = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'mma', label: 'MMA' },
  { value: 'boxing', label: 'Boxing' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'esports', label: 'E-Sports' },
  { value: 'other', label: 'Other' },
];

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    sport: '',
    startsAt: '',
    endsAt: '',
    imageUrl: '',
    venue: '',
    featured: false,
    status: 'UPCOMING' as EventStatus,
  });

  const { data: event, isLoading } = api.event.getById.useQuery(params.id);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        subtitle: event.subtitle || '',
        description: event.description || '',
        category: event.category,
        sport: event.sport || '',
        startsAt: new Date(event.startsAt).toISOString().slice(0, 16),
        endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : '',
        imageUrl: event.imageUrl || '',
        venue: event.venue || '',
        featured: event.featured,
        status: event.status,
      });
    }
  }, [event]);

  const updateMutation = api.admin.updateEvent.useMutation({
    onSuccess: () => {
      router.push('/admin/events');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = {
      id: params.id,
      ...formData,
      startsAt: new Date(formData.startsAt),
      endsAt: formData.endsAt ? new Date(formData.endsAt) : undefined,
      subtitle: formData.subtitle || undefined,
      description: formData.description || undefined,
      sport: formData.sport || undefined,
      imageUrl: formData.imageUrl || undefined,
      venue: formData.venue || undefined,
    };

    updateMutation.mutate(data);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => updateField('status', value as EventStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="2024 US Presidential Election"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Who will win the presidency?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Detailed description of the event..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => updateField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category === 'sports' && (
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select 
                    value={formData.sport} 
                    onValueChange={(value) => updateField('sport', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.value} value={sport.value}>
                          {sport.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start Date & Time *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => updateField('startsAt', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">End Date & Time</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => updateField('endsAt', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => updateField('venue', e.target.value)}
                placeholder="Madison Square Garden, New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked: boolean) => updateField('featured', checked)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Event
              </Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
              <Link href="/admin/events">
                <Button type="button" variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {event && event.markets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Associated Markets ({event.markets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.markets.map((market) => (
                <div key={market.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{market.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Volume: ${Number(market.volume).toLocaleString()} • 
                    Bets: {market._count.bets}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}