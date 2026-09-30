import { Suspense } from "react";
import { brand, communityJourney, gemmaSprintDate } from "@/lib/site-content";
import { CTAComponent, Hero, ScrollReveal, SectionWrapper, StatsComponent } from "@/components/site/ui";

import { createClient } from "@/lib/supabase/server";
import { getEvents, getSiteStats } from "@/lib/supabase/queries";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Trophy, Users, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollaborationsField } from "@/components/site/collaborations-field";
import { WhatWeDoCards } from "@/components/site/WhatWeDoCards";
import { CommunityJourney } from "@/components/site/CommunityJourney";

// ─── Helpers (mirrored from events/page.tsx) ─────────────────────────────
function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    web3: "Web3", blockchain: "Blockchain", hackathon: "Hackathon",
    open_source: "Open Source", workshop: "Workshop", internship_session: "Internship Session",
  };
  return map[cat] ?? cat;
}

function computeEventStatus(db_status: string, start_at: string, end_at: string | null): string {
  if (db_status === "cancelled") return "Cancelled";
  const now = new Date();
  const start = new Date(start_at);
  const end = end_at ? new Date(end_at) : start;
  if (now > end) return "Past";
  if (now >= start && now <= end) return "Ongoing";
  return "Upcoming";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function HomePage() {
  const supabase = await createClient();
  const isSupabaseConfigured = !!supabase;

  let isAuthenticated = false;
  if (isSupabaseConfigured) {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  const isProd = process.env.NEXT_PUBLIC_STAGE === "production" || process.env.NODE_ENV === "production";

  let statsData = [
    {
      label: "Community Members",
      value: 450,
      suffix: "+",
      detail: "Students, developers, and builders in the network",
    },
    {
      label: "Events & Hackathons",
      value: 5,
      suffix: "+",
      detail: "Workshops, technical sessions, and builder initiatives",
    },
    {
      label: "Projects Built",
      value: 25,
      suffix: "+",
      detail: "Real-world prototypes and applications shipped",
    },
    {
      label: "Builder Driven",
      value: 100,
      suffix: "%",
      detail: "Skill-validated learning and collaboration, action not hype",
    },
  ];

  if (isSupabaseConfigured) {
    try {
      const { data: dbStats, error: statsError } = await getSiteStats();
      if (statsError) {
        if (
          statsError.message.includes("Supabase is not configured") ||
          statsError.message.includes("placeholder")
        ) {
          console.warn("[HomePage] site stats are disabled because Supabase is not configured or is using placeholder env values.");
        } else {
          console.error("[HomePage] failed loading site stats:", statsError.message);
        }
      } else if (dbStats && dbStats.length > 0) {
        const statsDetailMap: Record<string, { detail: string; suffix?: string }> = {
          "Community Members": { detail: "Students, developers, and builders in the network", suffix: "+" },
          Events: { detail: "Hackathons, workshops, technical sessions, and builder initiatives", suffix: "+" },
          "Projects Built": { detail: "Real-world prototypes and applications shipped", suffix: "+" },
          "Builder Driven": { detail: "Skill-validated learning and collaboration, action not hype", suffix: "%" },
        };

        statsData = dbStats.map((row) => ({
          label: row.label,
          value: row.value ?? 0,
          suffix: statsDetailMap[row.label]?.suffix ?? "+",
          detail: statsDetailMap[row.label]?.detail ?? "",
        }));
      }
    } catch (error) {
      console.error("[HomePage] unexpected error loading site stats:", error);
    }
  }

  let latestEvent = null;
  if (isSupabaseConfigured) {
    try {
      const { data: dbEvents, error: eventsError } = await getEvents(0, 5);
      if (eventsError) {
        console.warn("[HomePage] failed loading latest event:", eventsError.message);
      } else if (dbEvents && dbEvents.length > 0) {
        const ev = dbEvents[0];
        latestEvent = {
          slug: ev.slug,
          title: ev.title,
          category: formatCategory(ev.category),
          status: computeEventStatus(ev.status, ev.start_at, ev.end_at),
          date: formatDate(ev.start_at),
          location: ev.location || (ev.is_virtual ? "Virtual" : "TBD"),
          format: ev.is_virtual ? "Virtual" : "In-Person",
          description: ev.description || "",
        };
      }
    } catch (error) {
      console.error("[HomePage] unexpected error loading latest event:", error);
    }
  }

  return (
    <>
      <Hero
        title={brand.name}
        tagline={brand.tagline}
        description="Heapify Global Community is a builder-focused technology community bringing together students, developers, AI enthusiasts, and creators to learn, build, collaborate, compete, and create real-world impact."
        actions={[
          { label: (!isProd && isAuthenticated) ? "Go to Dashboard" : "Join the Community", href: (!isProd && isAuthenticated) ? "/dashboard" : "/forms" },
          { label: "Explore Events", href: "/events", variant: "ghost" },
        ]}
      />

      <StatsComponent
        eyebrow="Community Stats"
        title="A Growing Builder Network"
        description="Real numbers from a community built around action, not hype."
        stats={statsData}
      />

      {/* What We Do Cards carousel matching the reference photo */}
      <WhatWeDoCards />

      {/* Latest event from DB — full-width spotlight */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="text-center space-y-2.5 mb-8 sm:mb-12">
          <ScrollReveal>
            <div>
              <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.28em] text-[#FF5722] dark:text-[#ff7a00] font-bold mb-2">
                EVENTS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground font-display">
                Where Builders Show Up
              </h2>
            </div>
          </ScrollReveal>
        </div>

        {latestEvent ? (
          <ScrollReveal>
            <div className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200/90 dark:border-zinc-800 bg-[#F4F5F7] dark:bg-[#18181b] p-6 sm:p-8 md:p-12 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300">
              <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">
                      {latestEvent.category}
                    </span>
                    <span className="rounded-full border border-zinc-300/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      {latestEvent.status}
                    </span>
                    <span className="rounded-full border border-zinc-300/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      {latestEvent.format}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                    {latestEvent.title}
                  </h3>
                  {latestEvent.description && (
                    <p className="text-sm leading-7 text-slate-600 dark:text-zinc-400 md:text-base max-w-xl">
                      {latestEvent.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                      {latestEvent.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      {latestEvent.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:shrink-0 md:items-end">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/events/${latestEvent.slug}`}>
                      View event <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full sm:w-auto">
                    <Link href="/events">All events</Link>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="rounded-[2rem] border border-zinc-200/90 dark:border-zinc-800 bg-[#F4F5F7] dark:bg-[#18181b] p-8 sm:p-12 text-center text-sm text-muted-foreground">
            No upcoming events right now — check back soon.
          </div>
        )}
      </section>

      <CommunityJourney />

      <SectionWrapper title="">
        <CollaborationsField />
      </SectionWrapper>

      {/* Flagship event — at the bottom, above CTA */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="text-center space-y-2.5 mb-8 sm:mb-12">
          <ScrollReveal>
            <div>
              <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.28em] text-[#FF5722] dark:text-[#ff7a00] font-bold mb-2">
                OUR FLAGSHIP EVENT
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground font-display">
                A glimpse into where we&apos;ve been
              </h2>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200/90 dark:border-zinc-800 bg-[#F4F5F7] dark:bg-[#18181b] p-6 sm:p-10 md:p-14 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300">
            {/* Subtle decorative concentric circle accents */}
            <div className="absolute -right-28 -top-24 w-80 h-80 rounded-full border border-orange-500/10 dark:border-orange-500/5 pointer-events-none" />
            <div className="absolute -right-14 -top-12 w-60 h-60 rounded-full border border-orange-500/10 dark:border-orange-500/5 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Column */}
              <div className="max-w-2xl space-y-5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-[#FF5722] dark:text-[#ff7a00] font-bold shadow-sm">
                    Hackathon
                  </span>
                  <span className="rounded-full border border-zinc-300/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Past Event
                  </span>
                  <span className="rounded-full border border-zinc-300/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FF5722]" />
                    MSRIT, Bengaluru
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight text-foreground leading-[1.12]">
                  Build with Gemma:{" "}
                  <span className="text-[#FF5722] dark:text-[#ff7a00]">
                    Bengaluru AI Sprint
                  </span>
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 md:text-base md:leading-8 font-normal">
                  250 builders. One offline AI sprint. Heapify&apos;s first flagship
                  hackathon brought together students and developers at MSRIT to build
                  innovative solutions using Google&apos;s Gemma ecosystem — and it was
                  just the beginning.
                </p>

                {/* Stat Highlight Cards */}
                <div className="grid gap-3.5 sm:grid-cols-3 pt-2">
                  <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-[#FF5722]" />
                      Date
                    </div>
                    <div className="mt-2 text-sm sm:text-base font-bold text-foreground">
                      {gemmaSprintDate || "18 July 2026"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <Users className="h-4 w-4 text-[#FF5722]" />
                      Participants
                    </div>
                    <div className="mt-2 text-sm sm:text-base font-bold text-foreground">
                      ~250 builders
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      <Trophy className="h-4 w-4 text-[#FF5722]" />
                      Prize Pool
                    </div>
                    <div className="mt-2 font-display text-base sm:text-lg font-black text-[#FF5722] dark:text-[#ff7a00]">
                      $1,000
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex shrink-0 flex-col gap-3.5 sm:flex-row lg:flex-col lg:items-stretch w-full lg:w-56 pt-2 lg:pt-0">
                <a
                  href="https://www.instagram.com/heapify_/reel/DbgUmHlSW0p/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7A45] hover:from-[#e64a19] hover:to-[#FF5722] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_25px_-4px_rgba(255,87,34,0.35)] hover:shadow-[0_12px_32px_-4px_rgba(255,87,34,0.55)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white shrink-0" />
                  Take a glimpse
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
                </a>
                <Link
                  href="/events/build-with-gemma"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 px-6 py-3.5 text-sm font-bold text-foreground hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-0.5 shadow-sm active:scale-95 text-center"
                >
                  Event details →
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <CTAComponent
        title="Ready to Build Something?"
        description="Join a community built for people who create, collaborate, and ship."
        actions={[
          { label: (!isProd && isAuthenticated) ? "Go to Dashboard" : "Join Heapify", href: (!isProd && isAuthenticated) ? "/dashboard" : "/forms" },
          { label: "Explore Events", href: "/events", variant: "ghost" },
        ]}
      />
    </>
  );
}
