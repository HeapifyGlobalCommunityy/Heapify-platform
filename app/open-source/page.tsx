import { openSourceHighlights, featuredProjects } from "@/lib/site-content";
import { CTAComponent, ProjectCard, SectionWrapper } from "@/components/site/ui";

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Open Source" title="A curated contribution surface" description="High-signal projects, strong presentation, and later room for issue tracking or repo integration." className="pt-36">
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper eyebrow="Why it works" title="Built to help new contributors move fast">
        <div className="grid gap-4 md:grid-cols-3">
          {openSourceHighlights.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Later, this section can connect directly to repositories and issue metadata."
        description="For now, it reads as a premium open-source hub with enough structure to support future contribution systems."
        actions={[
          { label: "Browse events", href: "/events" },
          { label: "Join community", href: "/forms/join", variant: "ghost" },
        ]}
      />
    </>
  );
}
