Claro! 🎯 Aqui está uma documentação clara e objetiva em **inglês**, com base nas boas práticas que discutimos – para o seu projeto de **prediction market** usando **T3 Stack + Neon + Prisma + tRPC + NextAuth**, com foco em escalabilidade e migração segura.

---

# 🧭 Developer Guide — `prediq.fun`

Welcome to the codebase of **prediq.fun**, a prediction market platform powered by the T3 Stack. This document provides conventions, best practices, and architectural decisions that every contributor must follow to ensure maintainability, performance, and ease of migration.

> 📚 **IMPORTANT**: Always consult the complete documentation in the `/docs` folder for detailed guides, examples, and advanced topics. This file provides an overview, but the `/docs` folder contains comprehensive technical documentation.

---

## 📚 Tech Stack

| Layer         | Tool                             |
|---------------|----------------------------------|
| UI / App      | **Next.js** (App Router)         |
| UI Components | **shadcn/ui** (Radix UI + Tailwind) |
| Styling       | **Tailwind CSS**                 |
| API Layer     | **tRPC**                         |
| Auth          | **NextAuth.js**                  |
| ORM           | **Prisma**                       |
| Database      | **Neon (PostgreSQL)**            |
| Lint/Format   | **ESLint + Prettier**            |
| Validation    | **Zod**                          |
| Deployment    | **Vercel**                       |

---

## ✅ Code Style & Tooling

### Linting / Formatting

- We use **ESLint** for linting JS/TS
- **Prettier** is used for code formatting
- Use `pnpm lint` and `pnpm format` before pushing code

### File Structure

Follow `app/` layout of Next.js App Router.

```bash
.
├── app/              # App router pages
├── components/       # Shared UI components
│   └── ui/          # shadcn/ui components
├── server/           # tRPC routers, server utils
│   └── api/
├── lib/              # shared helpers
├── prisma/           # schema.prisma lives here
└── styles/
```

---

## 🧠 Architecture Guidelines

### Backend (tRPC + Prisma):

- All API logic lives in `server/api/routers`
- Input & output must be validated with **Zod**
- Use **`protectedProcedure`** for authenticated routes
- Use **`publicProcedure`** only if the data is public

> Always assume your API will be consumed by **untrusted input**.

#### Example:

```ts
export const marketRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(5),
      closesAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.market.create({
        data: {
          title: input.title,
          closesAt: input.closesAt,
          authorId: ctx.session.user.id,
        }
      });
    }),
});
```

---

## 🧩 Prisma Best Practices

- PostgreSQL is the datasource (`Neon.tech`)
- Use **`uuid()`** as ID if possible
- Avoid provider-specific types (`jsonb`, `tsvector`)
- Prefer `prisma db push` for dev and `prisma migrate` for staging/prod

### Keep schema **Platform-Agnostic**:
To enable future migration to PlanetScale (MySQL):

```prisma
// Good practice
id        String   @id @default(uuid())
meta      Json
createdAt DateTime @default(now())

// Avoid PostgreSQL-only features
// ❌ @db.JsonB, ❌ raw SQL defaults
```

---

## 🎨 UI/UX Guidelines (shadcn/ui)

### Component System
- Use **shadcn/ui** as the foundation for all UI components
- Components are local to the codebase (not a package dependency)
- Built on **Radix UI** primitives for accessibility
- Styled with **Tailwind CSS** for consistency

### Key Components for Prediction Markets
- **Button**: Voting, buying/selling shares, actions
- **Card**: Display market information and stats
- **Dialog/Modal**: Bet confirmation, login, details
- **Tabs**: Market filters and view switching
- **Toast**: User feedback and notifications
- **Dropdown**: User menu, currency selectors
- **Tooltip**: Explain odds and information icons
- **Sheet**: Mobile sidebar and menu toggles

### Design Principles
- Mobile-first responsive design
- Dark mode support (class-based strategy)
- Consistent spacing and typography
- Accessible components with proper ARIA labels
- Use only needed components to avoid bloat

### Customization
- Edit components directly in `components/ui/`
- Add variants using class-variance-authority (CVA)
- Customize theme via Tailwind config
- Keep components tree-shakable and performant

---

## 🔐 Authentication (NextAuth.js)

- Use **NextAuth with Prisma Adapter**
- User object is available on `ctx.session.user`
- Keep sessions short-lived and stateless
- Store minimal account metadata in Prisma `User` model

---

## 🌱 Environment Configuration

Example `.env` entry:

```env
DATABASE_URL="postgres://user:pass@host.neon.tech/db?sslmode=require"
NEXTAUTH_SECRET=your-secret
```

Use `.env.local` and DO NOT commit it.

---

## 📈 Deployment (Vercel)

- Every push to `main` deploys automatically to production
- `staging` branch can be used for preprod environments
- Preview deployments per PRs are supported

---

## 🧩 How to Run Locally

```bash
pnpm install
pnpm dev
```

To setup DB:
```bash
pnpm prisma db push  # Or `pnpm prisma migrate dev` if needed
```

---

## 🔄 Migration & Future Proofing

We are currently on **Neon (PostgreSQL)** due to better free tier & autoscaling.

However, our data model is compatible with:
- **PlanetScale (MySQL)**: easy to migrate via Prisma
- **Supabase**: Postgres-compatible
- **Xata / Turso**: for specific use-cases

Data migration strategy:
- Keep model minimal
- Use `uuid`, `datetime`, `json`, and avoid type-specific defaults
- Have a data migration script ready via `prisma` or ETL tools

Want to migrate? See `docs/migration.md`.

---

## 🤝 Contributing Rules

- Keep code type-safe with `Zod` and `tRPC`
- No raw SQL unless strictly necessary
- Don't bypass auth guards (`protectedProcedure`)
- One feature = one PR = includes server + client code

---

## 📦 Scripts

```bash
pnpm dev           # start dev server
pnpm build         # build for production
pnpm lint          # run ESLint
pnpm format        # format files with Prettier
pnpm prisma studio # open Prisma DB GUI
```

---

## 📘 Resources

### 📚 Project Documentation
- [📖 Complete Documentation](./docs/) - Start here for detailed guides
- [🏗️ Architecture Overview](./docs/architecture.md)
- [📦 Database Guidelines](./docs/prisma-guidelines.md)
- [🔌 tRPC API Docs](./docs/trpc-api.md)
- [🔐 Authentication Guide](./docs/auth.md)
- [🌱 Environment Setup](./docs/env-setup.md)
- [🔄 Migration Strategy](./docs/migration.md)
- [🎨 UI System (shadcn/ui)](./docs/ui.md)
- [🚀 Realtime Chat Architecture](./docs/realtime-chat.md)
- [🔗 Web3Auth Integration](./docs/web3auth-integration.md)
- [⛓️ Blockchain Architecture](./docs/blockchain-architecture.md)

### 🔗 External Resources
- [T3 Stack Docs](https://create.t3.gg/)
- [shadcn/ui Docs](https://ui.shadcn.dev/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Zod Docs](https://zod.dev)

---

## 🚀 You're Ready!

> 📚 **Remember**: Always consult the `/docs` folder for comprehensive technical documentation, examples, and implementation guides. This overview provides the foundation, but the detailed documentation in `/docs` contains everything you need to contribute effectively.

> Stick to the conventions above, write type-safe code, and let's build the future of prediction markets! 🧠📈

---

## 📖 Documentation Structure

The `/docs` folder contains comprehensive documentation for every aspect of the project:

- **Architecture & Setup**: Complete guides for project structure and configuration
- **Database & API**: Detailed Prisma and tRPC documentation with examples
- **Authentication**: Web3Auth integration and NextAuth configuration
- **UI/UX**: shadcn/ui implementation and design system
- **Real-time Features**: Chat architecture and WebSocket implementation
- **Blockchain**: Smart contracts, CLOB, and UMA oracle integration

Start with `docs/index.md` for an overview of all available documentation.