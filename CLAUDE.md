# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`prediq.fun` is a prediction market platform built with the T3 Stack. Users can create, trade, and resolve prediction markets on various topics (politics, sports, crypto, etc.).

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbo
npm run check           # Run lint + typecheck
npm run typecheck       # TypeScript type checking

# Database
npm run db:push         # Push schema to dev database
npm run db:studio       # Open Prisma Studio
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Deploy migrations to production

# Code Quality
npm run lint            # ESLint
npm run lint:fix        # ESLint with auto-fix
npm run format:check    # Check Prettier formatting
npm run format:write    # Apply Prettier formatting

# Build & Deploy
npm run build           # Production build
npm run preview         # Build and start locally
npm run start           # Start production server
```

## Architecture

### Core Stack
- **Next.js 15** with App Router
- **tRPC** for type-safe APIs
- **Prisma** ORM with PostgreSQL (Neon)
- **NextAuth.js** for authentication
- **shadcn/ui** components with Tailwind CSS
- **next-intl** for internationalization

### Database Models
The Prisma schema defines the prediction market structure:
- `Market`: Core prediction market entity with title, category, timing, and resolution data
- `Outcome`: YES/NO outcomes for each market with probability tracking
- `Bet`: Individual user bets on market outcomes
- `Position`: Aggregated user positions per market
- `Transaction`: Financial transaction history
- `User`: Extended with balance and trading statistics

Key architectural decisions:
- Use `cuid()` for all primary keys (not UUID) for better local generation
- Platform-agnostic schema design to enable future database migrations
- Decimal type for financial data to avoid floating-point precision issues

### API Structure
All business logic lives in `src/server/api/routers/`:
- `market.ts`: Market CRUD operations, resolution logic
- `bet.ts`: Betting operations, position calculations
- `user.ts`: User profiles, balance management
- `post.ts`: Basic post operations (T3 Stack default)

Always use:
- `protectedProcedure` for authenticated routes
- `publicProcedure` only for truly public data
- Zod schemas for input/output validation
- TRPCError for consistent error handling

### Frontend Architecture
- App Router with internationalized routes (`[locale]`)
- Component architecture: `components/` for reusable UI, `app/` for pages
- Translation files in `src/messages/[locale]/` with nested JSON structure
- Dark/light mode support with `next-themes`

### UI Components
Built on shadcn/ui with key prediction market components:
- `MarketCard`: Displays market info with YES/NO voting percentages
- `MarketList`: Grid of market cards with filtering
- `SearchBar`: Market search with category filtering
- `HowItWorksModal`: Tutorial modal for new users
- `Navbar`: Two-tier navigation with categories

Visual design follows consistent color palette with proper dark mode support. Market cards use gradients in light mode and simpler backgrounds in dark mode.

## Translation System

Uses next-intl with nested JSON structure. Translation files must wrap content in namespace objects:

```json
{
  "markets": {
    "title": "Active Markets",
    "card": {
      "yes": "Yes",
      "no": "No"
    }
  }
}
```

Use `useTranslations('markets')` then access with `t('card.yes')`.

## Development Guidelines

### Code Style
- Use the existing ESLint/Prettier configuration
- Follow established naming conventions
- All database operations must use Prisma
- No raw SQL unless absolutely necessary
- Always validate inputs with Zod schemas
- Add `cursor-pointer` class to all interactive buttons and clickable elements

### CSS Color System
**CRITICAL**: Always use CSS custom properties for colors, never mix Tailwind color classes with custom CSS variables.

**✅ CORRECT:**
```tsx
// Use only CSS custom properties
className="bg-[hsl(var(--yes)/0.2)] text-[hsl(var(--yes))] border-[hsl(var(--yes)/0.4)]"
```

**❌ INCORRECT:**
```tsx
// Never mix Tailwind colors with CSS custom properties
className="bg-green-200 dark:bg-[hsl(var(--yes)/0.25)]"
```

**Rules:**
- All market colors use `--yes` and `--no` variables from `globals.css`
- Use transparency modifiers like `/0.2`, `/0.4`, `/0.6` for different intensities
- Light/dark mode handled automatically by CSS variables
- Color changes made only in `globals.css`, never in components
- This prevents conflicts and ensures consistent theming

### UI Component Backgrounds
**CRITICAL**: All dropdowns, modals, popovers, and overlays must use opaque backgrounds.

**✅ CORRECT:**
```tsx
// Use opaque background variables for overlays
className="bg-card border border-border shadow-lg z-50 backdrop-blur-sm"
```

**❌ INCORRECT:**
```tsx
// Never use transparent or semi-transparent backgrounds for content areas
className="bg-popover bg-background/50 bg-transparent"
```

**Rules:**
- Always use `bg-card` for dropdown/modal backgrounds (fully opaque)
- Add `backdrop-blur-sm` for visual separation when needed
- Use high z-index (`z-50`) to ensure proper layering
- Never use `bg-popover` as it may be transparent in some themes
- Test all overlays in both light and dark modes for readability

### Database Changes
- Use `npm run db:push` for development
- Use `npm run db:migrate` for production deployments
- Keep schema platform-agnostic (avoid PostgreSQL-specific features)
- Test migrations on staging before production

### Testing Strategy
- Run `npm run check` before committing (lint + typecheck)
- Use Prisma Studio to inspect database changes
- Test dark/light mode for UI changes
- Verify translations in both English and Portuguese

### Environment Setup
Required environment variables:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL for auth callbacks

## Common Tasks

### Adding New Market Categories
1. Update category validation in `src/server/api/routers/market.ts`
2. Add translations to both `en/markets.json` and `pt/markets.json`
3. Update category mapping in `MarketCard.tsx` component
4. Add navigation links in `Navbar.tsx`

### Modifying Market Card Display
The `MarketCard` component has complex conditional styling for light/dark modes. When making changes:
- Preserve both light and dark mode appearances
- Use conditional classes like `dark:text-2xl` for dark mode specific styling
- Test gradient backgrounds work properly in light mode
- Ensure proper spacing and border colors
- Add `cursor-pointer` to interactive elements

### UI Component Standards
When creating or modifying UI components:
- Always add `cursor-pointer` class to buttons, links, and clickable elements
- Test hover states in both light and dark modes
- Ensure proper contrast ratios for accessibility
- Use consistent spacing and border styles from the design system

### Database Schema Updates
1. Modify `prisma/schema.prisma`
2. Run `npm run db:push` for development
3. Update related tRPC routers and Zod schemas
4. Update TypeScript types if needed
5. Test with `npm run db:studio`

## Legal and Compliance

### Terms of Use Page
- Located at `/[locale]/terms/page.tsx`
- Comprehensive terms adapted from prediction market industry standards
- Includes jurisdiction restrictions, risk warnings, and user obligations
- Accessible via footer link in both English and Portuguese
- Key sections: eligibility, financial risks, prohibited conduct, disclaimers

### Compliance Features
- Geographic restrictions for regulatory compliance
- Age verification requirements (18+)
- Anti-money laundering and sanctions compliance
- Risk disclosure and user acknowledgments

## Future Development Areas

Based on current todos and planned features:
- Web3Auth integration for wallet-based authentication
- Real-time WebSocket system for live market updates
- Smart contract deployment on Polygon
- Enhanced market resolution mechanisms
- Privacy Policy and Cookie Policy pages
- KYC/AML verification system
- Mobile app considerations

The codebase is structured to support these future enhancements with minimal refactoring.