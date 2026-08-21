"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CalendarDays, ExternalLink, ListChecks, Pencil, Search, Trash2, XCircle } from "lucide-react";
import { adminCancelEvent, adminDeleteEvent, updateAdminEventStatus, type AdminEvent } from "@/lib/actions/events";
import { ExportRegistrationsButton } from "@/components/events/ExportRegistrationsButton";
import { cn } from "@/lib/utils";

const statuses = ["all", "upcoming", "ongoing", "completed", "cancelled"] as const;
type FilterStatus = (typeof statuses)[number];

const statusStyles: Record<string, string> = {
  upcoming: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  ongoing: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  completed: "border-border bg-muted text-muted-foreground",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminEventsTable({ events }: { events: AdminEvent[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesStatus = status === "all" || event.status === status;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [event.title, event.category, event.chapter?.name, event.location]
      .some((value) => typeof value === "string" && value.toLowerCase().includes(search));
    return matchesStatus && matchesQuery;
  }), [events, query, status]);

  function changeStatus(eventId: string, nextStatus: AdminEvent["status"]) {
    setError(null);
    startTransition(async () => {
      const result = await updateAdminEventStatus(eventId, nextStatus);
      if (!result.success) {
        setError(result.error ?? "Unable to update event status.");
      } else {
        router.refresh();
      }
    });
  }

  function cancelEvent(event: AdminEvent) {
    if (!window.confirm(`Cancel "${event.title}"? Attendees will no longer be able to register.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await adminCancelEvent(event.id);
      if (!result.success) {
        setError(result.error ?? "Unable to cancel event.");
      } else {
        router.refresh();
      }
    });
  }

  function deleteEvent(event: AdminEvent) {
    if (!window.confirm(`Delete "${event.title}" permanently? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteEvent(event.id);
      if (!result.success) {
        setError(result.error ?? "Unable to delete event.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass-bg p-4 backdrop-blur-xl md:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background/50 px-3 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, chapters, or locations" className="h-10 w-full bg-transparent outline-none placeholder:text-muted-foreground" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value as FilterStatus)} className="h-10 rounded-xl border border-border bg-background/50 px-3 text-sm outline-none">
          {statuses.map((option) => <option key={option} value={option}>{option === "all" ? "All statuses" : option}</option>)}
        </select>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300"><XCircle className="h-4 w-4" />{error}</div>}

      <div className="overflow-x-auto rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr><th className="px-5 py-4">Event</th><th className="px-5 py-4">Schedule</th><th className="px-5 py-4">Registrations</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEvents.map((event) => {
              const registered = event.registrations?.[0]?.count ?? 0;
              return <tr key={event.id} className="align-top transition-colors hover:bg-muted/30">
                <td className="px-5 py-5"><div className="max-w-[280px]"><p className="font-semibold text-foreground">{event.title}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{event.category.replaceAll("_", " ")} · {event.chapter?.name ?? "Global"}</p></div></td>
                <td className="px-5 py-5"><div className="flex items-start gap-2 text-muted-foreground"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{formatDate(event.start_at)}<br /><span className="text-xs">{event.is_virtual ? "Virtual" : event.location ?? "Location TBA"}</span></span></div></td>
                <td className="px-5 py-5 text-foreground">{registered}{event.capacity ? <span className="text-muted-foreground"> / {event.capacity}</span> : <span className="text-xs text-muted-foreground"> · unlimited</span>}</td>
                <td className="px-5 py-5"><select disabled={isPending} value={event.status} onChange={(e) => changeStatus(event.id, e.target.value as AdminEvent["status"])} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium capitalize outline-none", statusStyles[event.status])}>{statuses.slice(1).map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                <td className="px-5 py-5"><div className="flex items-center justify-end gap-2">
                  <ExportRegistrationsButton slug={event.slug} />
                  <Link href={`/admin/events/${event.slug}`} title="Manage registrations" className="inline-flex h-9 items-center gap-2 rounded-lg border border-foreground/20 px-3 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"><ListChecks className="h-3.5 w-3.5" />Manage</Link>
                  <Link href={`/admin/events/${event.slug}/edit`} title="Edit event" className="inline-flex h-9 items-center gap-2 rounded-lg border border-foreground/20 px-3 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"><Pencil className="h-3.5 w-3.5" />Edit</Link>
                  <Link href={`/events/${event.slug}`} target="_blank" title="View public page" className="inline-flex h-9 items-center gap-2 rounded-lg border border-foreground/20 px-3 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"><ExternalLink className="h-3.5 w-3.5" />View</Link>
                  {event.status !== "cancelled" && (
                    <button type="button" onClick={() => cancelEvent(event)} disabled={isPending} title="Cancel event" className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"><Ban className="h-3.5 w-3.5" />Cancel</button>
                  )}
                  {registered === 0 && (
                    <button type="button" onClick={() => deleteEvent(event)} disabled={isPending} title="Delete event" className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                  )}
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
        {filteredEvents.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No events match these filters.</div>}
      </div>
    </div>
  );
}
