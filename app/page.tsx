import { Suspense } from "react";
import { brand, communityJourney, featuredEvents, partners, stats, whatWeDo } from "@/lib/site-content";
import { CTAComponent, EventCard, FeatureCard, Hero, SectionWrapper, StatsComponent } from "@/components/site/ui";
import AnnouncementsSection from "@/components/site/AnnouncementsSection";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  let isAuthenticated = false;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  const isProd = process.env.NEXT_PUBLIC_STAGE === "production" || process.env.NODE_ENV === "production";

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

      {/* Flagship Hackathon Card */}
      <SectionWrapper eyebrow="Flagship Event" title="Build with Gemma: Bengaluru AI Sprint">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-[linear-gradient(135deg,rgba(255,122,0,0.10),rgba(255,255,255,0.02))] p-8 md:p-12 backdrop-blur-xl">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(255,122,0,0.12),transparent)]" />
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">Hackathon</span>
                <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Past Event</span>
                <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Offline</span>
              </div>
              <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Build with Gemma:<br className="hidden sm:block" /> Bengaluru AI Sprint
              </h3>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                Heapify&apos;s flagship AI hackathon — an offline sprint at Ramaiah Institute of Technology, Bengaluru, where builders came together to develop innovative solutions using Google&apos;s Gemma ecosystem.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-4 py-3">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Date</div>
                  <div className="mt-1 text-sm font-medium">July 18, 2026</div>
                </div>
                <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-4 py-3">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Location</div>
                  <div className="mt-1 text-sm font-medium">MSRIT, Bengaluru</div>
                </div>
                <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-4 py-3">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Participants</div>
                  <div className="mt-1 text-sm font-medium">~250 builders</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end md:shrink-0">
              <div className="rounded-xl border border-glass-border bg-glass-bg/60 px-5 py-4 text-center md:text-right">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Prize Pool</div>
                <div className="mt-1 font-display text-2xl font-semibold text-primary">$1,000</div>
              </div>
              <Link href="/events/build-with-gemma-bengaluru" className="inline-flex items-center gap-2 rounded-lg border border-glass-border bg-glass-bg px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                View event details →
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="What We Do" title="A community built around action" description="Everything Heapify does is about builders — people who learn, ship, and create.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {whatWeDo.map((item) => (
            <FeatureCard key={item.title} eyebrow={item.eyebrow} title={item.title} description={item.description} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Events" title="Where builders show up" action={{ label: "See all events", href: "/events", variant: "ghost" }}>
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
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
            <div key={step.step} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
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

      {/* Built by the Community — replaces fake testimonials */}
      <SectionWrapper eyebrow="Community" title="Built by the Community" description="From hackathons and technical sessions to collaborative projects and open-source initiatives, Heapify is shaped by the builders who participate in it." />

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
