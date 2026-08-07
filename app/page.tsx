import { Suspense } from "react";
import { brand, communityJourney, featuredEvents, featuredProjects, partners, stats, testimonials, whatWeDo } from "@/lib/site-content";
import { CTAComponent, EventCard, FeatureCard, Hero, ProjectCard, SectionWrapper, StatsComponent } from "@/components/site/ui";
import AnnouncementsSection from "@/components/site/AnnouncementsSection";

export default function HomePage() {
  return (
    <>
      <Hero
        title={brand.name}
        tagline={brand.tagline}
        description="A futuristic, premium community frontend built to scale into a product-grade platform for chapters, events, projects, and partner programs."
        actions={[
          { label: "Join Community", href: "/forms" },
          { label: "Explore Events", href: "/events", variant: "ghost" },
          { label: "Explore Projects", href: "/open-source", variant: "ghost" },
        ]}
      />

      <SectionWrapper eyebrow="Community Stats" title="Proof of momentum" description="Designed to read like a real startup dashboard, not a generic non-profit landing page.">
        <StatsComponent stats={stats} />
      </SectionWrapper>

      <SectionWrapper eyebrow="What We Do" title="A community system with product thinking" description="Every program is structured to feel premium, navigable, and easy to expand later with Supabase data.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {whatWeDo.map((item) => (
            <FeatureCard key={item.title} eyebrow={item.eyebrow} title={item.title} description={item.description} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Featured Events" title="Built for high-trust live experiences" action={{ label: "See all events", href: "/events", variant: "ghost" }}>
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Featured Projects" title="Open-source output with premium presentation" action={{ label: "Browse projects", href: "/open-source", variant: "ghost" }}>
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Community Announcements"
        title="What&apos;s happening"
        description="Latest updates from the Heapify team, open to everyone."
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

      <SectionWrapper eyebrow="Community Journey" title="The path from discovery to leadership" description="A simple operating model that can later drive personalization, tracking, and role-based journeys.">
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

      <SectionWrapper eyebrow="Partners" title="Built to fit serious ecosystems" description="A row of anchor partners and tooling brands that reinforces the funded-startup feel.">
        <div className="flex flex-wrap gap-3">
          {partners.map((partner) => (
            <span key={partner} className="rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {partner}
            </span>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Testimonials" title="Designed to build trust at first glance" description="Placeholder voices that can later be replaced by authenticated community feedback.">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
              <p className="text-sm leading-7 text-muted-foreground">“{testimonial.quote}”</p>
              <div className="mt-6">
                <div className="font-display text-lg font-semibold">{testimonial.name}</div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary/80">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Ready to turn community energy into a product-grade platform?"
        description="This foundation is intentionally data-shaped, motion-rich, and componentized so Supabase can be wired in later without redesigning the interface."
        actions={[
          { label: "Join the community", href: "/forms" },
          { label: "View the roadmap", href: "/about", variant: "ghost" },
        ]}
      />
    </>
  );
}
