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

  // 2. Fetch chapter led by this user
  const { data: chapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("lead_id", user.id)
    .maybeSingle();

  if (!chapter) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper 
        eyebrow="Lead Portal" 
        title="Create New Event" 
        description="Schedule a new community event or hackathon for your chapter."
        className="pt-36 pb-12"
      >
        <div className="max-w-2xl mx-auto">
          <CreateEventForm />
        </div>
      </SectionWrapper>
    </div>
  );
}
