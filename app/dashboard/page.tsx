import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const metrics = [
  { label: "Contribution Score", value: "92/100" },
  { label: "Events Attended", value: "18" },
  { label: "Projects Shipped", value: "7" },
  { label: "Certificates", value: "4" },
];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Dashboard" title="A polished personal workspace" description="The dashboard is intentionally visual and modular so member data can be connected later." className="pt-36">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">{metric.label}</div>
              <div className="mt-4 font-display text-3xl font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Member dashboards can later be personalized without reworking this shell."
        description="The structure already supports progress, certificates, and achievement cards in a product-like layout."
        actions={[
          { label: "Open leaderboard", href: "/leaderboard" },
          { label: "View events", href: "/events", variant: "ghost" },
        ]}
      />
    </>
  );
}
