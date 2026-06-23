import { eventCatalog, eventCategories } from "@/lib/site-content";
import { EventsExplorer, SectionWrapper } from "@/components/site/ui";

export default function EventsPage() {
  return (
    <>
      <SectionWrapper
        title="Events & Experiences"
        description="Join sessions, workshops, and flagship community events happening globally."
        className="pt-40 pb-12"
      >
        <div className="mt-8">
          <EventsExplorer events={eventCatalog} categories={eventCategories} />
        </div>
      </SectionWrapper>
    </>
  );
}
