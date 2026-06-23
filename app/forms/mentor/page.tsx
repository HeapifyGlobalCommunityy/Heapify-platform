import { CTAComponent, FormCard, SectionWrapper } from "@/components/site/ui";

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Mentor Form" title="A mentor application with a premium wrapper" description="This page keeps the conversion path simple while matching the rest of the platform visually." className="pt-36">
        <div className="grid gap-5 lg:grid-cols-2">
          <FormCard title="Mentor Application" description="Help contributors with technical depth, career guidance, and consistent feedback." />
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">What we value</div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Clear communication</li>
              <li>Reliable follow-up</li>
              <li>Builder-first support</li>
              <li>Community empathy</li>
            </ul>
          </div>
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Mentors are a core part of the growth system."
        description="This page can later connect to a proper submission form without redesigning the user experience."
        actions={[
          { label: "Apply as speaker", href: "/forms/speaker" },
          { label: "Contact team", href: "/forms/contact", variant: "ghost" },
        ]}
      />
    </>
  );
}
