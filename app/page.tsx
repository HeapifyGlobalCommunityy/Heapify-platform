import { Suspense } from "react";
import { brand, communityJourney, gemmaSprintDate, partners, whatWeDo } from "@/lib/site-content";
import { CTAComponent, FeatureCard, Hero, ScrollReveal, SectionWrapper, StatsComponent } from "@/components/site/ui";
import AnnouncementsSection from "@/components/site/AnnouncementsSection";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getSiteStats } from "@/lib/supabase/queries";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      <SectionWrapper eyebrow="Community Stats" title="A growing builder network" description="Real numbers from a community built around action, not hype.">
        <StatsComponent stats={statsData} />
      </SectionWrapper>

      <SectionWrapper eyebrow="What We Do" title="A community built around action" description="Everything Heapify does is about builders — people who learn, ship, and create.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {whatWeDo.map((item) => (
            <FeatureCard key={item.title} eyebrow={item.eyebrow} title={item.title} description={item.description} />
          ))}
        </div>
      </SectionWrapper>

      {/* Latest event from DB — full-width spotlight */}
      <SectionWrapper eyebrow="Events" title="Where builders show up" action={{ label: "See all events", href: "/events", variant: "ghost" }}>
        {latestEvent ? (
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 sm:p-8 md:p-12 backdrop-blur-xl">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_70%_50%,rgba(255,122,0,0.08),transparent)]" />
              <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">{latestEvent.category}</span>
                    <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{latestEvent.status}</span>
                    <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{latestEvent.format}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{latestEvent.title}</h3>
                  {latestEvent.description && (
                    <p className="text-sm leading-7 text-muted-foreground md:text-base max-w-xl">{latestEvent.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary shrink-0" />{latestEvent.date}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary shrink-0" />{latestEvent.location}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:shrink-0 md:items-end">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/events/${latestEvent.slug}`}>View event <ArrowRight className="ml-2 h-4 w-4 shrink-0" /></Link>
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

      <SectionWrapper
        eyebrow="Community Announcements"
        title="What&apos;s happening"
        description="Stay updated with the latest events, opportunities, initiatives, and announcements from the Heapify community."
      >
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 space-y-3 animate-pulse">
                  <div className="h-5 w-3/4 rounded-lg bg-zinc-800/60" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-zinc-800/40" />
                    <div className="h-3.5 w-5/6 rounded bg-zinc-800/40" />
                    <div className="h-3.5 w-2/3 rounded bg-zinc-800/30" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <AnnouncementsSection />
        </Suspense>
      </SectionWrapper>

      <SectionWrapper eyebrow="Community Journey" title="From discovery to leadership" description="The path every Heapify builder takes — from first event to community leader.">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {communityJourney.map((step, index) => (
            <ScrollReveal key={step.step} delay={index * 0.08}>
              <div className="h-full rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
                <div className="text-[11px] font-mono uppercase tracking-[0.32em] text-primary/80">{step.step}</div>
                <h3 className="mt-4 font-display text-xl sm:text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Collaborations" title="In good company" description="Communities, institutions, and ecosystems Heapify has collaborated with.">
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {partners.map((partner, index) => (
            <ScrollReveal key={partner} delay={index * 0.03} className="inline-flex">
              <span className="rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.24em] text-muted-foreground transition-colors duration-300 hover:border-primary/30 hover:text-foreground">
                {partner}
              </span>
            </ScrollReveal>
          ))}
        </div>
      </SectionWrapper>

      {/* Built by the Community */}
      <SectionWrapper eyebrow="Community" title="Built by the Community" description="From hackathons and technical sessions to collaborative projects and open-source initiatives, Heapify is shaped by the builders who participate in it." />

      {/* Flagship event — at the bottom, above CTA */}
      {/* Flagship event — at the bottom, above CTA */}
      <SectionWrapper
        eyebrow="Our Flagship Event"
        title="A glimpse into where we&apos;ve been"
      >
        <ScrollReveal>
          <div className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 sm:p-8 md:p-12 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_24px_60px_-20px_rgba(255,122,0,0.35)] dark:border-primary/25 dark:bg-[linear-gradient(145deg,rgba(255,122,0,0.12)_0%,rgba(255,122,0,0.04)_45%,transparent_100%)] dark:hover:border-primary/55 dark:hover:shadow-[0_28px_70px_-18px_rgba(255,122,0,0.45)]">

            {/* ── Ambient glow layers ── */}
            {/* Large primary orb — top right */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl opacity-40 transition-all duration-700 group-hover:opacity-70 group-hover:scale-110 dark:opacity-70 dark:group-hover:opacity-100"
            />
            {/* Secondary orb — bottom left */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl opacity-30 transition-all duration-700 group-hover:opacity-60 group-hover:scale-105 dark:opacity-50 dark:group-hover:opacity-80"
            />
            {/* Center soft wash */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,122,0,0.12),transparent_65%)] opacity-50 transition-opacity duration-700 group-hover:opacity-80 dark:opacity-70 dark:group-hover:opacity-100"
            />

            {/* Animated drifting glow (slow float) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute -left-1/4 top-1/3 h-64 w-64 animate-[float_12s_ease-in-out_infinite] rounded-full bg-primary/20 blur-3xl opacity-40 dark:opacity-60" />
              <div className="absolute -right-1/4 bottom-1/4 h-56 w-56 animate-[float_16s_ease-in-out_infinite_reverse] rounded-full bg-orange-400/15 blur-3xl opacity-30 dark:opacity-50" />
            </div>

            {/* Soft top edge line */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70 dark:opacity-90"
            />

            {/* Subtle inner grid texture (optional depth) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Content */}
            <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
              {/* Left */}
              <div className="max-w-2xl space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-primary shadow-[0_0_12px_-2px_rgba(255,122,0,0.35)]">
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
