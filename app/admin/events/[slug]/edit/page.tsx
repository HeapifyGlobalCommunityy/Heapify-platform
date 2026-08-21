import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { EditEventForm } from "@/components/chapter/edit-event-form";
import { requireRole } from "@/lib/auth/authorization";
import { getAdminEventDetail, getChaptersList } from "@/lib/actions/events";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminEditEventPage({ params }: PageProps) {
  const { slug } = await params;

  await requireRole(["core_team", "super_admin"]);

  const event = await getAdminEventDetail(slug);
  if (!event) {
    redirect("/admin/events");
  }

  const chapters = await getChaptersList();

  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper
        eyebrow="Admin / Events"
        title="Edit Event"
        description={`Update details for ${event.title}. Admins can edit any event regardless of chapter ownership.`}
        className="pt-36 pb-20"
      >
        <Link
          href={`/admin/events/${event.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event
        </Link>

        <div className="max-w-2xl">
          <EditEventForm event={event} mode="admin" chapters={chapters} />
        </div>
      </SectionWrapper>
    </div>
  );
}
