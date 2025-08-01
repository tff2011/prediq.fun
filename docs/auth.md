# 🔐 Authentication (NextAuth.js)

## System

We use **NextAuth.js** with a **Prisma adapter**.  
User session is available in `ctx.session`.

## Notes

- Users are stored in the `User` model (Prisma)
- Use `getServerAuthSession()` to access user in Next.js App Router
- Session includes `.id`, `.email`, and `.name`

```ts
const session = await getServerAuthSession()
if (!session?.user?.id) return redirect("/login")
```

## Protected Routes

All tRPC procedures that require user auth must use:

```ts
export const protectedProcedure = procedure.use(isAuthed)
```

This enforces access control seamlessly. 