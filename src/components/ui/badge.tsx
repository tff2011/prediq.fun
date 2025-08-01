import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        politics: "bg-indigo-400/20 text-indigo-800 border-indigo-300 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
        crypto: "bg-yellow-300/30 text-yellow-900 border-yellow-400 shadow-sm dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
        sports: "bg-emerald-400/20 text-emerald-900 border-emerald-300 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
        economics: "bg-sky-400/20 text-sky-900 border-sky-300 shadow-sm dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }