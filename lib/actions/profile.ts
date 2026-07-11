// lib/actions/profile.ts
// Server actions for the profile page.
// loadMoreEventHistory: derives user_id from session, never from client.

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { EVENT_HISTORY_PAGE_SIZE } from "@/lib/supabase/queries";
import type { EventHistoryRow } from "@/components/profile/EventHistoryClient";

// ─── Create profile ─────────────────────────────────────────────────────────
// Uses the admin (service-role) client because the schema has no INSERT RLS
// policy on profiles yet. The user_id is always derived from the session —
// never from the client — so we enforce the same constraint as RLS would.
//
// DB NOTE for team: once this is approved and deployed —
//   CREATE POLICY "users insert own profile" ON profiles
//     FOR INSERT WITH CHECK (auth.uid() = id);
// — switch this back to the anon key and remove the admin client usage.

export type CreateProfileResult =
  | { success: true }
  | { success: false; error: string };

export async function createProfile(
  username: string,
  fullName: string
): Promise<CreateProfileResult> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Supabase not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const trimmedUsername = username.trim().toLowerCase().replace(/\s+/g, "_");
  if (!trimmedUsername || trimmedUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!/^[a-z0-9_.-]+$/.test(trimmedUsername)) {
    return { success: false, error: "Username may only contain letters, numbers, _ . and -" };
  }

  const admin = createAdminClient();
  if (!admin) return { success: false, error: "Profile creation unavailable — service key not configured." };

  const { error: insertError } = await admin.from("profiles").insert({
    id: user.id,          // always from session — never from client
    username: trimmedUsername,
    full_name: fullName.trim() || (user.user_metadata?.full_name ?? null),
    avatar_url: user.user_metadata?.avatar_url ?? null,
    role: "member",
    contribution_score: 0,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      // Unique violation — could be duplicate id (already has profile) or duplicate username
      if (insertError.message.includes("username")) {
        return { success: false, error: "That username is already taken. Please choose another." };
      }
      return { success: false, error: "A profile already exists for your account." };
    }
    console.error("[createProfile] insert error:", insertError.message);
    return { success: false, error: "Failed to create profile. Please try again." };
  }

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
       event:events(id, slug, title, category, start_at, status)`
    )
    .eq("user_id", user.id) // always the verified session user
    .order("registered_at", { ascending: false })
    .range(from, to);

  if (error || !data) return { rows: [], hasMore: false };

  return {
    rows: data as EventHistoryRow[],
    hasMore: data.length === EVENT_HISTORY_PAGE_SIZE,
  };
}
