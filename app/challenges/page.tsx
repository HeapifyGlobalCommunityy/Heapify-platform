import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const challenges = [
  { title: "Build for Good", status: "Active", prize: "Community spotlight" },
  { title: "Open Source Relay", status: "Past", prize: "Contributor grant" },
  { title: "Design Sprint", status: "Upcoming", prize: "Mentor review" },
];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Challenges" title="Competition with a premium community feel" description="A future-ready challenge space for submissions, winners, and visibility." className="pt-36">
        <div className="grid gap-5 md:grid-cols-3">
          {challenges.map((challenge) => (
            <div key={challenge.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">{challenge.status}</div>
              <h3 className="mt-3 font-display text-xl font-semibold">{challenge.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{challenge.prize}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Challenge infrastructure can later connect to submissions and scoring."
        description="The current surface already conveys momentum and credibility." 
        actions={[
          { label: "Join community", href: "/forms/join" },
          { label: "Open open-source hub", href: "/open-source", variant: "ghost" },
        ]}
      />
    </>
  );
}
