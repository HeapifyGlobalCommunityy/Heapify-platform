import { BentoCard, BentoGrid, CTAComponent, SectionWrapper } from "@/components/site/ui";

const tiers = [
  { title: "Launch", detail: "For single events and one-off activations.", features: ["1x Event Booth", "Social Shoutout", "Logo on Site"] },
  { title: "Growth", detail: "For ongoing visibility, workshops, and content.", features: ["Monthly Workshops", "Dedicated Newsletter", "Recruitment Access"] },
  { title: "Scale", detail: "For deep partnerships, chapters, and platform support.", features: ["Global Chapter Access", "Custom Hackathons", "Advisory Board Seat"] },
];

export default function SponsorPage() {
  return (
    <>
      <SectionWrapper eyebrow="Sponsors" title="Enterprise Partnerships" description="A premium sponsor surface with enough visual confidence to support future media kits and lead capture." className="pt-36">
        <BentoGrid className="md:grid-cols-3 mt-8">
          {tiers.map((tier, index) => {
            const isScale = tier.title === "Scale";
            return (
              <BentoCard
                key={tier.title}
                index={index}
                className={isScale ? "border-primary/40 bg-[linear-gradient(180deg,rgba(255,122,0,0.08),rgba(255,122,0,0.02))]" : ""}
              >
                <h3 className="font-display text-3xl font-semibold">{tier.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground min-h-[60px]">{tier.detail}</p>
                <div className="mt-6 space-y-3 border-t border-glass-border pt-6">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-glass-border bg-glass-bg px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors">
                    Inquire
                  </span>
                </div>
              </BentoCard>
            );
          })}
        </BentoGrid>
      </SectionWrapper>

      <CTAComponent
        title="This page is ready for a sponsor deck, metrics, and inquiry flow later."
        description="The placeholder layout already feels closer to a funded startup than a community brochure."
        actions={[
          { label: "Open contact form", href: "/forms/contact" },
          { label: "See events", href: "/events", variant: "ghost" },
        ]}
      />
    </>
  );
}
