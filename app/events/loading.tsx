// app/events/loading.tsx — skeleton shown while the events list page loads
export default function EventsLoading() {
  return (
    <div className="pt-36 pb-12 max-w-7xl mx-auto px-6">
      {/* Title shimmer */}
      <div className="space-y-3 mb-10">
        <div className="h-8 w-56 rounded-lg bg-muted/70 animate-pulse" />
        <div className="h-4 w-96 rounded-md bg-muted/50 animate-pulse" />
      </div>

      {/* Filter bar shimmer */}
      <div className="flex gap-2.5 mb-8">
        {[80, 100, 72, 90].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-muted/60 animate-pulse"
            style={{ width: `${w}px`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      {/* Card grid shimmer */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex justify-between items-start">
              <div className="h-5 w-24 rounded-md bg-muted/80" />
              <div className="h-5 w-16 rounded-full bg-muted/60" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-4/5 rounded-md bg-muted/70" />
              <div className="h-4 w-3/5 rounded-md bg-muted/50" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-4 w-20 rounded bg-muted/50" />
              <div className="h-4 w-24 rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
