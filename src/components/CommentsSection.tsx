'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MoreHorizontal, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Comment {
  id: string
  author: {
    id: string
    name: string
    image?: string | null
    verified?: boolean
  }
  content: string
  createdAt: Date
  likesCount: number
  repliesCount: number
  isLiked: boolean
  position?: 'yes' | 'no' | null
}

interface CommentsSectionProps {
  marketId: string
}

export function CommentsSection({ marketId }: CommentsSectionProps) {
  const t = useTranslations('markets')
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [selectedPosition, setSelectedPosition] = useState<'yes' | 'no' | undefined>()
  
  // tRPC queries and mutations
  const { 
    data: commentsData, 
    isLoading, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.comment.getByMarket.useInfiniteQuery(
    { 
      marketId, 
      sortBy,
      limit: 10 
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
    }
  )
  
  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      setNewComment('')
      setAuthorName('')
      setSelectedPosition(undefined)
      void refetch()
      toast.success('Comentário publicado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao publicar comentário')
    }
  })
  
  const toggleLike = api.comment.toggleLike.useMutation({
    onSuccess: () => {
      void refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao curtir comentário')
    }
  })
  
  // Flatten comments from all pages
  const comments = commentsData?.pages.flatMap(page => page.comments) ?? []


  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    
    createComment.mutate({
      marketId,
      content: newComment.trim(),
      position: selectedPosition,
      authorName: authorName.trim() || 'Usuário Anônimo',
    })
  }

  const handleLikeComment = (commentId: string) => {
    toggleLike.mutate({ commentId })
  }

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'agora'
    }
  }

  const getPositionBadge = (position: 'yes' | 'no' | null) => {
    if (!position) return null
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        position === 'yes' 
          ? 'bg-[hsl(var(--yes-container))] dark:bg-[hsl(var(--yes)/0.2)] text-[hsl(var(--yes-foreground))] border border-[hsl(var(--yes)/0.3)]'
          : 'bg-[hsl(var(--no-container))] dark:bg-[hsl(var(--no)/0.2)] text-[hsl(var(--no-foreground))] border border-[hsl(var(--no)/0.3)]'
      }`}>
        {position === 'yes' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
        {position === 'yes' ? 'SIM' : 'NÃO'}
      </div>
    )
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes
    }
    return 0 // Keep original order for 'recent'
  })

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Seu nome (opcional)"
            className="px-3 py-2 text-sm rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={createComment?.isPending}
          />
        </div>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('event.comments.placeholder')}
          className="min-h-[80px] resize-none"
          disabled={createComment?.isPending}
        />
        
        {/* Position Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sua posição:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedPosition(selectedPosition === 'yes' ? undefined : 'yes')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
                selectedPosition === 'yes' 
                  ? 'bg-[hsl(var(--yes-container))] dark:bg-[hsl(var(--yes)/0.3)] text-[hsl(var(--yes-foreground))] border-[hsl(var(--yes)/0.4)]'
                  : 'bg-muted text-muted-foreground hover:bg-[hsl(var(--yes-container))] hover:text-[hsl(var(--yes-foreground))] border-border'
              }`}
            >
              SIM
            </button>
            <button
              type="button"
              onClick={() => setSelectedPosition(selectedPosition === 'no' ? undefined : 'no')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
                selectedPosition === 'no' 
                  ? 'bg-[hsl(var(--no-container))] dark:bg-[hsl(var(--no)/0.3)] text-[hsl(var(--no-foreground))] border-[hsl(var(--no)/0.4)]'
                  : 'bg-muted text-muted-foreground hover:bg-[hsl(var(--no-container))] hover:text-[hsl(var(--no-foreground))] border-border'
              }`}
            >
              NÃO
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {t('event.comments.disclaimer')}
          </span>
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || createComment?.isPending}
            size="sm"
          >
            {createComment?.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {t('event.comments.submit')}
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className="text-sm text-muted-foreground">{t('event.comments.sortBy')}</span>
        <div className="flex gap-1">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('recent')}
            className="text-xs h-7"
          >
            {t('event.comments.recent')}
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('popular')}
            className="text-xs h-7"
          >
            {t('event.comments.popular')}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum comentário ainda.</p>
          <p className="text-xs">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    {comment.author.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {getPositionBadge(comment.position ?? null)}
                    <span className="text-xs text-muted-foreground">{formatTimestamp(comment.createdAt)}</span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t('event.comments.report')}</DropdownMenuItem>
                        <DropdownMenuItem>{t('event.comments.copyLink')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeComment(comment.id)}
                      disabled={toggleLike.isPending}
                      className={`h-7 px-2 ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                      {comment.likesCount}
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {comment.repliesCount}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {t('event.comments.loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}