import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const leaders = [
  { rank: "01", name: "Aanya Rao", metric: "12.8k pts", role: "Founder" },
  { rank: "02", name: "Mika Chen", metric: "11.1k pts", role: "Co-Founder" },
  { rank: "03", name: "Jordan Vega", metric: "9.4k pts", role: "Community Lead" },
  { rank: "04", name: "Riya Nair", metric: "8.2k pts", role: "Mentor" },
];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Leaderboard" title="Contribution rankings with a premium data feel" description="A future-ready leaderboard that can later reflect real community metrics and scores." className="pt-36">
        <div className="space-y-4">
          {leaders.map((leader) => (
            <div key={leader.rank} className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm text-primary/80">{leader.rank}</div>
                <div>
                  <div className="font-display text-lg font-semibold">{leader.name}</div>
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{leader.role}</div>
                </div>
              </div>
              <div className="font-display text-xl font-semibold">{leader.metric}</div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Real metrics can replace this mock ranking later without changing the layout."
        description="The current structure already feels like a product leaderboard rather than a simple list."
        actions={[
          { label: "Open dashboard", href: "/dashboard" },
          { label: "Join community", href: "/forms/join", variant: "ghost" },
        ]}
      />
    </>
  );
}
