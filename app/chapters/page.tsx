import { getChapters } from "@/lib/supabase/queries";
import { BentoCard, BentoGrid, CTAComponent, SectionWrapper } from "@/components/site/ui";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";

const staticChapters = [
  { name: "Bengaluru", type: "College", members: "124 members", desc: "Focusing on AI, Web3 infra, and developer tooling." },
  { name: "Nairobi", type: "City", members: "88 members", desc: "Building open-source solutions for local businesses." },
  { name: "São Paulo", type: "Regional", members: "102 members", desc: "Hosting monthly hackathons and design sprints." },
  { name: "London", type: "Regional", members: "76 members", desc: "Senior developer meetups and architectural discussions." },
  { name: "San Francisco", type: "City", members: "210 members", desc: "AI, agents, and frontier tech study groups." },
  { name: "Berlin", type: "Regional", members: "94 members", desc: "Open-source contribution rings and privacy tech." },
];

function formatChapterType(type: string): string {
  const map: Record<string, string> = {
    city: "City Chapter",
    college: "College Chapter",
    regional: "Regional Chapter",
  };
  return map[type] ?? type;
}

export default async function ChaptersPage() {
  const { data: dbChapters } = await getChapters();

  let chaptersList = staticChapters;

  if (dbChapters && dbChapters.length > 0) {
    chaptersList = dbChapters.map((c) => ({
      name: c.name,
      type: formatChapterType(c.type),
      members: `${c.member_count ?? 0} members`,
      desc: c.description || (c.city ? `Based in ${c.city}, ${c.country || ""}` : "Community chapter"),
    }));
  }

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Background dolphin watermarks */}
      <ParallaxDolphinWatermark
        className="absolute -right-8 sm:right-6 top-32 w-36 h-36 sm:w-48 sm:h-48 opacity-[0.08] mix-blend-multiply"
        speed={30}
        direction="down"
        initialRotate={18}
        flip={true}
      />
      <ParallaxDolphinWatermark
        className="absolute -left-10 sm:left-6 top-[55%] w-40 h-40 sm:w-52 sm:h-52 opacity-[0.07] mix-blend-multiply"
        speed={40}
        direction="up"
        initialRotate={-16}
      />

      <SectionWrapper
        eyebrow="Chapters"
        title="Global Network Nodes"
        description="A distributed network of city, campus, and regional developer chapters."
        className="pt-28 sm:pt-36"
      >
        <BentoGrid className="md:grid-cols-2 xl:grid-cols-3 mt-8">
          {chaptersList.map((chapter, index) => (
            <BentoCard
              key={chapter.name}
              index={index}
              eyebrow={chapter.type}
              title={chapter.name}
              description={chapter.desc}
            >
              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="text-xs font-medium text-muted-foreground">{chapter.members}</span>
                <span className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  View Chapter &rarr;
                </span>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </SectionWrapper>

      <CTAComponent
        title="Want to lead a chapter in your city or university?"
        description="We empower passionate community organizers with resources, event playbooks, and global support."
        actions={[
          { label: "Apply as chapter lead", href: "/forms/chapter_lead" },
          { label: "See team", href: "/team", variant: "ghost" },
        ]}
      />
    </div>
  );
}

