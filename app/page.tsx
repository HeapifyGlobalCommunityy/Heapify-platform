import { Suspense } from "react";
import { brand, communityJourney, gemmaSprintDate } from "@/lib/site-content";
import { CTAComponent, Hero, ScrollReveal, SectionWrapper, StatsComponent } from "@/components/site/ui";

import { createClient } from "@/lib/supabase/server";
import { getEvents, getSiteStats } from "@/lib/supabase/queries";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
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
    { label: "Community Members", value: 450, detail: "Students, developers, and builders in the network" },
    { label: "Events", value: 5, detail: "Hackathons, workshops, technical sessions, and builder initiatives" },
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
        const statsDetailMap: Record<string, string> = {
          "Community Members": "Students, developers, and builders in the network",
          Events: "Hackathons, workshops, technical sessions, and builder initiatives",
        };

        statsData = dbStats.map((row) => ({
          label: row.label,
          value: row.value ?? 0,
          detail: statsDetailMap[row.label] ?? "",
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

      <SectionWrapper
        eyebrow="Community Stats"
        title="A Growing Builder Network"
        description="Real numbers from a community built around action, not hype."
      >
        <StatsComponent stats={statsData} />
      </SectionWrapper>

      {/* What We Do Cards carousel matching the reference photo */}
      <WhatWeDoCards />

      {/* Latest event from DB — full-width spotlight */}
      <SectionWrapper
        eyebrow="Events"
        eyebrowClassName="text-[#ff7a00] font-mono text-xs uppercase tracking-[0.28em] font-semibold"
        title="Where Builders Show Up"
        titleClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#ff7a00] drop-shadow-sm font-display uppercase"
        action={{ label: "See all events", href: "/events", variant: "ghost" }}
      >
        {latestEvent ? (
          <ScrollReveal>
            <div className="group relative overflow-hidden rounded-[2rem] border border-border/80 dark:border-white/10 bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF6] to-[#FFF7ED] dark:from-[#141416] dark:via-[#111113] dark:to-[#0d0d0f] p-6 sm:p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(255,87,34,0.12)] hover:shadow-[0_20px_50px_-12px_rgba(255,87,34,0.25)] transition-all duration-300">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_70%_50%,rgba(255,87,34,0.12),transparent)] opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">
                      {latestEvent.category}
                    </span>
                    <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      {latestEvent.status}
                    </span>
                    <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                      {latestEvent.format}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    {latestEvent.title}
                  </h3>
                  {latestEvent.description && (
                    <p className="text-sm leading-7 text-muted-foreground md:text-base max-w-xl">
                      {latestEvent.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
          <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-8 sm:p-12 text-center text-sm text-muted-foreground">
            No upcoming events right now — check back soon.
          </div>
        )}
      </SectionWrapper>

      <CommunityJourney />

      <SectionWrapper title="">
        <CollaborationsField />
      </SectionWrapper>

      {/* Flagship event — at the bottom, above CTA */}
      <SectionWrapper
        eyebrow="Our Flagship Event"
        title="A glimpse into where we&apos;ve been"
      >
        <ScrollReveal>
          <div className="group relative overflow-hidden rounded-[2rem] border border-border/80 dark:border-white/10 bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF6] to-[#FFF7ED] dark:from-[#141416] dark:via-[#111113] dark:to-[#0d0d0f] p-6 sm:p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(255,87,34,0.12)] hover:shadow-[0_20px_50px_-12px_rgba(255,87,34,0.25)] transition-all duration-300">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_70%_50%,rgba(255,87,34,0.12),transparent)] opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Content */}
            <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
              {/* Left */}
              <div className="max-w-2xl space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-primary shadow-[0_0_12px_-2px_rgba(255,87,34,0.35)]">
                    Hackathon
                  </span>
                  <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Past Event
                  </span>
                  <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    MSRIT, Bengaluru
                  </span>
                </div>

                <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  Build with Gemma:
                  <br className="hidden sm:block" /> Bengaluru AI Sprint
                </h3>

                <p className="text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                  250 builders. One offline AI sprint. Heapify&apos;s first flagship
                  hackathon brought together students and developers at MSRIT to build
                  innovative solutions using Google&apos;s Gemma ecosystem — and it was
                  just the beginning.
                </p>

                {/* Stats */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <ScrollReveal delay={0.1}>
                    <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3.5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/40 dark:hover:bg-primary/[0.06]">
                      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Date
                      </div>
                      <div className="mt-1.5 text-sm font-medium text-foreground">
                        {gemmaSprintDate || "July 18, 2026"}
                      </div>
                    </div>
                  </ScrollReveal>
                  <ScrollReveal delay={0.2}>
                    <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3.5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/40 dark:hover:bg-primary/[0.06]">
                      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Participants
                      </div>
                      <div className="mt-1.5 text-sm font-medium text-foreground">
                        ~250 builders
                      </div>
                    </div>
                  </ScrollReveal>
                  <ScrollReveal delay={0.3}>
                    <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3.5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-primary/40 dark:hover:bg-primary/[0.06]">
                      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Prize Pool
                      </div>
                      <div className="mt-1.5 font-display text-sm font-semibold text-primary">
                        $1,000
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col md:items-end">
                <a
                  href="https://www.instagram.com/heapify_/reel/DbgUmHlSW0p/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(255,122,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ea6a0e] hover:shadow-[0_0_32px_-4px_rgba(255,122,0,0.7)]"
                >
                  Take a glimpse
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
                <Link
                  href="/events/build-with-gemma"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-6 py-3 text-sm text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:text-foreground dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                >
                  Event details →
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </SectionWrapper>

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
