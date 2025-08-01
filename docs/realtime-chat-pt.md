# 🚀 Arquitetura para Sistema de Chat em Tempo Real

Baseado na sua stack atual (**T3 Stack + Neon + Prisma + NextAuth**) e no desejo de usar as tecnologias mais modernas, aqui está uma solução robusta e escalável:

---

## 📌 Componentes Necessários:

| Camada             | Tecnologia Escolhida                     | Por quê?                                                   |
|--------------------|------------------------------------------|------------------------------------------------------------|
| **Realtime Engine**  | **Supabase Realtime**                     | Integrado com PostgreSQL (Neon), fácil setup, pub/sub nativo. |
| **Backend**          | **tRPC + Prisma**                        | Tipagem forte, autenticação integrada.                     |
| **Estado do Client** | **React Query + Optimistic Updates**     | Atualizações instantâneas e cache dinâmico.                |
| **UI/UX**           | **Shadcn UI + Sonner (toast)**           | Componentes acessíveis com carregamento otimizado.         |

---

## 🔧 Passo a Passo:

### 1. **Setup do Supabase Realtime (Pub/Sub via PostgreSQL)**
O **Supabase Realtime** escuta mudanças no banco PostgreSQL (Neon) e transmite em tempo real via WebSocket.  
- **Vantagem:** Não precisa de servidor adicional; usa o PostgreSQL já existente.  

```typescript
// Enable Realtime no Supabase (dashboard)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Ativar Realtime para a tabela `comments`
supabase
  .channel('prediction-comments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'comment'
  }, (payload) => {
    // Notificar clients sobre nova mensagem
    broadcastMessage(payload.new);
  })
  .subscribe();
```

---

### 2. **Modelagem do Banco (Prisma)**
```prisma
// schema.prisma
model Comment {
  id        String  @id @default(uuid())
  text      String
  predictionId String  // ID da previsão relacionada
  userId    String   // Autor do comentário
  createdAt DateTime @default(now())
  
  @@index([predictionId]) // Otimiza queries por previsão
}
```

---

### 3. **API com tRPC**
```typescript
// server/api/routers/comment.ts
export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ text: z.string(), predictionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.create({
        data: {
          text: input.text,
          predictionId: input.predictionId,
          userId: ctx.session.user.id
        }
      });
    }),
  
  // Busca comentários paginados
  list: publicProcedure
    .input(z.object({ predictionId: z.string(), cursor: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.comment.findMany({
        where: { predictionId: input.predictionId },
        take: 50,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: { user: true } // Traz dados do autor via JOIN
      });
      return comments;
    }),
});
```

---

### 4. **Cliente em Tempo Real (Next.js Frontend)**
```typescript
// components/Chat.tsx
const Chat = ({ predictionId }: { predictionId: string }) => {
  const [messages, setMessages] = useState<Comment[]>([]);
  const { data: session } = useSession();

  // Subscreve ao canal de comentários
  useEffect(() => {
    const channel = supabase
      .channel(`prediction:${predictionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comment',
        filter: `predictionId=eq.${predictionId}`
      }, (payload) => {
        setMessages(msgs => [payload.new as Comment, ...msgs]);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [predictionId]);
}
```

---

### 5. **Interface do Usuário com Shadcn**
```tsx
// components/Chat.tsx
return (
  <Card className="p-4 max-h-[600px] overflow-hidden">
    <ScrollArea className="h-[500px]">
      {messages.map((msg) => (
        <div key={msg.id} className="py-2">
          <div className="flex gap-2">
            <Avatar>
              <AvatarImage src={msg.user.image} />
            </Avatar>
            <div>
              <p className="font-medium">{msg.user.name}</p>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        </div>
      ))}
    </ScrollArea>
    
    // Input de Comentário
    <div className="mt-4">
      <Input 
        placeholder="Deixe seu comentário..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            createComment.mutate({ text: e.currentTarget.value });
            e.currentTarget.value = '';
          }
        }}
      />
    </div>
  </Card>
);
```

---

## 🛡️ Segurança & Boas Práticas:
- **Auth Check:** Todo `mutation` usa `protectedProcedure` para garantir que usuários estão autenticados (NextAuth).
- **Rate Limiting:** Adicione um rate limiter (ex: `upstash/ratelimit`) para evitar spam.
- **Sanitização:** Use `z.string().max(500)` no Zod para evitar textos gigantes.
- **Filtros:** A tabela `comment` tem índices (Prisma) em `predictionId` para buscas rápidas.
- **Optimistic Updates:** Atualize o estado local antes da confirmação do servidor.

---

## 📲 Opções de Escalabilidade:
- **Caso precise de mais escala:** Troque o Realtime pelo **Pusher** ou **Ably** (solução gerenciada com SLA).
- **Cache AI:** Use **Redis** (ex: Upstash) para cachear mensagens recentes e diminuir carga no PostgreSQL.

---

## 📚 Bibliotecas Recomendadas:
| Biblioteca        | Uso                               |
|--------------------|-----------------------------------|
| `zustand`          | Gerenciamento de estado global    |
| `sonner`           | Toasts estilizados                |
| `@radix-ui/avatar` | Avatares responsivos              |
| `react-intersection-observer` | Scroll infinito           |

---

## 🎯 Recursos Avançados:

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

1. **Setup Supabase Realtime** no dashboard
2. **Add Comment model** ao schema Prisma
3. **Create tRPC router** para operações de comentário
4. **Implement Chat component** com subscriptions real-time
5. **Add rate limiting** e validação de input
6. **Test with multiple users** para garantir funcionalidade real-time

**Pronto!** Com essa arquitetura, você terá um chat ao estilo Polymarket, escalável, moderno e integrado com sua stack atual. 🎯 