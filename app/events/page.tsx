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
import { Calendar } from "lucide-react";

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
    <main className="w-full flex flex-col">
      {/* Split Hero Section */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <div className="w-full rounded-[2.5rem] bg-gradient-to-br from-[#FF5722] to-[#FF8A50] dark:from-[#E64A19] dark:to-[#d84315] pt-16 pb-16 px-6 sm:px-12 lg:px-16 relative overflow-hidden shadow-xl">
          {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,white,transparent_90%)]" />

        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center relative z-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-tight">
              Where Ideas Meet Opportunity
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-xl">
              Explore opportunities that match your interests, sharpen your skills, and give you a platform to build something extraordinary.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              <div className="relative w-full sm:max-w-md">
                <input 
                  type="text" 
                  placeholder="Search hiring hackathons..." 
                  className="w-full h-12 pl-12 pr-4 rounded-full border-none bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 shadow-lg font-medium outline-none"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <button className="w-full sm:w-auto px-6 h-12 bg-white text-primary font-bold rounded-full hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2 shrink-0">
                My Programs <span className="text-xl leading-none -mt-0.5">›</span>
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-zinc-900/95 dark:bg-zinc-950/95 border border-white/10 rounded-[2rem] p-10 md:p-14 flex flex-col items-center justify-center text-center shadow-2xl h-[300px] md:h-[350px]">
              <Calendar className="w-10 h-10 text-white mb-4 stroke-1" />
              <h3 className="text-white font-bold text-xl mb-2">Upcoming Programs</h3>
              <p className="text-white/60 text-sm">Check back soon for new announcements</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="w-full bg-background min-h-[400px] py-16 px-4 sm:px-8 lg:px-16 flex flex-col items-center">
        <div className="max-w-[1400px] w-full">
          {/* Empty State Card */}
          <div className="bg-card border border-border rounded-[2rem] p-16 flex flex-col items-center justify-center text-center shadow-sm max-w-4xl mx-auto mb-16 h-[300px]">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50 stroke-1" />
            <h3 className="text-foreground font-bold text-xl mb-2">No upcoming events scheduled right now</h3>
            <p className="text-muted-foreground text-sm">New hackathons and workshops will be published soon.</p>
          </div>
          
          <EventsExplorer events={activeEvents} pastEvents={pastEvents} categories={dynamicCategories} />
        </div>
      </div>
    </main>
  );
}
