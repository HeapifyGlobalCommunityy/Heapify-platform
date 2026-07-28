// lib/actions/profile.ts
// Server actions for the profile page.
// loadMoreEventHistory: derives user_id from session, never from client.

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EVENT_HISTORY_PAGE_SIZE } from "@/lib/supabase/queries";
import type { EventHistoryRow } from "@/components/profile/EventHistoryClient";

// ─── Update profile ───────────────────────────────────────────────────────
// Uses the anon key — the schema already has:
//   CREATE POLICY "users update own profile" ON profiles
//     FOR UPDATE USING (auth.uid() = id);
// No admin key needed. user_id always derived from session.

export interface ProfileUpdateData {
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
}

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfile(
  data: ProfileUpdateData
): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Supabase not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  // Validate username
  const username = data.username.trim();
  if (!username || username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return { success: false, error: "Username may only contain letters, numbers, _ . and -" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: data.full_name.trim() || null,
      avatar_url: data.avatar_url.trim() || null,
      bio: data.bio.trim() || null,
      github_url: data.github_url.trim() || null,
      linkedin_url: data.linkedin_url.trim() || null,
      twitter_url: data.twitter_url.trim() || null,
      website_url: data.website_url.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id); // RLS also enforces this — double protection

  if (updateError) {
    if (updateError.code === "23505") {
      return { success: false, error: "That username is already taken." };
    }
    console.error("[updateProfile] error:", updateError.message);
    return { success: false, error: "Failed to save changes. Please try again." };
  }

  // Revalidate the profile page so the next visit sees fresh data
  revalidatePath("/profile");
  return { success: true };
}


export async function loadMoreEventHistory(
  userId: string,
  page: number
): Promise<{ rows: EventHistoryRow[]; hasMore: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { rows: [], hasMore: false };

  // Verify the caller is actually this user — don't trust the client-supplied userId
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    return { rows: [], hasMore: false };
  }

  const from = page * EVENT_HISTORY_PAGE_SIZE;
  const to = from + EVENT_HISTORY_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      `id, status, registered_at,
       event:events(id, slug, title, category, start_at, end_at, status)`
    )
    .eq("user_id", user.id) // always the verified session user
    .order("registered_at", { ascending: false })
    .range(from, to);

  if (error || !data) return { rows: [], hasMore: false };

  return {
    rows: data as unknown as EventHistoryRow[],
    hasMore: data.length === EVENT_HISTORY_PAGE_SIZE,
  };
}
