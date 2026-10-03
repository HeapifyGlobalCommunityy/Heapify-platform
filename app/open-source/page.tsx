import { openSourceHighlights, featuredProjects } from "@/lib/site-content";
import { BentoCard, BentoGrid, CTAComponent, ProjectCard, SectionWrapper } from "@/components/site/ui";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";

export default function OpenSourcePage() {
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

      <SectionWrapper eyebrow="Open Source" title="Contribution Surface" description="High-signal projects, strong presentation, and later room for issue tracking or repo integration." className="pt-28 sm:pt-36 pb-12">
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
    </div>
  );
}
