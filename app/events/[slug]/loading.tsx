// app/events/[slug]/loading.tsx — skeleton shown while the event detail page resolves
export default function EventDetailLoading() {
  return (
    <div className="pt-32 min-h-screen">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back link shimmer */}
        <div className="h-4 w-28 rounded-md bg-zinc-800/50 animate-pulse" />

        {/* Hero card shimmer */}
        <div className="mt-8 rounded-[2rem] border border-zinc-800/60 bg-zinc-900/30 p-10 animate-pulse space-y-5">
          <div className="h-3 w-32 rounded bg-zinc-800/60" />
          <div className="space-y-3">
            <div className="h-12 w-3/4 rounded-xl bg-zinc-800/60" />
            <div className="h-12 w-1/2 rounded-xl bg-zinc-800/50" />
          </div>
          <div className="flex flex-wrap gap-6 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800/60" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-8 rounded bg-zinc-800/50" />
                  <div className="h-3.5 w-20 rounded bg-zinc-800/60" />
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
            <div className="h-7 w-24 rounded-lg bg-zinc-800/60" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-5">
                <div className="h-4 w-12 rounded bg-zinc-800/60 shrink-0" />
                <div className="h-4 flex-1 rounded bg-zinc-800/40" />
              </div>
            ))}
          </div>
          {/* Speakers shimmer */}
          <div className="space-y-4 animate-pulse" style={{ animationDelay: "100ms" }}>
            <div className="h-7 w-28 rounded-lg bg-zinc-800/60" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-5">
                  <div className="h-12 w-12 rounded-full bg-zinc-800/60 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-28 rounded bg-zinc-800/60" />
                    <div className="h-2.5 w-20 rounded bg-zinc-800/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Registration card shimmer */}
        <div className="animate-pulse" style={{ animationDelay: "150ms" }}>
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-4">
            <div className="h-6 w-32 rounded-lg bg-zinc-800/60" />
            <div className="h-4 w-full rounded bg-zinc-800/40" />
            <div className="h-4 w-3/4 rounded bg-zinc-800/40" />
            <div className="h-10 w-full rounded-xl bg-primary/20 mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
