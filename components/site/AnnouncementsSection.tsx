// components/site/AnnouncementsSection.tsx
// Server component — reads from Supabase directly, no client state.
// Renders only audience='all' rows. Empty state is intentional and visible.

import { getPublicAnnouncements } from "@/lib/supabase/queries";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AnnouncementsSection() {
  const { data: announcements, error } = await getPublicAnnouncements(6);

  if (error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground shadow-warm">
        Announcements are temporarily unavailable.
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-12 text-center space-y-2 shadow-warm">
        <p className="font-display text-lg font-600 text-foreground">Nothing to announce yet.</p>
        <p className="text-sm text-muted-foreground">
          Stay tuned — we&apos;ll share community updates here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {announcements.map((a: { id: string; title: string; body: string | null; created_at: string }) => (
        <article
          key={a.id}
          className="rounded-2xl border border-border/70 bg-card p-6 flex flex-col gap-3 shadow-warm hover:border-primary/30 hover:shadow-warm-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-600 tracking-tight leading-snug text-foreground">
              {a.title}
            </h3>
            <span className="shrink-0 eyebrow text-muted-foreground mt-1">
              {timeAgo(a.created_at)}
            </span>
          </div>
          {a.body && (
            <p className="text-sm leading-7 text-muted-foreground line-clamp-3">
              {a.body}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
