// app/profile/page.tsx
//
// ┌─ CRITICAL RENDERING NOTES ───────────────────────────────────────────────
// │ 1. export const dynamic = "force-dynamic"
// │    This route MUST never be statically cached or served from a shared
// │    Next.js cache. Each request is one user's private data — a shared
// │    cached response would expose one user's profile to another.
// │
// │ 2. Server-side auth check only.
// │    We call supabase.auth.getUser() here, server-side, and redirect()
// │    before any data fetch if there is no session. No data is fetched,
// │    no JSX is rendered, no client-side bounce — the response never
// │    leaves the server if the user is unauthenticated.
// │
// │ 3. demo-profile is DEV-only.
// │    In production this page reads the real Supabase session exclusively.
// │    The demo-profile localStorage pattern (used in the navbar and old
// │    profile) is intentionally NOT used here. It lives only in the navbar
// │    and must never become the permanent path for real user data.
// └──────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic"; // ← prevents shared/static caching

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Github, Linkedin, Twitter, Globe, Trophy, Zap, CalendarDays,
  Award, Star, ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getProfile,
  getProfileBadges,
  getEventHistory,
  getMyChallengeSubmissions,
  EVENT_HISTORY_PAGE_SIZE,
} from "@/lib/supabase/queries";
import { SectionWrapper } from "@/components/site/ui";
import EventHistoryClient, { type EventHistoryRow } from "@/components/profile/EventHistoryClient";

// ─── Helpers ──────────────────────────────────────────────────────────────

function rolePillClass(role: string): string {
  const map: Record<string, string> = {
    super_admin: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    core_team: "border-primary/40 bg-primary/10 text-primary",
    chapter_admin: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    mentor: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    member: "border-zinc-700 bg-zinc-800/60 text-zinc-400",
  };
  return map[role] ?? map.member;
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="h-20 w-20 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
      <span className="font-display text-2xl font-semibold text-primary">{initials}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  // ── Step 1: Auth check — server-side, blocks everything if no session ──
  const supabase = await createClient();

  if (!supabase) {
    // Supabase not configured — show a clear dev-mode message
    return (
      <SectionWrapper eyebrow="Profile" title="Supabase not configured" className="pt-36">
        <p className="text-sm text-muted-foreground">
          Set <code className="text-primary">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
          <code className="text-primary">.env</code> to enable the profile page.
        </p>
      </SectionWrapper>
    );
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Hard server-side redirect — no data is fetched, no JSX rendered
    redirect("/login?next=/profile");
  }

  // ── Step 2: Fetch all profile data in parallel ─────────────────────────
  const [
    { data: profile, error: profileError },
    { data: badges, error: badgesError },
    { data: historyPage0, error: historyError },
    { data: mySubmissions, error: submissionsError },
  ] = await Promise.all([
    getProfile(user.id),
    getProfileBadges(user.id),
    getEventHistory(user.id, 0),
    getMyChallengeSubmissions(user.id),
  ]);

  // Profile is the critical fetch — surface a clear error if it fails
  if (profileError || !profile) {
    return (
      <SectionWrapper eyebrow="Profile" title="Couldn't load your profile" className="pt-36">
        <p className="text-sm text-muted-foreground">
          {profileError?.message ?? "Profile not found. Make sure your account is fully set up."}
        </p>
      </SectionWrapper>
    );
  }

  // Non-critical failures — log, don't crash
  if (badgesError) console.error("[profile] badges error:", badgesError.message);
  if (historyError) console.error("[profile] history error:", historyError.message);
  if (submissionsError) console.error("[profile] submissions error:", submissionsError.message);

  const chapter = profile.chapter as { name: string; city: string | null; country: string | null } | null;
  const typedBadges = (badges ?? []) as {
    awarded_at: string;
    badge: { id: string; name: string; icon_url: string | null; description: string | null } | null;
  }[];
  const typedHistory = (historyPage0 ?? []) as EventHistoryRow[];
  const hasMoreHistory = typedHistory.length === EVENT_HISTORY_PAGE_SIZE;

  const typedSubmissions = (mySubmissions ?? []) as {
    id: string;
    submission_url: string | null;
    submitted_at: string;
    challenge: { id: string; title: string; status: string; end_at: string | null } | null;
  }[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <SectionWrapper eyebrow="Profile" title="" className="pt-36 pb-0">
        <div className="mt-2 rounded-[2rem] border border-glass-border bg-glass-bg/80 p-8 shadow-[0_30px_100px_-40px_rgba(255,122,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? profile.username}
                className="h-20 w-20 rounded-2xl object-cover border border-primary/20"
              />
            ) : (
              <InitialsAvatar name={profile.full_name ?? profile.username} />
            )}

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                  {profile.full_name ?? profile.username}
                </h1>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${rolePillClass(profile.role)}`}>
                  {profile.role.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground font-mono">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {chapter && (
                  <span className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5">
                    🌍 {chapter.name}{chapter.city ? `, ${chapter.city}` : ""}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Member since {formatMemberSince(profile.created_at)}
                </span>
              </div>

              {/* Social links */}
              <div className="mt-4 flex flex-wrap gap-3">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
            </div>

            {/* Contribution score */}
            <div className="shrink-0 rounded-2xl border border-primary/20 bg-primary/8 px-6 py-5 text-center shadow-[0_0_40px_rgba(255,122,0,0.12)]">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                <Zap className="h-3.5 w-3.5 text-primary" /> Contribution
              </div>
              <div className="mt-2 font-display text-4xl font-semibold tracking-tight text-primary">
                {profile.contribution_score}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">points</div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Badges ── */}
      <SectionWrapper eyebrow="Badges" title="Achievements" className="pt-12 pb-0">
        {typedBadges.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 flex items-center gap-4 text-muted-foreground">
            <Award className="h-5 w-5 text-zinc-600 shrink-0" />
            <span className="text-sm">No badges yet — earn them by attending events, shipping projects, and contributing.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {typedBadges.map(({ awarded_at, badge }) => {
              if (!badge) return null;
              return (
                <div
                  key={badge.id}
                  title={badge.description ?? badge.name}
                  className="flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2.5"
                >
                  {badge.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={badge.icon_url} alt="" className="h-5 w-5" />
                  ) : (
                    <Star className="h-4 w-4 text-primary" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">{badge.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(awarded_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionWrapper>

      {/* ── My Challenges ── */}
      <SectionWrapper eyebrow="Challenges" title="My submissions" className="pt-12 pb-0">
        {typedSubmissions.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-10 text-center space-y-3">
            <p className="font-display text-lg font-semibold text-white">
              You haven&apos;t submitted to any challenges yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Browse active challenges and ship your first entry.
            </p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2"
            >
              Browse Challenges <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {typedSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                    {sub.challenge?.status === "active" ? "Active" : "Past"} challenge
                  </div>
                  <div className="mt-1 font-semibold text-sm text-white truncate">
                    {sub.challenge?.title ?? "Unknown challenge"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Submitted {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </div>
                </div>
                {sub.submission_url && (
                  <a
                    href={sub.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ── Event History (paginated) ── */}
      <SectionWrapper eyebrow="Event History" title="Events attended &amp; registered" className="pt-12 pb-20">
        <EventHistoryClient
          initialRows={typedHistory}
          hasMoreInitially={hasMoreHistory}
          userId={user.id}
        />
      </SectionWrapper>
    </div>
  );
}
