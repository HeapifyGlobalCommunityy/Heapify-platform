import { Suspense } from "react";
import { brand, communityJourney, gemmaSprintDate, whatWeDo } from "@/lib/site-content";
import { CTAComponent, FeatureCard, Hero, ScrollReveal, SectionWrapper, StatsComponent } from "@/components/site/ui";
import AnnouncementsSection from "@/components/site/AnnouncementsSection";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getSiteStats } from "@/lib/supabase/queries";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollaborationsField } from "@/components/site/collaborations-field";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

      {/* Stats */}
      <SectionWrapper
        eyebrow="Community Stats"
        title="A Growing Builder Network"
        description="Real numbers from a community built around action, not hype."
      >
        <StatsComponent stats={statsData} />
      </SectionWrapper>

      {/* What We Do */}
      <SectionWrapper
        eyebrow="What We Do"
        title="A Community Built Around Action"
        description="Everything Heapify does is about builders — people who learn, ship, and create."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {whatWeDo.map((item) => (
            <FeatureCard
              key={item.title}
              eyebrow={item.eyebrow}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </SectionWrapper>

      {/* Latest Event */}
      <SectionWrapper
        eyebrow="Events"
        title="Where Builders Show Up"
        action={{ label: "See all events", href: "/events", variant: "ghost" }}
      >
        {latestEvent ? (
          <ScrollReveal>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex flex-col gap-6 p-7 sm:p-8 md:flex-row md:items-center md:justify-between md:p-10">
                <div className="max-w-2xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                      {latestEvent.category}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      {latestEvent.status}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      {latestEvent.format}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {latestEvent.title}
                  </h3>
                  {latestEvent.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                      {latestEvent.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                      {latestEvent.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {latestEvent.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:shrink-0 md:items-end">
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
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No upcoming events right now — check back soon.
          </div>
        )}
      </SectionWrapper>

      {/* Announcements */}
      <SectionWrapper
        eyebrow="Community Announcements"
        title="What&apos;s Happening"
        description="Stay updated with the latest events, opportunities, initiatives, and announcements from the Heapify community."
      >
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3 animate-pulse">
                  <div className="h-5 w-3/4 rounded-md bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-muted/60" />
                    <div className="h-3.5 w-5/6 rounded bg-muted/60" />
                    <div className="h-3.5 w-2/3 rounded bg-muted/40" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <AnnouncementsSection />
        </Suspense>
      </SectionWrapper>

      {/* Community Journey */}
      <SectionWrapper>
        <ScrollReveal className="mb-10 max-w-2xl space-y-3">
          <div className="text-xs font-medium uppercase tracking-widest text-primary/80">
            Community Journey
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From discovery to leadership.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            The path every Heapify builder takes — from first event to community leader.
          </p>
          <div className="h-px w-12 bg-border" />
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communityJourney.map((step, index) => (
            <ScrollReveal key={step.step} delay={index * 0.07}>
              <div className="group rounded-xl border border-border bg-card p-6 h-full hover:border-primary/30 transition-colors duration-200">
                <div className="text-[10px] font-medium uppercase tracking-widest text-primary/70">
                  {step.step}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </SectionWrapper>

      {/* Collaborations */}
      <SectionWrapper>
        <CollaborationsField />
      </SectionWrapper>

      {/* Flagship Event — Build with Gemma */}
      <SectionWrapper
        eyebrow="Our Flagship Event"
        title="A glimpse into where we&apos;ve been"
      >
        <ScrollReveal>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
            <div className="flex flex-col gap-8 p-7 sm:p-8 md:flex-row md:items-start md:justify-between md:gap-10 md:p-10">
              {/* Left */}
              <div className="max-w-2xl space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                    Hackathon
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Past Event
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    MSRIT, Bengaluru
                  </span>
                </div>

                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Build with Gemma: Bengaluru AI Sprint
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  250 builders. One offline AI sprint. Heapify&apos;s first flagship
                  hackathon brought together students and developers at MSRIT to build
                  innovative solutions using Google&apos;s Gemma ecosystem.
                </p>

                {/* Stats row */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Date", value: gemmaSprintDate || "July 18, 2026" },
                    { label: "Participants", value: "~250 builders" },
                    { label: "Prize Pool", value: "$1,000", highlight: true },
                  ].map((item) => (
                    <ScrollReveal key={item.label}>
                      <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
                        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          {item.label}
                        </div>
                        <div className={`mt-1.5 text-sm font-semibold ${item.highlight ? "text-primary" : "text-foreground"}`}>
                          {item.value}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col md:items-end">
                <a
                  href="https://www.instagram.com/heapify_/reel/DbgUmHlSW0p/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ea6a0e]"
                >
                  Take a glimpse
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
                <Link
                  href="/events/build-with-gemma"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary/30 hover:text-foreground"
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
