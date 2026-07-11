"use client";

// components/profile/EventHistoryClient.tsx
// Client component for paginated Event History inside the profile page.
// Uses the server action pattern: "Load more" fetches the next page via
// a server action so pagination never exposes user_id on the client.
// Starts with page 0 data passed from the server component as props.

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Status pill colours
const statusColour: Record<string, string> = {
  registered: "border-primary/30 bg-primary/10 text-primary",
  attended: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  waitlisted: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  cancelled: "border-zinc-700 bg-zinc-800/60 text-zinc-500",
};

export interface EventHistoryRow {
  id: string;
  status: string;
  registered_at: string;
  event: {
    id: string;
    slug: string;
    title: string;
    category: string;
    start_at: string;
    status: string;
  } | null;
}

interface Props {
  initialRows: EventHistoryRow[];
  hasMoreInitially: boolean;
  userId: string;
}

// Server action import — pagination fetch
import { loadMoreEventHistory } from "@/lib/actions/profile";

export default function EventHistoryClient({ initialRows, hasMoreInitially, userId }: Props) {
  const [rows, setRows] = useState<EventHistoryRow[]>(initialRows);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(hasMoreInitially);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    const nextPage = page + 1;
    startTransition(async () => {
      const { rows: newRows, hasMore: moreAvailable } = await loadMoreEventHistory(userId, nextPage);
      setRows((prev) => [...prev, ...newRows]);
      setPage(nextPage);
      setHasMore(moreAvailable);
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-10 text-center space-y-3">
        <p className="font-display text-lg font-semibold text-white">No events in your history.</p>
        <p className="text-sm text-muted-foreground">Events you register for will appear here.</p>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events">
            Explore Events <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const ev = row.event;
        if (!ev) return null;
        return (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 px-5 py-4"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                {ev.category}
              </div>
              <div className="mt-1 font-semibold text-sm text-white truncate">{ev.title}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                <CalendarDays className="h-3 w-3" />
                {new Date(ev.start_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                  statusColour[row.status] ?? statusColour.registered
                }`}
              >
                {row.status}
              </span>
              <Link
                href={`/events/${ev.slug}`}
                className="text-primary hover:underline"
                aria-label={`View ${ev.title}`}
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={loadMore}
          disabled={isPending}
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
          ) : (
            "Load more"
          )}
        </Button>
      )}
    </div>
  );
}
