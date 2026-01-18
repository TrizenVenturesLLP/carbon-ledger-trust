import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      status: {
        pending: "bg-warning/15 text-warning border border-warning/20",
        approved: "bg-success/15 text-success border border-success/20",
        rejected: "bg-destructive/15 text-destructive border border-destructive/20",
        issued: "bg-primary/15 text-primary border border-primary/20",
        retired: "bg-muted text-muted-foreground border border-border",
        active: "bg-info/15 text-info border border-info/20",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function StatusBadge({ status, children, className, icon }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
