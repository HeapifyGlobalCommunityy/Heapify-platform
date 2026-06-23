import { teamSections } from "@/lib/site-content";
import { SectionWrapper, TeamCard } from "@/components/site/ui";

export default function TeamPage() {
  return (
    <>
      <SectionWrapper
        title="The People Behind the Platform"
        description="A globally distributed team of builders, community architects, and open-source operators."
        className="pt-40"
      >
        <div className="mt-16 space-y-24">
          {teamSections.map((section) => (
            <div key={section.title} className="scroll-mt-32" id={section.title.toLowerCase().replace(" ", "-")}>
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <h2 className="font-display text-2xl font-semibold tracking-tight">{section.title}</h2>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04] text-xs font-medium text-muted-foreground">
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
    </>
  );
}
