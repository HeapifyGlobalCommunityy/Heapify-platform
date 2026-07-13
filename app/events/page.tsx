// app/events/page.tsx
// Public events directory page.
//
// 1. ISR Caching:
//    export const revalidate = 60;
//    Caches the list for 60 seconds. Safe and highly performant for public listings.
//
// 2. Database Fetch:
//    Queries the first 20 events from the `events` table.
//
// 3. Dynamic Filtering:
//    Builds the categories filter dynamically based on the active category list in DB.

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

export default async function EventsPage() {
  const { data: dbEvents, error } = await getEvents(0, 20);

  if (error || !dbEvents) {
    console.error("[EventsPage] error loading events:", error?.message);
    return (
      <SectionWrapper
        title="Events & Experiences"
        description="Join sessions, workshops, and flagship community events happening globally."
        className="pt-40 pb-12"
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-10 text-center text-sm text-muted-foreground">
          {error?.message ?? "Service temporarily unavailable. Please try again later."}
        </div>
      </SectionWrapper>
    );
  }

  // Map database rows to UI structure
  const mappedEvents = dbEvents.map((ev) => {
    const formattedCat = formatCategory(ev.category);
    return {
      slug: ev.slug,
      title: ev.title,
      category: formattedCat,
      status: formatStatus(ev.status),
      date: formatEventDate(ev.start_at),
      time: formatEventTime(ev.start_at),
      format: ev.is_virtual ? "Virtual" : "In-Person",
      location: ev.location || (ev.is_virtual ? "Virtual" : "TBD"),
      description: ev.description || "",
      summary: ev.description || "",
    };
  });

  // Construct dynamic category list based on existing events
  const dynamicCategories = [
    "All",
    ...Array.from(new Set(mappedEvents.map((e) => e.category))),
  ];

  return (
    <>
      <SectionWrapper
        title="Events & Experiences"
        description="Join sessions, workshops, and flagship community events happening globally."
        className="pt-40 pb-12"
      >
        <div className="mt-8">
          <EventsExplorer events={mappedEvents} categories={dynamicCategories} />
        </div>
      </SectionWrapper>
    </>
  );
}
