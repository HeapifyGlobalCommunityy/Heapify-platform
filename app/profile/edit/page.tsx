// app/profile/edit/page.tsx
// Server component rendering the profile edit page.
//
// 1. Force dynamic rendering:
//    export const dynamic = "force-dynamic"
//    Guarantees we never serve another user's profile configuration.
//
// 2. Server-side auth boundary:
//    Checks user session and redirects to login if unauthenticated.
//
// 3. Fetches user profile from database.

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { SectionWrapper } from "@/components/site/ui";
import EditProfileForm from "@/components/profile/EditProfileForm";

export default async function EditProfilePage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <SectionWrapper eyebrow="Profile" title="Not Configured" className="pt-36">
        <p className="text-sm text-muted-foreground">
          Supabase is not configured properly in this environment.
        </p>
      </SectionWrapper>
    );
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login?next=/profile/edit");
  }

  const { data: profile, error: profileError } = await getProfile(user.id);

  if (profileError || !profile) {
    return (
      <SectionWrapper eyebrow="Profile" title="Profile not found" className="pt-36">
        <p className="text-sm text-muted-foreground">
          {profileError?.message ?? "Make sure your user profile exists before editing."}
        </p>
      </SectionWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-36 pb-20">
      <div className="px-4">
        <EditProfileForm initialProfile={profile} />
      </div>
    </div>
  );
}
