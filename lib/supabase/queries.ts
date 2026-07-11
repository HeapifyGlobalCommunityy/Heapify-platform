// lib/supabase/queries.ts
// Centralised read-only query helpers — all server-side, anon key only.
// Each function returns { data, error } so callers can always handle
// the error branch explicitly — no silent failures.

import { createClient } from "@/lib/supabase/server";

// ─── Announcements ────────────────────────────────────────────────────────
// Reads only audience='all' rows.
// DB NOTE: challenges/announcements currently have no RLS. The WHERE clause
// filters correctly in SQL, but until RLS Change 2 is approved, a direct
// API call (bypassing this helper) can still read core_team rows.
// This is a read-only helper — no write risk here.
export async function getPublicAnnouncements(limit = 6) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .eq("audience", "all")
    .order("created_at", { ascending: false })
    .limit(limit);
}

// ─── Challenges ───────────────────────────────────────────────────────────
// DB NOTE: challenges has no RLS. Public reads work as-is.
export async function getActiveChallenges() {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("challenges")
    .select(
      `id, title, description, status, start_at, end_at,
       winner:profiles!challenges_winner_id_fkey(id, username, full_name, avatar_url)`
    )
    .eq("status", "active")
    .order("end_at", { ascending: true });
}

export async function getPastChallenges(limit = 10) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("challenges")
    .select(
      `id, title, description, status, start_at, end_at,
       winner:profiles!challenges_winner_id_fkey(id, username, full_name, avatar_url)`
    )
    .eq("status", "past")
    .order("end_at", { ascending: false })
    .limit(limit);
}

// ─── User's own challenge submissions ────────────────────────────────────
export async function getMyChallengeSubmissions(userId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("challenge_submissions")
    .select(
      `id, submission_url, submitted_at,
       challenge:challenges(id, title, status, end_at)`
    )
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });
}

export async function getChallengeSubmissionsForChallenge(
  challengeId: string,
  userId: string
) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("challenge_submissions")
    .select("id, submission_url, submitted_at")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });
}

// ─── Profile ─────────────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("profiles")
    .select(
      `id, username, full_name, avatar_url, bio, role, contribution_score,
       github_url, linkedin_url, twitter_url, website_url, created_at,
       chapter:chapters(id, name, city, country)`
    )
    .eq("id", userId)
    .single();
}

export async function getProfileBadges(userId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("user_badges")
    .select("awarded_at, badge:badges(id, name, icon_url, description)")
    .eq("user_id", userId);
}

// ─── Event History (paginated) ─────────────────────────────────────────
export const EVENT_HISTORY_PAGE_SIZE = 10;

export async function getEventHistory(userId: string, page = 0) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  const from = page * EVENT_HISTORY_PAGE_SIZE;
  const to = from + EVENT_HISTORY_PAGE_SIZE - 1;

  return supabase
    .from("event_registrations")
    .select(
      `id, status, registered_at,
       event:events(id, slug, title, category, start_at, status)`
    )
    .eq("user_id", userId)
    .order("registered_at", { ascending: false })
    .range(from, to);
}
