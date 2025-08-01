# 🌱 Environment Variables

## Main

```env
DATABASE_URL="postgres://user:pass@...neon.tech/db?sslmode=require"
NEXTAUTH_SECRET=your-long-random-secret
NEXTAUTH_URL=http://localhost:3000
```

Never commit `.env.local`.

## Database Notes

Neon DB has SSL required → `?sslmode=require` must be in the URL.

Use `Prisma Studio` for inspection:

```
pnpm prisma studio
``` 