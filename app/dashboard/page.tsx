import { BentoCard, BentoGrid, CTAComponent, SectionWrapper } from "@/components/site/ui";

const metrics = [
  { label: "Contribution Score", value: "92/100", detail: "Top 5% this month" },
  { label: "Events Attended", value: "18", detail: "Across 4 chapters" },
  { label: "Projects Shipped", value: "7", detail: "2 featured on homepage" },
  { label: "Certificates", value: "4", detail: "Blockchain & AI Tracks" },
];

export default function DashboardPage() {
  return (
    <>
      <SectionWrapper eyebrow="Dashboard" title="Personal Workspace" description="The dashboard is intentionally visual and modular so member data can be connected later." className="pt-36">
        <BentoGrid className="md:grid-cols-2 xl:grid-cols-4 mt-8">
          {metrics.map((metric, index) => (
            <BentoCard
              key={metric.label}
              index={index}
              eyebrow={metric.label}
            >
              <div className="font-display text-4xl font-semibold tracking-tight">{metric.value}</div>
              <p className="mt-2 text-sm text-primary/80">{metric.detail}</p>
            </BentoCard>
          ))}
        </BentoGrid>
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
