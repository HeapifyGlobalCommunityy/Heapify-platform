import { teamSections } from "@/lib/site-content";
import { SectionWrapper, TeamCard } from "@/components/site/ui";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";

export default function TeamPage() {
  return (
    <div className="relative overflow-hidden">
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
        title="The People Behind the Platform"
        description="A globally distributed team of builders, community architects, and open-source operators."
        className="pt-28 sm:pt-36 pb-20"
      >
        <div className="mt-16 space-y-24">
          {teamSections.map((section) => (
            <div key={section.title} className="scroll-mt-32" id={section.title.toLowerCase().replace(" ", "-")}>
              <div className="flex items-center gap-4 border-b border-border/80 pb-6">
                <h2 className="font-display text-2xl font-semibold tracking-tight">{section.title}</h2>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
                  {section.members.length}
                </div>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {section.members.map((member) => (
                  <TeamCard key={member.name} member={member} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
