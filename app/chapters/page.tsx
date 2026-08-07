import { BentoCard, BentoGrid, CTAComponent, SectionWrapper } from "@/components/site/ui";

const chapters = [
  { name: "Bengaluru", type: "University", members: "124 members", desc: "Focusing on Web3 infra and developer tooling." },
  { name: "Nairobi", type: "City", members: "88 members", desc: "Building open-source solutions for local businesses." },
  { name: "São Paulo", type: "Regional", members: "102 members", desc: "Hosting monthly hackathons and design sprints." },
  { name: "London", type: "Professional", members: "76 members", desc: "Senior developer meetups and architectural discussions." },
  { name: "San Francisco", type: "City", members: "210 members", desc: "AI, agents, and frontier tech study groups." },
  { name: "Berlin", type: "Regional", members: "94 members", desc: "Open-source contribution rings and privacy tech." },
];

export default function ChaptersPage() {
  return (
    <>
      <SectionWrapper eyebrow="Chapters" title="Global Network Nodes" description="A premium chapter surface for global, city, and campus-led communities." className="pt-36">
        <BentoGrid className="md:grid-cols-2 xl:grid-cols-3 mt-8">
          {chapters.map((chapter, index) => (
            <BentoCard
              key={chapter.name}
              index={index}
              eyebrow={chapter.type}
              title={chapter.name}
              description={chapter.desc}
            >
              <div className="mt-4 flex items-center justify-between border-t border-glass-border pt-4">
                <span className="text-xs font-medium text-muted-foreground">{chapter.members}</span>
                <span className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">View Chapter &rarr;</span>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </SectionWrapper>

      <CTAComponent
        title="Chapter data can later be hydrated from Supabase without a visual redesign."
        description="The page is intentionally structured like a real network directory, not a placeholder list."
        actions={[
          { label: "Apply as chapter lead", href: "/forms/chapter_lead" },
          { label: "See team", href: "/team", variant: "ghost" },
        ]}
      />
    </>
  );
}
