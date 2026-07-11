// lib/actions/events.ts
// Server action for event registration.
//
// Tables affected: event_registrations (INSERT only)
// RLS status: ✅ RLS is enabled on event_registrations with:
//   - "users insert own registrations" FOR INSERT WITH CHECK (auth.uid() = user_id)
// This server action is correct both now and after RLS is active — user_id
// always comes from the server session, never from the client.
//
// Dependencies:
// 1. The event must exist in the Supabase `events` table by slug.
//    Currently events come from mock data in site-content.ts. If the event
//    slug isn't seeded in Supabase, this will return a clear error.
// 2. The user must have a `profiles` row (FK constraint). If they haven't
//    set up their profile yet, this will fail with a FK violation — handled.
//
// Constraint: unique(event_id, user_id) — one registration per user per event.
// Handled gracefully with a user-friendly error.

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface TeamMember {
  name: string;
  email: string;
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  answers?: Record<string, string>;
}

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerForEvent(
  eventSlug: string,
  payload: RegistrationPayload
): Promise<RegisterResult> {
  // 1. Server-side auth check — never trust the client
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Service unavailable. Please try again later." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/login?next=/events/${eventSlug}?register=true`);
  }

  // 2. Look up the event's UUID by slug
  //    Events currently come from mock data — if not seeded in Supabase,
  //    this returns null and we surface a clear message.
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, capacity, status")
    .eq("slug", eventSlug)
    .maybeSingle();

  if (eventError) {
    console.error("[registerForEvent] event lookup error:", eventError.message);
    return { success: false, error: "Couldn't look up the event. Please try again." };
  }

  if (!event) {
    return {
      success: false,
      error: "This event isn't connected to the database yet. Registration will be available soon.",
    };
  }

  if (event.status === "cancelled" || event.status === "completed") {
    return { success: false, error: "Registration is closed for this event." };
  }

  // 3. Server-side validation
  if (!payload.fullName.trim()) return { success: false, error: "Full name is required." };
  if (!payload.email.trim()) return { success: false, error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // 4. Insert into event_registrations
  //    user_id = user.id (session-derived — never from client)
  const { error: insertError } = await supabase
    .from("event_registrations")
    .insert({
      event_id: event.id,
      user_id: user.id,           // session-derived — this is the security guarantee
      full_name: payload.fullName.trim(),
      email: payload.email.trim(),
      github_url: payload.githubUrl.trim() || null,
      linkedin_url: payload.linkedinUrl.trim() || null,
      team_name: payload.teamName?.trim() || null,
      team_members: payload.teamMembers ?? [],
      answers: payload.answers ?? {},
      status: "registered",
    });

  if (insertError) {
    // Unique constraint: user already registered for this event
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "You're already registered for this event.",
      };
    }
    // FK violation: user has no profiles row
    if (insertError.code === "23503" && insertError.message.includes("user_id")) {
      return {
        success: false,
        error: "Please complete your profile setup before registering for events.",
      };
    }
    console.error("[registerForEvent] insert error:", insertError.message);
    return { success: false, error: "Registration failed. Please try again." };
  }

  return { success: true };
}
