import { Suspense } from "react";
import { brand, communityJourney, partners, stats, whatWeDo } from "@/lib/site-content";
import { CTAComponent, FeatureCard, Hero, SectionWrapper, StatsComponent } from "@/components/site/ui";
import AnnouncementsSection from "@/components/site/AnnouncementsSection";
import { createClient } from "@/lib/supabase/server";
import { getEvents } from "@/lib/supabase/queries";
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
  let isAuthenticated = false;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  const isProd = process.env.NEXT_PUBLIC_STAGE === "production" || process.env.NODE_ENV === "production";

  // Fetch the single most recent/upcoming event from DB
  const { data: dbEvents } = await getEvents(0, 5);
  const latestEvent = dbEvents && dbEvents.length > 0
    ? (() => {
        const ev = dbEvents[0];
        return {
          slug: ev.slug,
          title: ev.title,
          category: formatCategory(ev.category),
          status: computeEventStatus(ev.status, ev.start_at, ev.end_at),
          date: formatDate(ev.start_at),
          location: ev.location || (ev.is_virtual ? "Virtual" : "TBD"),
          format: ev.is_virtual ? "Virtual" : "In-Person",
          description: ev.description || "",
        };
      })()
    : null;

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
        <StatsComponent stats={stats} />
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
          <div className="relative overflow-hidden rounded-[2rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 md:p-12 backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_70%_50%,rgba(255,122,0,0.08),transparent)]" />
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">{latestEvent.category}</span>
                  <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{latestEvent.status}</span>
                  <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{latestEvent.format}</span>
                </div>
                <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{latestEvent.title}</h3>
                {latestEvent.description && (
                  <p className="text-sm leading-7 text-muted-foreground md:text-base max-w-xl">{latestEvent.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{latestEvent.date}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{latestEvent.location}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:shrink-0 md:items-end">
                <Button asChild>
                  <Link href={`/events/${latestEvent.slug}`}>View event <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/events">All events</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-12 text-center text-sm text-muted-foreground">
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
        <div className="grid gap-4 md:grid-cols-4">
          {communityJourney.map((step) => (
            <div key={step.step} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
              <div className="text-[11px] font-mono uppercase tracking-[0.32em] text-primary/80">{step.step}</div>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Collaborations" title="In good company" description="Communities, institutions, and ecosystems Heapify has collaborated with.">
        <div className="flex flex-wrap gap-3">
          {partners.map((partner) => (
            <span key={partner} className="rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {partner}
            </span>
          ))}
        </div>
      </SectionWrapper>

      {/* Built by the Community */}
      <SectionWrapper eyebrow="Community" title="Built by the Community" description="From hackathons and technical sessions to collaborative projects and open-source initiatives, Heapify is shaped by the builders who participate in it." />

      {/* Flagship event — at the bottom, above CTA */}
      <SectionWrapper eyebrow="Our Flagship Event" title="A glimpse into where we&apos;ve been">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.07),rgba(255,255,255,0.01))] p-8 md:p-12 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(255,122,0,0.12)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(255,122,0,0.10),transparent)]" />
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">Hackathon</span>
                <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Past Event</span>
                <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">MSRIT, Bengaluru</span>
              </div>
              <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Build with Gemma:<br className="hidden sm:block" /> Bengaluru AI Sprint
              </h3>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                250 builders. One offline AI sprint. Heapify&apos;s first flagship hackathon brought together students and developers at MSRIT to build innovative solutions using Google&apos;s Gemma ecosystem — and it was just the beginning.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-4 py-3">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Date</div>
                  <div className="mt-1 text-sm font-medium">July 18, 2026</div>
                </div>
                <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-4 py-3">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Participants</div>
                  <div className="mt-1 text-sm font-medium">~250 builders</div>
                </div>
                <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-4 py-3">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Prize Pool</div>
                  <div className="mt-1 font-display text-sm font-semibold text-primary">$1,000</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end md:shrink-0">
              <a
                href="https://www.instagram.com/heapify_/reel/DbgUmHlSW0p/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:-translate-y-0.5"
              >
                Take a glimpse
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/events/build-with-gemma" className="inline-flex items-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-6 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Event details →
              </Link>
            </div>
          </div>
        </div>
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
