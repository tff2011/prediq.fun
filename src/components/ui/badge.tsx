import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        politics: "bg-indigo-600 text-white border-indigo-700 shadow-sm hover:bg-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 dark:hover:bg-indigo-500/30",
        crypto: "bg-amber-600 text-white border-amber-700 shadow-sm hover:bg-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-500/30",
        sports: "bg-emerald-600 text-white border-emerald-700 shadow-sm hover:bg-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/30",
        economics: "bg-sky-600 text-white border-sky-700 shadow-sm hover:bg-sky-700 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 dark:hover:bg-sky-500/30",
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