import { resourceGroups } from "@/lib/site-content";
import { ResourcesExplorer, SectionWrapper } from "@/components/site/ui";

export default function ResourcesPage() {
  return (
    <>
      <SectionWrapper
        title="Knowledge Base & Resources"
        description="A growing library of deep-dives, roadmaps, workshop recordings, and community notes."
        className="pt-40 pb-12"
      >
        <div className="mt-8">
          <ResourcesExplorer resources={resourceGroups} />
        </div>
      </SectionWrapper>
    </>
  );
}
