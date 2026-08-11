// app/events/[slug]/page.tsx
// Server-rendered event detail page.
//
// 1. ISR Caching:
//    export const revalidate = 60;
//    Caches page content for 60 seconds and updates in the background. Snappy public load.
//
// 2. Database Fetch:
//    Queries the event by unique slug, queries current registration count,
//    and queries 2 other events for the "related events" section.
//
// 3. Dynamic Configuration:
//    Uses the event's database fields directly for capacity, hackathon settings,
//    team requirements, and custom questions.

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventBySlug } from "@/lib/supabase/queries";
import EventDetailClient from "@/components/events/EventDetailClient";
import { eventCatalog } from "@/lib/site-content";
import { canExportEventRegistrations } from "@/lib/auth/event-registration-export";

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

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ register?: string }>;
}) {
  const { slug } = await params;
  const { register } = await searchParams;

  // 1. Fetch main event by slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ev: any = null;
  const { data: dbEv, error } = await getEventBySlug(slug);
  
  if (dbEv) {
    ev = dbEv;
  } else {
    // Check fallback static catalog
    const staticEv = eventCatalog.find((e) => e.slug === slug);
    if (staticEv) {
      // Parse dates safely
      const parsedDate = new Date(staticEv.date).toString() !== "Invalid Date"
        ? new Date(staticEv.date).toISOString()
        : new Date().toISOString();

      ev = {
        id: "00000000-0000-0000-0000-000000000000",
        title: staticEv.title,
        category: staticEv.category.toLowerCase().replace(" ", "_"),
        status: staticEv.status.toLowerCase() === "past" ? "completed" : staticEv.status.toLowerCase(),
        start_at: parsedDate,
        end_at: parsedDate,
        is_virtual: staticEv.format.toLowerCase() === "virtual",
        location: staticEv.location,
        description: staticEv.description,
        capacity: 0,
        banner_url: null,
        host_name: "Heapify Global Community",
        registration_state: "concluded",
        agenda: [],
        speakers: [],
      };
    }
  }

  if (error || !ev) {
    notFound();
  }

  // 2. Fetch current registration count
  const supabase = await createClient();
  let registeredCount = 0;
  if (ev.capacity != null && ev.capacity > 0) {
    if (supabase) {
      const { count, error: countError } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", ev.id);
      if (!countError && count !== null) {
        registeredCount = count;
      }
    }
  }

  // 3. Fetch up to 2 other events for the "related events" section
  let related: {
    slug: string;
    title: string;
    category: string;
    status: string;
    date: string;
    time: string;
    location: string;
  }[] = [];
  if (supabase) {
    const { data: relatedEvents } = await supabase
      .from("events")
      .select("slug, title, category, status, start_at, location")
      .neq("slug", slug)
      .limit(2);
    if (relatedEvents) {
      related = relatedEvents.map((r) => ({
        slug: r.slug,
        title: r.title,
        category: formatCategory(r.category),
        status: formatStatus(computeEventStatus(r.status, r.start_at, r.start_at)),
        date: formatEventDate(r.start_at),
        time: formatEventTime(r.start_at),
        location: r.location || "TBD",
      }));
    }
  }

  let canExportRegistrations = false;
  if (supabase && ev.id !== "00000000-0000-0000-0000-000000000000") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      canExportRegistrations = await canExportEventRegistrations(supabase, user.id, {
        chapter_id: ev.chapter_id ?? null,
      });
    }
  }

  // Fallback to static related events if database returns none
  if (related.length === 0) {
    related = eventCatalog
      .filter((e) => e.slug !== slug)
      .slice(0, 2)
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        category: e.category,
        status: e.status,
        date: e.date,
        time: e.time,
        location: e.location,
      }));
  }

  const computedStatus = computeEventStatus(ev.status, ev.start_at, ev.end_at);

  // Map to the format EventDetailClient expects
  const formattedEvent = {
    slug: ev.slug,
    title: ev.title,
    banner: ev.banner_url || ev.description || "",
    category: formatCategory(ev.category),
    status: formatStatus(computedStatus),
    date: formatEventDate(ev.start_at),
    time: formatEventTime(ev.start_at),
    location: ev.location || (ev.is_virtual ? "Virtual" : "TBD"),
    host: "Heapify Global Community",
    chapterName: (ev as unknown as { chapters: { name: string } | null }).chapters?.name || null,
    agenda: ((ev.agenda || []) as unknown as { time?: string; item?: string; title?: string }[]).map((a) => ({
      time: a.time ?? "",
      // DB may store the text as 'item' or 'title' — accept both
      item: a.item ?? a.title ?? "",
    })),
    speakers: ((ev.speakers || []) as unknown as { name?: string; role?: string; focus?: string; bio?: string; photo_url?: string; photoUrl?: string }[]).map((s) => ({
      name: s.name ?? "",
      // DB may store descriptor as 'role', 'focus', or 'bio'
      role: s.role ?? s.focus ?? s.bio ?? "",
      bio: s.bio ?? s.role ?? s.focus ?? "",
      photo_url: s.photo_url ?? s.photoUrl ?? "",
    })),
  };

  const mergedEvent = {
    title: ev.title,
    slug: ev.slug,
    category: formatCategory(ev.category),
    isHackathon: ev.is_hackathon ?? false,
    date: formatEventDate(ev.start_at),
    time: formatEventTime(ev.start_at),
    location: ev.location || (ev.is_virtual ? "Virtual" : "TBD"),
    capacity: ev.capacity ?? 0,
    registeredCount: registeredCount,
    bannerUrl: ev.banner_url || null,
    // Always normalize to null — never undefined — so RegistrationForm's
    // optional-chaining on teamConfig?.allowSolo never throws.
    teamConfig: ev.team_config || null,
    customQuestions: ev.custom_questions || [],
  };

  const isPast = computedStatus === "completed";

  // ?register=true opens the registration panel inline.
  // Past events ignore this flag — registration is closed.
  const initialRegistering = register === "true" && !isPast;

  return (
    <EventDetailClient
      event={formattedEvent}
      mergedEvent={mergedEvent}
      slug={slug}
      related={related}
      isPast={isPast}
      initialRegistering={initialRegistering}
      canExportRegistrations={canExportRegistrations}
    />
  );
}
