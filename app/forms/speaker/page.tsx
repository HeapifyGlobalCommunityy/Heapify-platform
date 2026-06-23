import { CTAComponent, FormCard, SectionWrapper } from "@/components/site/ui";

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Speaker Form" title="A speaker application with event-grade presentation" description="Positioned like a premium event intake flow while remaining a static placeholder." className="pt-36">
        <div className="grid gap-5 lg:grid-cols-2">
          <FormCard title="Speaker Application" description="Apply to run talks, panels, workshops, or firesides for the community." />
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">Expected inputs</div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Talk title</li>
              <li>Session outline</li>
              <li>Preferred format</li>
              <li>Speaker bio</li>
            </ul>
          </div>
        </div>
      </SectionWrapper>

      <CTAComponent
        title="This form can later feed a review queue or speaker CRM."
        description="The frontend already matches the platform’s overall visual language and motion tone."
        actions={[
          { label: "Open events", href: "/events" },
          { label: "Open contact", href: "/forms/contact", variant: "ghost" },
        ]}
      />
    </>
  );
}
