# 🔄 Migration: Neon → PlanetScale (Future plan)

Our schema is intentionally **cross-compatible** to allow migration from Neon (PostgreSQL) to PlanetScale (MySQL) later on.

## ⚠️ What to Avoid

- Avoid `@db.JsonB`, `tsvector`, raw Postgres types
- Use `uuid()` instead of `@default(dbgenerated(...))`

## Recommended Prisma Types

```prisma
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  email     String   @unique
  meta      Json
}
```

## Migration Steps (future)

1. Export schema from Neon
2. Convert types if needed (via Prisma or dump tools)
3. Push to PlanetScale
4. Update `.env` with new `DATABASE_URL`
5. Run `prisma db push` 