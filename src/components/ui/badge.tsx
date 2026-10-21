import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        jobs: "bg-blue-50 text-blue-700",
        leads: "bg-violet-50 text-violet-700",
        both: "bg-emerald-50 text-emerald-700",
        high: "bg-rose-50 text-rose-700",
        medium: "bg-amber-50 text-amber-700",
        low: "bg-slate-100 text-slate-700",
        valid: "bg-green-50 text-green-700",
        invalid: "bg-red-50 text-red-700",
        info: "bg-indigo-50 text-indigo-700",
        warning: "bg-amber-50 text-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
