# 🔌 tRPC API Docs

## API Directory
tRPC routers live in:  
`server/api/routers/`

## Example router

```ts
export const marketRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ title: z.string(), closesAt: z.date() }))
    .mutation(async ({ ctx, input }) => {
      return await db.market.create({
        data: { ...input, authorId: ctx.session.user.id }
      })
    }),
});
```

- Rules:
  - Always use **Zod** to validate inputs
  - Mutations = use async/await
  - Use `protectedProcedure` for any auth-restricted routes

## Available Routers

- `marketRouter` — Operations on prediction markets
- `betRouter` — Create/view bets
- `userRouter` — User profile & history 