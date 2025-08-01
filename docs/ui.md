# 🎨 UI System — shadcn/ui

This project uses [shadcn/ui](https://ui.shadcn.dev) as the UI components foundation.

shadcn/ui gives us:

✅ Accessible components (via Radix UI)  
✅ Built with Tailwind CSS  
✅ Fully customizable — lives in our codebase  
✅ Mobile-first & responsive  
✅ Tree-shakable and framework-agnostic  

This ensures we have a consistent, scalable, and developer-friendly design system.

---

## 🔧 Installation & Setup

Initialize shadcn/ui if needed (one-time setup):

```bash
pnpm dlx shadcn@latest init --template next --base-color zinc
```

This will:

- Add required dependencies (class-variance-authority, tailwind-variants, radix)
- Add ./components/ui folder
- Configure theme colors + CSS variables
- Add tailwind plugins if missing

> Base colors available: neutral, gray, zinc, stone, slate, etc

---

## 📦 Install UI Components

We will install only what we use to keep the project size optimized.

### Option 1 — Add specific component

```bash
pnpm dlx shadcn@latest add button
```

Example:
```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="sm">Place Bet</Button>
```

Available components:  
[https://ui.shadcn.dev/docs/components](https://ui.shadcn.dev/docs/components)

### Option 2 — Install all components

For fast prototyping or full design system:

```bash
pnpm dlx shadcn@latest add --all
```

This will generate all available components in ./components/ui.

---

## 🧱 Directory Structure

```
components/
└── ui/
    ├── button.tsx
    ├── input.tsx
    ├── dialog.tsx
    ├── card.tsx
    ├── dropdown-menu.tsx
    └── ...
```

All shadcn components are in regular TSX files — NOT a third-party package. This gives you:

- Full control over defaults
- Tailwind integration out of the box
- Easy to extend or theme

---

## 🎨 Design & Theming

shadcn/ui uses Tailwind CSS + CSS variables under the hood.

To customize the theme:

- colors: edit tailwind.config.ts → theme.extend.colors
- radius/roundness: tailwind.config.ts → theme.extend.borderRadius
- font/sizes: use global Tailwind settings

#### 🌓 Dark Mode

Already configured using class-based strategy (dark class on <html>):

Components automatically adapt according to mode.

Toggle example:

```tsx
{isDark ? <Moon /> : <Sun />}
```

---

## 🧪 Useful Components for Prediction Markets UI

We recommend using the following base components frequently:

| Component       | Use Case                          |
|----------------|-----------------------------------|
| Button          | Voting, buying/selling shares     |
| Card            | Display market info               |
| Dialog / Modal  | Bet confirmation, login, details  |
| Tabs            | Market filters/switching views   |
| Toast           | User feedback, success/failure    |
| Dropdown        | User menu, currency selector      |
| Tooltip         | Explain odds, info icons          |
| Sheet           | Mobile sidebar / menu toggle      |
| Toggle          | Change prediction mode or filters |

---

## 🧰 Utilities & Variants

Most components use class-variance-authority (CVA) to create variants (sizes, styles, etc).

Examples available in each component file (e.g. button.tsx):

```tsx
<Button variant="destructive" size="lg">Sell</Button>
```

Custom variants can be added easily by editing the base component config.

---

## 🛠️ Customizing Components

Since all components are local to your codebase, you can edit any file directly:

1. Go to components/ui/button.tsx
2. Add new variant or modify styles
3. Use Tailwind safely — no breaking imports

Example: Add a "success" variant to the Button component.

---

## 💡 Best Practices

- ✅ Use only the components you need — avoids bloat
- 📱 Use responsive Tailwind utilities for mobile support (e.g., sm:px-4, md:hidden, etc)
- ♿ Always pass props like aria-label where needed for accessibility
- 🧼 Clean up unused variants/components when possible
- 🔁 Prefer Radix components + shadcn instead of random custom modals/input logic

---

## 🌐 Resources

- Official Docs: https://ui.shadcn.dev
- Radix UI: https://www.radix-ui.com/primitives/docs
- Tailwind: https://tailwindcss.com/docs

---

## 📌 Summary

shadcn/ui provides a best-of-both-worlds approach:

✅ Rapid development with prebuilt components  
✅ Tailwind CSS under the hood  
✅ Keeps full control and customizability  
✅ No vendor lock-in or bloated CSS  

It's the perfect fit for a T3 Stack app like prediq.fun. 