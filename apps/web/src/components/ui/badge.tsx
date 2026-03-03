import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        {
          "bg-primary/15 text-primary border border-primary/20":
            variant === "default",
          "bg-success/10 text-success border border-success/20":
            variant === "success",
          "bg-warning/10 text-warning border border-warning/20":
            variant === "warning",
          "bg-destructive/10 text-destructive border border-destructive/20":
            variant === "destructive",
          "border border-border text-muted-foreground": variant === "outline",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
