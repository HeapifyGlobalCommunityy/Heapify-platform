import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SectionWrapper } from "@/components/site/ui";
import { CreateEventForm } from "@/components/chapter/create-event-form";

export default async function NewEventPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    redirect("/");
  }

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch user profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // 3. Fetch chapter led by this user (if any)
  const { data: chapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("lead_id", user.id)
    .maybeSingle();

  const isAuthorized =
    (profile && ["admin", "community_admin", "chapter_lead"].includes(profile.role)) ||
    !!chapter;

  if (!isAuthorized) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper 
        eyebrow="Admin & Lead Portal" 
        title="Create New Event" 
        description="Schedule a new community event, workshop, or hackathon directly into the database."
        className="pt-36 pb-12"
      >
        <div className="max-w-2xl mx-auto">
          <CreateEventForm />
        </div>
      </SectionWrapper>
    </div>
  );
}
