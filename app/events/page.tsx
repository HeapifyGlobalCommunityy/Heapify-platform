// app/events/page.tsx
// Public events directory page.
//
// 1. ISR Caching:
//    export const revalidate = 60;
//    Caches the list for 60 seconds. Safe and highly performant for public listings.
//
// 2. Database Fetch:
//    Queries all events (no end_at filter) so both active and past events appear.
//
// 3. Dynamic Filtering:
//    Builds the categories filter dynamically based on the active category list in DB.
//    Past events are shown below active events with a muted visual treatment.

export const revalidate = 60;

import { getEvents } from "@/lib/supabase/queries";
import { EventsExplorer, SectionWrapper } from "@/components/site/ui";

// Helper to format database category enum value to UI label
function formatCategory(category: string): string {
  const map: Record<string, string> = {
    web3: "Web3",
    blockchain: "Blockchain",
    hackathon: "Hackathon",
    open_source: "Open Source",
    workshop: "Workshop",
    internship_session: "Internship Session",
  };
  return map[category] ?? category;
}

// Helper to format database status to UI label
function formatStatus(status: string): string {
  if (!status) return "Upcoming";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// 3-state computation
function computeEventStatus(db_status: string, start_at: string, end_at: string | null): string {
  if (db_status === 'cancelled') return 'cancelled';
  const now = new Date();
  const start = new Date(start_at);
  const end = end_at ? new Date(end_at) : start;
  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'ongoing';
  return 'upcoming';
}

// Helper to extract date (e.g., "12 Jul 2026")
function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Helper to extract time (e.g., "6:00 PM")
function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type MappedEvent = {
  slug: string;
  title: string;
  category: string;
  status: string;
  date: string;
  time: string;
  format: string;
  location: string;
  description: string;
  summary: string;
};

export default async function EventsPage() {
  const { data: dbEvents, error } = await getEvents(0, 50);

  if (error || !dbEvents) {
    console.error("[EventsPage] error loading events:", error?.message);
    return (
      <SectionWrapper
        title="Events & Experiences"
        description="Join sessions, workshops, and flagship community events happening globally."
        className="pt-40 pb-12"
      >
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {error?.message ?? "Service temporarily unavailable. Please try again later."}
        </div>
      </SectionWrapper>
    );
  }

  // Map database rows to UI structure, carrying computed status
  const mappedEvents: (MappedEvent & { isPast: boolean })[] = dbEvents.map((ev: {
    slug: string;
    title: string;
    category: string;
    status: string;
    start_at: string;
    end_at: string | null;
    is_virtual: boolean;
    location: string | null;
    description: string | null;
  }) => {
    const formattedCat = formatCategory(ev.category);
    const computedStatus = computeEventStatus(ev.status, ev.start_at, ev.end_at);
    const isPast = computedStatus === "completed" || computedStatus === "cancelled";
    return {
      slug: ev.slug,
      title: ev.title,
      category: formattedCat,
      status: formatStatus(computedStatus),
      date: formatEventDate(ev.start_at),
      time: formatEventTime(ev.start_at),
      format: ev.is_virtual ? "Virtual" : "In-Person",
      location: ev.location || (ev.is_virtual ? "Virtual" : "TBD"),
      description: ev.description || "",
      summary: ev.description || "",
      isPast,
    };
  });

  // Split into two temporal groups
  const activeEvents: MappedEvent[] = mappedEvents
    .filter((e) => !e.isPast)
    .map(({ isPast: _isPast, ...rest }) => rest);

  const pastEvents: MappedEvent[] = mappedEvents
    .filter((e) => e.isPast)
    .map(({ isPast: _isPast, ...rest }) => rest);

  // Build category list from active events only — keeps filter relevant
  const dynamicCategories: string[] = [
    "All",
    ...Array.from(new Set(activeEvents.map((e: { category: string }) => e.category))) as string[],
  ];

  return (
    <>
      <SectionWrapper
        title="Events & Experiences"
        description="Join our developer workshops, space hackathons, and flagship community sprints happening globally."
        className="pt-40 pb-12"
      >
        <div className="mt-8">
          <EventsExplorer
            events={activeEvents}
            pastEvents={pastEvents}
            categories={dynamicCategories}
          />
        </div>
      </SectionWrapper>
    </>
  );
}
