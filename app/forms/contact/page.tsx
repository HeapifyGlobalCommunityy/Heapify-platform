import { CTAComponent, SectionWrapper } from "@/components/site/ui";

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Contact" title="A polished contact entry point" description="A clean placeholder for later support, partnership, or general inquiry flows." className="pt-36">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <p className="text-sm leading-8 text-muted-foreground">
            This route is intentionally restrained so it can later become a Supabase-backed contact flow, support inbox, or partnership request form.
          </p>
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Need a structured way to reach the team?"
        description="The current layout is ready for a future form component or external routing flow."
        actions={[
          { label: "Open sponsor page", href: "/sponsor" },
          { label: "Open join form", href: "/forms/join", variant: "ghost" },
        ]}
      />
    </>
  );
}
