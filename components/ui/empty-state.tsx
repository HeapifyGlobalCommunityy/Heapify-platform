import { Ghost } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "Try adjusting your search or filters.",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "col-span-full flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-[1.75rem] border border-glass-border bg-glass-bg/60 p-8 text-center backdrop-blur-xl",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <Ghost className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="font-display text-lg font-semibold tracking-tight">{title}</p>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="ghost" onClick={onAction} className="border border-glass-border">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
