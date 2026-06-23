import { BentoCard, BentoGrid, CTAComponent, SectionWrapper, StatusBadge } from "@/components/site/ui";

const challenges = [
  { title: "Build for Good", status: "Active", prize: "Community spotlight", desc: "Build open-source tools for local non-profits." },
  { title: "Design Sprint", status: "Upcoming", prize: "Mentor review", desc: "Redesign a popular Web3 protocol interface." },
  { title: "Open Source Relay", status: "Past", prize: "Contributor grant", desc: "Fix as many issues as possible in 48 hours." },
  { title: "AI Hackathon", status: "Past", prize: "$500 Grant", desc: "Integrate LLMs into everyday productivity apps." },
];

export default function ChallengesPage() {
  return (
    <>
      <SectionWrapper eyebrow="Challenges" title="Competition Space" description="A future-ready challenge space for submissions, winners, and visibility." className="pt-36">
        <BentoGrid className="md:grid-cols-2 mt-8">
          {challenges.map((challenge, index) => (
            <BentoCard
              key={challenge.title}
              index={index}
              title={challenge.title}
              description={challenge.desc}
            >
              <div className="flex items-center justify-between mt-4 border-t border-glass-border pt-5">
                <StatusBadge status={challenge.status} />
                <span className="text-sm font-medium text-foreground">{challenge.prize}</span>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
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
