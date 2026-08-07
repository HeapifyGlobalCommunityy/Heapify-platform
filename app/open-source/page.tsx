import { openSourceHighlights, featuredProjects } from "@/lib/site-content";
import { BentoCard, BentoGrid, CTAComponent, ProjectCard, SectionWrapper } from "@/components/site/ui";

export default function OpenSourcePage() {
  return (
    <>
      <SectionWrapper eyebrow="Open Source" title="Contribution Surface" description="High-signal projects, strong presentation, and later room for issue tracking or repo integration." className="pt-36 pb-12">
        <div className="grid gap-5 lg:grid-cols-3 mt-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Why it works" title="Built to help new contributors move fast">
        <BentoGrid className="md:grid-cols-3 mt-8">
          {openSourceHighlights.map((item, index) => (
            <BentoCard
              key={item.title}
              index={index}
              title={item.title}
              description={item.description}
            />
          ))}
        </BentoGrid>
      </SectionWrapper>

      <CTAComponent
        title="Later, this section can connect directly to repositories and issue metadata."
        description="For now, it reads as a premium open-source hub with enough structure to support future contribution systems."
        actions={[
          { label: "Browse events", href: "/events" },
          { label: "Join community", href: "/forms", variant: "ghost" },
        ]}
      />
    </>
  );
}
