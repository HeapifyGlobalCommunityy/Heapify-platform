import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { CreateEventForm } from "@/components/chapter/create-event-form";
import { requireRole } from "@/lib/auth/authorization";
import { getChaptersList } from "@/lib/actions/events";

export default async function AdminNewEventPage() {
  await requireRole(["core_team", "super_admin"]);
  const chapters = await getChaptersList();

  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper
        eyebrow="Admin / Events"
        title="Create New Event"
        description="Publish a community event, workshop, or hackathon. Global events are community-wide unless scoped to a chapter."
        className="pt-36 pb-20"
      >
        <Link
          href="/admin/events"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <div className="max-w-2xl">
          <CreateEventForm mode="admin" chapters={chapters} />
        </div>
      </SectionWrapper>
    </div>
  );
}
