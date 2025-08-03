'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MoreHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'

interface Comment {
  id: string
  author: {
    name: string
    avatar?: string
    verified?: boolean
  }
  content: string
  timestamp: string
  likes: number
  replies: number
  isLiked: boolean
  position?: 'yes' | 'no' | null
}

interface CommentsSectionProps {
  marketId: string
}

export function CommentsSection({ marketId }: CommentsSectionProps) {
  const t = useTranslations('markets')
  const [newComment, setNewComment] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')

  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: '1',
      author: {
        name: 'Ana Costa',
        avatar: undefined,
        verified: true
      },
      content: 'Baseado nas pesquisas mais recentes, acredito que as chances estão bem equilibradas. O contexto político atual sugere uma disputa acirrada.',
      timestamp: '2 horas atrás',
      likes: 12,
      replies: 3,
      isLiked: false,
      position: 'yes'
    },
    {
      id: '2',
      author: {
        name: 'Carlos Silva',
        avatar: undefined,
        verified: false
      },
      content: 'Discordo totalmente. Os dados históricos mostram uma tendência clara. Apostei pesado no NÃO.',
      timestamp: '4 horas atrás',
      likes: 8,
      replies: 1,
      isLiked: true,
      position: 'no'
    },
    {
      id: '3',
      author: {
        name: 'Maria Santos',
        avatar: undefined,
        verified: false
      },
      content: 'Mercado muito interessante! Vou aguardar mais dados antes de fazer minha previsão. Alguém tem análises técnicas?',
      timestamp: '6 horas atrás',
      likes: 5,
      replies: 7,
      isLiked: false,
      position: null
    },
    {
      id: '4',
      author: {
        name: 'Pedro Lima',
        avatar: undefined,
        verified: true
      },
      content: 'A volatilidade está alta hoje. Boa oportunidade para quem quer entrar agora, mas cuidado com os riscos.',
      timestamp: '8 horas atrás',
      likes: 15,
      replies: 2,
      isLiked: false,
      position: 'yes'
    }
  ]

  const [comments, setComments] = useState<Comment[]>(mockComments)

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: t('event.comments.you'),
        avatar: undefined,
        verified: false
      },
      content: newComment,
      timestamp: t('event.comments.now'),
      likes: 0,
      replies: 0,
      isLiked: false,
      position: null
    }

    setComments([comment, ...comments])
    setNewComment('')
  }

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ))
  }

  const getPositionBadge = (position: 'yes' | 'no' | null) => {
    if (!position) return null
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        position === 'yes' 
          ? 'bg-[rgb(var(--yes)/0.1)] text-[rgb(var(--yes))] border border-[rgb(var(--yes)/0.2)]'
          : 'bg-[rgb(var(--no)/0.1)] text-[rgb(var(--no))] border border-[rgb(var(--no)/0.2)]'
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
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('event.comments.placeholder')}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {t('event.comments.disclaimer')}
          </span>
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            size="sm"
          >
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
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatar} />
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
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  
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
                    className={`h-7 px-2 ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likes}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {comment.replies}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="outline" size="sm" className="w-full">
          {t('event.comments.loadMore')}
        </Button>
      </div>
    </div>
  )
}