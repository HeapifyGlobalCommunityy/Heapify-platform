import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-glass-bg border border-glass-border",
        className
      )}
      {...props}
    />
  );
}

/** Pre-built skeleton that matches the EventCard shape */
export function EventCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[1.75rem] border border-glass-border bg-glass-bg/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
      <Skeleton className="mt-1 h-10 w-full rounded-xl" />
    </div>
  );
}
