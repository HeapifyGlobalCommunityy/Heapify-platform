import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const controls = ["Events", "Projects", "Sponsors", "Applications", "Chapters", "Content"];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Admin" title="A command center-style admin shell" description="Role-based management is represented as a premium control dashboard placeholder." className="pt-36">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {controls.map((control) => (
            <div key={control} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">Manage</div>
              <h3 className="mt-3 font-display text-xl font-semibold">{control}</h3>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Later, this route can accept auth, permissions, and live data.
"
        description="For now, it remains a visual placeholder that matches the product-grade system around it."
        actions={[
          { label: "Open dashboard", href: "/dashboard" },
          { label: "View team", href: "/team", variant: "ghost" },
        ]}
      />
    </>
  );
}
