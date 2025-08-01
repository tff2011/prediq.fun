# 🧭 prediq.fun — Prediction Market Platform

Welcome to **prediq.fun**, a prediction market platform powered by the T3 Stack. This project enables users to create, participate in, and trade on prediction markets.

## 📚 Tech Stack

| Layer         | Tool                             |
|---------------|----------------------------------|
| UI / App      | **Next.js** (App Router)         |
| Styling       | **Tailwind CSS**                 |
| API Layer     | **tRPC**                         |
| Auth          | **NextAuth.js**                  |
| ORM           | **Prisma**                       |
| Database      | **Neon (PostgreSQL)**            |
| Lint/Format   | **ESLint + Prettier**            |
| Validation    | **Zod**                          |
| Deployment    | **Vercel**                       |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Neon PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd prediq.fun

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and auth credentials

# Set up the database
pnpm prisma db push

# Start the development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧩 Project Structure

```
.
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── server/        # tRPC routers, server utils
│   │   └── api/
│   ├── components/    # Reusable UI components
│   ├── lib/          # Shared utilities
│   └── styles/       # Global styles
├── prisma/           # Database schema
├── public/           # Static assets
└── docs/            # Documentation
```

## 🔐 Authentication

This project uses **NextAuth.js** with Prisma adapter for authentication. Users can sign in with various providers, and their session data is stored securely.

## 🗄️ Database

We use **Neon (PostgreSQL)** as our primary database with **Prisma** as the ORM. The schema is designed to be platform-agnostic for easy migration to other databases like PlanetScale or Supabase.

### Key Features:
- UUID-based IDs for scalability
- Platform-agnostic schema design
- Optimized for prediction market data

## 🧠 Architecture Guidelines

### Backend (tRPC + Prisma):
- All API logic lives in `server/api/routers`
- Input & output validation with **Zod**
- Use **`protectedProcedure`** for authenticated routes
- Use **`publicProcedure`** for public data

### Example API Route:
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

## 📦 Available Scripts

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm format        # Format code with Prettier
pnpm prisma studio # Open Prisma DB GUI
pnpm prisma db push # Push schema changes to database
```

## 🌱 Environment Configuration

Create a `.env.local` file with:

```env
DATABASE_URL="postgres://user:pass@host.neon.tech/db?sslmode=require"
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 📈 Deployment

This project is optimized for **Vercel** deployment:

- Every push to `main` deploys automatically
- `staging` branch for pre-production testing
- Preview deployments for pull requests

## 🔄 Migration & Future Proofing

Our data model is compatible with:
- **PlanetScale (MySQL)**: Easy migration via Prisma
- **Supabase**: Postgres-compatible
- **Xata / Turso**: For specific use-cases

## 🤝 Contributing

1. Follow the established code style and architecture
2. Keep code type-safe with `Zod` and `tRPC`
3. Use `protectedProcedure` for authenticated routes
4. One feature = one PR = includes server + client code

## 📘 Resources

- [T3 Stack Documentation](https://create.t3.gg/)
- [Neon Database Docs](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Zod Validation](https://zod.dev)

## 🚀 Ready to Build!

> Stick to the conventions above, write type-safe code, and let's build the future of prediction markets! 🧠📈

---

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).
