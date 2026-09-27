// app/events/[slug]/loading.tsx — skeleton shown while the event detail page resolves
export default function EventDetailLoading() {
  return (
    <div className="pt-32 min-h-screen">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back link shimmer */}
        <div className="h-4 w-28 rounded-md bg-muted animate-pulse" />

        {/* Hero card shimmer */}
        <div className="mt-8 rounded-xl border border-border bg-card p-10 animate-pulse space-y-5">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded-lg bg-muted" />
            <div className="h-10 w-1/2 rounded-lg bg-muted/60" />
          </div>
          <div className="flex flex-wrap gap-6 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-8 rounded bg-muted/60" />
                  <div className="h-3.5 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + sidebar shimmer */}
      <div className="mx-auto max-w-4xl px-6 py-16 grid gap-12 md:grid-cols-3">
        <div className="md:col-span-2 space-y-12">
          {/* Agenda shimmer */}
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-24 rounded-lg bg-muted" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6 rounded-lg border border-border bg-muted/30 p-5">
                <div className="h-4 w-12 rounded bg-muted shrink-0" />
                <div className="h-4 flex-1 rounded bg-muted/60" />
              </div>
            ))}
          </div>
          {/* Speakers shimmer */}
          <div className="space-y-4 animate-pulse" style={{ animationDelay: "100ms" }}>
            <div className="h-6 w-28 rounded-lg bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-5">
                  <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-28 rounded bg-muted" />
                    <div className="h-2.5 w-20 rounded bg-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Registration card shimmer */}
        <div className="animate-pulse" style={{ animationDelay: "150ms" }}>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-6 w-32 rounded-lg bg-muted" />
            <div className="h-4 w-full rounded bg-muted/60" />
            <div className="h-4 w-3/4 rounded bg-muted/60" />
            <div className="h-10 w-full rounded-lg bg-primary/15 mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
