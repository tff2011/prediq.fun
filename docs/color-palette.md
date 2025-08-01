# 🎨 PredIQ.fun Color Palette

This document defines the comprehensive color system for PredIQ.fun, including both light and dark modes optimized for a prediction market platform.

## 🎯 Design Principles

- **Clarity**: Light mode with soft contrasts for comfortable reading
- **Depth**: Dark mode with rich blacks and vibrant accents
- **Accessibility**: WCAG AAA compliant contrast ratios
- **Trust**: Professional colors that convey reliability
- **Market Identity**: Clear YES/NO visual distinction

## 🌓 Theme System

The color system uses CSS custom properties (variables) that automatically switch based on the selected theme. The theme is controlled via the `ThemeProvider` component using the class strategy.

## ✅ Color Tokens

### Base Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--background` | `#f9fafb` (gray-50) | `#141414` (near black) | Main background |
| `--foreground` | `#1f2937` (gray-800) | `#e5e7eb` (gray-200) | Primary text |
| `--card` | `#ffffff` (white) | `#1e1e1e` (gray-900) | Card backgrounds |
| `--border` | `#e5e7eb` (gray-200) | `#374151` (gray-700) | Borders and dividers |

### Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--primary` | `#4f46e5` (indigo-600) | `#818cf8` (indigo-400) | Primary actions, brand |
| `--secondary` | `#374151` (gray-700) | `#6b7280` (gray-500) | Secondary elements |
| `--accent` | `#10b981` (green-500) | `#6ee7b7` (green-300) | Positive accents |

### Market Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--yes` | `#10b981` (green-500) | `#6ee7b7` (green-300) | YES bets/positive odds |
| `--yes-hover` | `#059669` (green-600) | `#34d399` (green-400) | YES hover state |
| `--no` | `#ef4444` (red-500) | `#f87171` (red-400) | NO bets/negative odds |
| `--no-hover` | `#dc2626` (red-600) | `#fb7185` (red-400) | NO hover state |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--success` | `#10b981` (green-500) | `#6ee7b7` (green-300) | Success states |
| `--warning` | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Warning states |
| `--info` | `#0ea5e9` (sky-500) | `#38bdf8` (sky-400) | Information |
| `--destructive` | `#ef4444` (red-500) | `#f87171` (red-400) | Errors/destructive |

### Chart Colors

A consistent palette for data visualization:

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--chart-1` | `#4f46e5` (indigo) | `#818cf8` (indigo-400) | Primary data |
| `--chart-2` | `#10b981` (green) | `#6ee7b7` (green-300) | Positive trends |
| `--chart-3` | `#ef4444` (red) | `#f87171` (red-400) | Negative trends |
| `--chart-4` | `#f59e0b` (amber) | `#fbbf24` (amber-400) | Neutral data |
| `--chart-5` | `#0ea5e9` (sky) | `#38bdf8` (sky-400) | Additional data |

## 🎨 Usage Examples

### Tailwind Classes

```jsx
// Background and text
<div className="bg-background text-foreground">

// Cards
<div className="bg-card border border-border rounded-lg">

// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">

// YES/NO buttons
<button className="bg-yes text-yes-foreground hover:bg-yes-hover">
<button className="bg-no text-no-foreground hover:bg-no-hover">

// Status indicators
<span className="text-success">Active</span>
<span className="text-warning">Pending</span>
<span className="text-destructive">Closed</span>
```

### Market Card Example

```jsx
<Card className="bg-card border-border">
  <CardHeader>
    <h3 className="text-foreground">Will BTC reach $100k by 2025?</h3>
    <p className="text-muted-foreground">Closes in 3 days</p>
  </CardHeader>
  <CardContent>
    <div className="flex gap-4">
      <Button className="bg-yes text-yes-foreground hover:bg-yes-hover">
        YES 65%
      </Button>
      <Button className="bg-no text-no-foreground hover:bg-no-hover">
        NO 35%
      </Button>
    </div>
  </CardContent>
</Card>
```

## 🔧 Implementation

### CSS Variables

The color system is defined in `src/styles/globals.css`:

```css
:root {
  --background: 210 20% 98%;
  --foreground: 215 20% 20%;
  /* ... other colors */
}

.dark {
  --background: 0 0% 8%;
  --foreground: 210 14% 89%;
  /* ... other colors */
}
```

### Tailwind Configuration

Colors are mapped in `tailwind.config.ts`:

```ts
colors: {
  background: "hsl(var(--background))",
  yes: {
    DEFAULT: "hsl(var(--yes))",
    foreground: "hsl(var(--yes-foreground))",
    hover: "hsl(var(--yes-hover))",
  },
  // ... other colors
}
```

## 🌈 Visual Preview

### Light Mode
- Clean white backgrounds with subtle gray accents
- High contrast for readability
- Professional indigo primary color
- Clear green/red distinction for market positions

### Dark Mode
- Rich, deep blacks (#141414) avoiding pure black
- Softer contrast to reduce eye strain
- Vibrant but balanced accent colors
- Maintains clear market position indicators

## ♿ Accessibility

All color combinations meet WCAG AAA standards:
- Text on backgrounds: minimum 7:1 contrast ratio
- Large text: minimum 4.5:1 contrast ratio
- Interactive elements: clearly distinguishable states

## 🚀 Best Practices

1. **Consistency**: Always use the defined color tokens
2. **Semantic Usage**: Use colors according to their purpose (success for positive, destructive for errors)
3. **Market Clarity**: YES = green tones, NO = red tones
4. **Avoid Hardcoding**: Never use hex values directly in components
5. **Test Both Modes**: Always verify appearance in both light and dark modes

## 📚 References

- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [HSL Color Space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)