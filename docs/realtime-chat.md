# 🚀 Realtime Chat Architecture

This document outlines the real-time chat system architecture for **prediq.fun**, designed for prediction market discussions and user interactions.

---

## 📌 Technology Stack

| Layer              | Technology                        | Why?                                                    |
|--------------------|-----------------------------------|---------------------------------------------------------|
| **Realtime Engine** | **Supabase Realtime**             | PostgreSQL-native, easy setup, pub/sub built-in.       |
| **Backend**         | **tRPC + Prisma**                 | Type-safe, integrated authentication.                   |
| **Client State**    | **React Query + Optimistic Updates** | Instant updates and dynamic caching.                |
| **UI/UX**          | **Shadcn UI + Sonner (toast)**    | Accessible components with optimized loading.           |

---

## 🔧 Implementation Guide

### 1. **Supabase Realtime Setup (Pub/Sub via PostgreSQL)**

Supabase Realtime listens to PostgreSQL (Neon) changes and broadcasts via WebSocket.

```typescript
// Enable Realtime in Supabase (dashboard)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Activate Realtime for `comments` table
supabase
  .channel('prediction-comments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'comment'
  }, (payload) => {
    // Notify clients about new message
    broadcastMessage(payload.new);
  })
  .subscribe();
```

---

### 2. **Database Schema (Prisma)**

```prisma
// schema.prisma
model Comment {
  id           String   @id @default(uuid())
  text         String
  predictionId String   // Related prediction ID
  userId       String   // Comment author
  createdAt    DateTime @default(now())
  
  // Relations
  user         User     @relation(fields: [userId], references: [id])
  prediction   Market   @relation(fields: [predictionId], references: [id])
  
  @@index([predictionId]) // Optimize queries by prediction
}

model Market {
  id        String    @id @default(uuid())
  title     String
  comments  Comment[]
  // ... other fields
}

model User {
  id       String    @id @default(uuid())
  name     String?
  email    String    @unique
  comments Comment[]
  // ... other fields
}
```

---

### 3. **tRPC API Layer**

```typescript
// server/api/routers/comment.ts
export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      text: z.string().min(1).max(500), 
      predictionId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.create({
        data: {
          text: input.text,
          predictionId: input.predictionId,
          userId: ctx.session.user.id
        },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      });
    }),
  
  // Paginated comment list
  list: publicProcedure
    .input(z.object({ 
      predictionId: z.string(), 
      cursor: z.string().nullish(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: { predictionId: input.predictionId },
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { 
            select: { id: true, name: true, image: true } 
          } 
        }
      });
      
      return {
        comments,
        nextCursor: comments.length === input.limit ? comments[comments.length - 1].id : null
      };
    }),
});
```

---

### 4. **Real-time Client (Next.js Frontend)**

```typescript
// components/Chat.tsx
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc/react";
import { Card, ScrollArea, Input, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

const Chat = ({ predictionId }: { predictionId: string }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Comment[]>([]);

  // Fetch existing comments
  const { data: commentsData } = trpc.comment.list.useQuery({
    predictionId,
    limit: 50
  });

  // Create comment mutation
  const createComment = trpc.comment.create.useMutation({
    onSuccess: (newComment) => {
      // Optimistic update
      setMessages(prev => [newComment, ...prev]);
      toast.success("Comment posted!");
    },
    onError: (error) => {
      toast.error("Failed to post comment");
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`prediction:${predictionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comment',
        filter: `predictionId=eq.${predictionId}`
      }, (payload) => {
        const newComment = payload.new as Comment;
        setMessages(prev => [newComment, ...prev]);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [predictionId]);

  const handleSubmit = (text: string) => {
    if (!session?.user) {
      toast.error("Please login to comment");
      return;
    }

    createComment.mutate({
      text,
      predictionId
    });
  };

  return (
    <Card className="p-4 max-h-[600px] overflow-hidden">
      <ScrollArea className="h-[500px]">
        {messages.map((msg) => (
          <div key={msg.id} className="py-2 border-b border-gray-100">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.user.image || undefined} />
                <AvatarFallback>
                  {msg.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {msg.user.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      
      {/* Comment Input */}
      <div className="mt-4">
        <Input 
          placeholder="Share your thoughts..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const text = e.currentTarget.value.trim();
              if (text) {
                handleSubmit(text);
                e.currentTarget.value = '';
              }
            }
          }}
          disabled={createComment.isLoading}
        />
      </div>
    </Card>
  );
};

export default Chat;
```

---

## 🛡️ Security & Best Practices

### Authentication & Authorization
- **Auth Check:** All mutations use `protectedProcedure` to ensure authenticated users
- **Rate Limiting:** Add rate limiter (e.g., `upstash/ratelimit`) to prevent spam
- **Input Validation:** Use `z.string().max(500)` in Zod to prevent large texts

### Performance Optimization
- **Database Indexes:** Comments table has indexes on `predictionId` for fast queries
- **Pagination:** Implement cursor-based pagination for large comment lists
- **Optimistic Updates:** Update local state before server confirmation

### Real-time Considerations
- **Connection Management:** Properly unsubscribe from channels on component unmount
- **Error Handling:** Graceful fallback when real-time connection fails
- **Message Ordering:** Ensure consistent message ordering across clients

---

## 📲 Scalability Options

### Current Architecture (Supabase Realtime)
- **Pros:** Easy setup, PostgreSQL-native, no additional infrastructure
- **Cons:** Limited to 100 concurrent connections on free tier

### Alternative Solutions
- **Pusher/Ably:** Managed real-time services with SLA guarantees
- **Socket.io:** Self-hosted WebSocket solution
- **Redis Pub/Sub:** For high-scale applications

### Caching Strategy
- **Redis Cache:** Cache recent messages to reduce PostgreSQL load
- **CDN:** Serve static assets and cached content
- **Edge Functions:** Process real-time events at the edge

---

## 📚 Recommended Libraries

| Library                    | Purpose                                    |
|----------------------------|--------------------------------------------|
| `@tanstack/react-query`   | Server state management and caching        |
| `zustand`                 | Global state management                    |
| `sonner`                  | Styled toast notifications                |
| `@radix-ui/avatar`        | Responsive avatar components              |
| `react-intersection-observer` | Infinite scroll implementation        |
| `date-fns`                | Date formatting and manipulation          |

---

## 🎯 Advanced Features

### Mentions (@username)
```typescript
// Parse mentions in comment text
const parseMentions = (text: string) => {
  const mentionRegex = /@(\w+)/g;
  return text.replace(mentionRegex, (match, username) => {
    return `<mention data-username="${username}">${match}</mention>`;
  });
};
```

### Notifications
```typescript
// Send notification when mentioned
const sendNotification = async (userId: string, message: string) => {
  await trpc.notification.create.mutate({
    userId,
    type: 'MENTION',
    message
  });
};
```

### Typing Indicators
```typescript
// Show when users are typing
const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

useEffect(() => {
  const channel = supabase
    .channel(`typing:${predictionId}`)
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      setTypingUsers(prev => new Set([...prev, payload.userId]));
    })
    .subscribe();
}, [predictionId]);
```

---

## 🚀 Getting Started

1. **Setup Supabase Realtime** in your dashboard
2. **Add Comment model** to your Prisma schema
3. **Create tRPC router** for comment operations
4. **Implement Chat component** with real-time subscriptions
5. **Add rate limiting** and input validation
6. **Test with multiple users** to ensure real-time functionality

This architecture provides a robust, scalable real-time chat system perfect for prediction market discussions! 🎯 