# 🏗️ Project Architecture

## Tech Stack

| Layer       | Tool             |
|-------------|------------------|
| App         | Next.js (App Router)
| UI          | Tailwind CSS
| API         | tRPC
| ORM         | Prisma
| DB          | Neon (PostgreSQL)
| Auth        | NextAuth.js
| Validation  | Zod
| Lint/Format | ESLint + Prettier

## Folder Structure

```
├── app/              # App router pages
├── components/       # Shared UI components
├── server/           
│   └── api/          # tRPC routers & procedures
├── prisma/           # schema.prisma & migrations
├── lib/              # Utils & shared logic
├── styles/           
├── env/              # .env files
```

## Dev Principles

- Type-safe everywhere (frontend <-> backend)
- DRY and modular
- No magic global state, avoid `any`
- Clear boundary between API and UI 