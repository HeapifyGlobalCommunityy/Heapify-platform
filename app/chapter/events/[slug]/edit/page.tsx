import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SectionWrapper } from "@/components/site/ui";
import { EditEventForm } from "@/components/chapter/edit-event-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { slug } = await params;
  
  const supabase = await createClient();
  
  if (!supabase) {
    redirect("/");
  }

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch target event by slug
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, description, banner_url, start_at, end_at, is_virtual, meeting_url, location, capacity, slug, chapter_id")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError || !event) {
    redirect("/chapter");
  }

  // 3. Verify chapter ownership (chapter pointed to by event.chapter_id has lead_id = auth.uid())
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, lead_id")
    .eq("id", event.chapter_id)
    .maybeSingle();

  if (chapterError || !chapter || chapter.lead_id !== user.id) {
    redirect("/chapter");
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper 
        eyebrow="Lead Portal" 
        title="Edit Event" 
        description={`Update details for ${event.title}`}
        className="pt-36 pb-12"
      >
        <div className="max-w-2xl mx-auto">
          <EditEventForm event={event} />
        </div>
      </SectionWrapper>
    </div>
  );
}
