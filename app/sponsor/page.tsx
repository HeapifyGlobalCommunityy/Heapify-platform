import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const tiers = [
  { title: "Launch", detail: "For single events and one-off activations." },
  { title: "Growth", detail: "For ongoing visibility, workshops, and content." },
  { title: "Scale", detail: "For deep partnerships, chapters, and platform support." },
];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Sponsors" title="Partnership pages should feel enterprise-grade" description="A premium sponsor surface with enough visual confidence to support future media kits and lead capture." className="pt-36">
        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="font-display text-2xl font-semibold">{tier.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{tier.detail}</p>
            </div>
          ))}
        </div>
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
