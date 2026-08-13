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
import { eventCatalog } from "@/lib/site-content";
import { Calendar, Trophy, Sparkles, Flame } from "lucide-react";

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
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {error?.message ?? "Service temporarily unavailable. Please try again later."}
        </div>
      </SectionWrapper>
    );
  }

  // Filter out mock / example events from the database query results
  const actualDbEvents = dbEvents.filter((ev: {
    title: string;
    slug: string;
    description: string | null;
  }) => {
    const text = (ev.title + " " + ev.slug + " " + (ev.description || "")).toLowerCase();
    return !text.includes("example") && !text.includes("test") && !text.includes("mock");
  });

  // Map database rows to UI structure
  const mappedDbEvents = actualDbEvents.map((ev: {
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
    };
  });

  // Combine database events and pre-configured static events, avoiding duplicate slugs
  const allEvents = [...mappedDbEvents];
  for (const staticEv of eventCatalog) {
    if (!allEvents.some((e) => e.slug === staticEv.slug)) {
      allEvents.push({
        ...staticEv,
        summary: staticEv.description,
      });
    }
  }

  // Sort chronologically with the latest event at the top (descending)
  allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Construct dynamic category list based on existing events
  const dynamicCategories: string[] = [
    "All",
    ...Array.from(new Set(allEvents.map((e: { category: string }) => e.category))) as string[],
  ];

  return (
    <>
      <SectionWrapper
        title="Events & Experiences"
        description="Join our developer workshops, space hackathons, and flagship community sprints happening globally."
        className="pt-40 pb-12"
      >
        {/* Dynamic Events Quick Stats Ribbon */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 max-w-5xl mt-6 mb-12">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_24px_-8px_rgba(255,122,0,0.12)] dark:border-glass-border dark:bg-glass-bg/40 dark:backdrop-blur-md">
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
              <Trophy className="h-4 w-4" /> Flagship Sprints
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">1 Concluded</div>
            <div className="text-[10px] text-muted-foreground mt-1">Build with Gemma AI Sprint</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_24px_-8px_rgba(255,122,0,0.12)] dark:border-glass-border dark:bg-glass-bg/40 dark:backdrop-blur-md">
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
              <Calendar className="h-4 w-4" /> Learning Sessions
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">5 Conducted</div>
            <div className="text-[10px] text-muted-foreground mt-1">GSoC prep, Space tech, Career talks</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_24px_-8px_rgba(255,122,0,0.12)] dark:border-glass-border dark:bg-glass-bg/40 dark:backdrop-blur-md">
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
              <Flame className="h-4 w-4" /> Active Chapters
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">4 Chapters</div>
            <div className="text-[10px] text-muted-foreground mt-1">Spanning multiple institutions</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_24px_-8px_rgba(255,122,0,0.12)] dark:border-glass-border dark:bg-glass-bg/40 dark:backdrop-blur-md">
            <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Global Scope
            </div>
            <div className="mt-2 text-2xl font-bold font-display text-foreground">Hybrid Format</div>
            <div className="text-[10px] text-muted-foreground mt-1">Virtual orientative + physical hackathons</div>
          </div>
        </div>

        <div className="mt-8 border-t border-glass-border/40 pt-8">
          <EventsExplorer events={allEvents} categories={dynamicCategories} />
        </div>
      </SectionWrapper>
    </>
  );
}
