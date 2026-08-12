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

export async function getSiteStats() {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  try {
    return await supabase
      .from("site_stats")
      .select("key, label, value")
      .order("key", { ascending: true });
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
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
// DB NOTE: profiles ↔ chapters has TWO FK paths:
//   1. profiles.chapter_id → chapters.id  (profiles_chapter_fk)
//   2. chapters.lead_id    → profiles.id  (reverse)
// PostgREST requires an explicit hint when multiple paths exist.
// We use !profiles_chapter_fk to select the correct direction.
export async function getProfile(userId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  // maybeSingle() returns { data: null, error: null } when no row exists,
  // rather than an error — makes it easy to show a "set up profile" UI.
  return supabase
    .from("profiles")
    .select(
      `id, username, full_name, avatar_url, bio, role, contribution_score,
       github_url, linkedin_url, twitter_url, website_url, created_at,
       chapter:chapters!chapter_id(id, name, city, country),
       led_chapters:chapters!lead_id(id, name, city, country),
       team_members(title, display_name),
       won_challenges:challenges!winner_id(id, title, status, end_at),
       project_maintainers(project:projects(id, name, slug)),
       project_contributors(project:projects(id, name, slug)),
       leaderboard_entries(category, score, period)`
    )
    .eq("id", userId)
    .maybeSingle();
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
       event:events(id, slug, title, category, start_at, end_at, status)`
    )
    .eq("user_id", userId)
    .order("registered_at", { ascending: false })
    .range(from, to);
}

// ─── Events (paginated & single) ─────────────────────────────────────────
export async function getEvents(page = 0, limit = 20) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  const from = page * limit;
  const to = from + limit - 1;
  const now = new Date().toISOString();

  return supabase
    .from("events")
    .select(
      "id, slug, title, category, status, start_at, end_at, is_virtual, location, description, banner_url, capacity, is_hackathon"
    )
    .or(`end_at.gte.${now},end_at.is.null`)
    .order("start_at", { ascending: false })
    .range(from, to);
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };

  return supabase
    .from("events")
    .select(
      "id, slug, title, category, status, start_at, end_at, is_virtual, location, description, banner_url, capacity, is_hackathon, team_config, custom_questions, agenda, speakers, chapter_id, chapters(name)"
    )
    .eq("slug", slug)
    .maybeSingle();
}

