import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
  string,
  "success" | "warning" | "destructive" | "default" | "outline"
> = {
  active: "success",
  approved: "success",
  pass: "success",
  pending: "warning",
  pending_approval: "warning",
  warning: "warning",
  provisioning: "warning",
  draft: "outline",
  inactive: "outline",
  rejected: "destructive",
  fail: "destructive",
  error: "destructive",
  archived: "default",
};

const DOT_COLORS: Record<string, string> = {
  active: "bg-success",
  approved: "bg-success",
  pass: "bg-success",
  pending: "bg-warning",
  pending_approval: "bg-warning",
  warning: "bg-warning",
  provisioning: "bg-warning",
  draft: "bg-muted-foreground",
  inactive: "bg-muted-foreground",
  rejected: "bg-destructive",
  fail: "bg-destructive",
  error: "bg-destructive",
  archived: "bg-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANTS[status] ?? "default";
  const dotColor = DOT_COLORS[status] ?? "bg-muted-foreground";

  return (
    <Badge variant={variant}>
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          dotColor,
          (status === "pending" || status === "pending_approval" || status === "provisioning") &&
            "animate-pulse-dot",
        )}
      />
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
