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
// └──────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic"; // ← prevents shared/static caching

import { redirect } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import {
  Github, Linkedin, Twitter, Globe, Zap, CalendarDays,
  Award, Star, ExternalLink, Pencil, Trophy,
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
import { LeaderboardBreakdown } from "@/components/profile/LeaderboardBreakdown";

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
  const safeName = name || "?";
  const initials = safeName
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

  // Profile is the critical fetch — surface a clear error if it fails,
  // or a setup form if the row simply doesn't exist yet.
  if (profileError) {
    return (
      <SectionWrapper eyebrow="Profile" title="Couldn&apos;t load your profile" className="pt-36">
        <p className="text-sm text-muted-foreground">
          {profileError?.message ?? "Something went wrong fetching your profile. Please try again."}
        </p>
      </SectionWrapper>
    );
  }

  // maybeSingle() returns null data (no error) when the row doesn't exist.
  // With the Supabase trigger this shouldn't happen, but handle it gracefully.
  if (!profile) {
    return (
      <SectionWrapper eyebrow="Profile" title="Profile not found" className="pt-36">
        <p className="text-sm text-muted-foreground">
          Your profile row doesn&apos;t exist yet. If you just signed up, try refreshing in a moment.
        </p>
      </SectionWrapper>
    );
  }

  // Non-critical failures — log, don't crash
  if (badgesError) console.error("[profile] badges error:", badgesError.message);
  if (historyError) console.error("[profile] history error:", historyError.message);
  if (submissionsError) console.error("[profile] submissions error:", submissionsError.message);

  const chapter = profile.chapter as { name: string; city: string | null; country: string | null } | null;
  const typedProfile = profile as unknown as {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    role: string;
    contribution_score: number;
    github_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    created_at: string;
    chapter: { id: string; name: string; city: string | null; country: string | null } | null;
    led_chapters: { id: string; name: string; city: string | null; country: string | null }[];
    team_members: { title: string; display_name: string }[];
    won_challenges: { id: string; title: string; status: string; end_at: string | null }[];
    project_maintainers: { project: { id: string; name: string; slug: string } }[];
    project_contributors: { project: { id: string; name: string; slug: string } }[];
    leaderboard_entries: { category: string; score: number; period: string }[];
  };

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

  const maintainedProjectIds = new Set(
    (typedProfile.project_maintainers ?? []).map((m) => m.project?.id).filter(Boolean)
  );

  const filteredContributors = (typedProfile.project_contributors ?? []).filter(
    (c) => c.project?.id && !maintainedProjectIds.has(c.project.id)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <SectionWrapper eyebrow="Profile" title="" className="pt-36 pb-0">
        <div className="mt-2 rounded-[2rem] border border-glass-border bg-glass-bg/80 p-8 shadow-[0_30px_100px_-40px_rgba(255,122,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            {typedProfile.avatar_url ? (
              <SafeImage
                src={typedProfile.avatar_url}
                alt={typedProfile.full_name ?? typedProfile.username}
                width={80}
                height={80}
                className="h-20 w-20 rounded-2xl object-cover border border-primary/20"
                fallback={<InitialsAvatar name={typedProfile.full_name ?? typedProfile.username} />}
              />
            ) : (
              <InitialsAvatar name={typedProfile.full_name ?? typedProfile.username} />
            )}

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                  {typedProfile.full_name ?? typedProfile.username}
                </h1>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${rolePillClass(typedProfile.role)}`}>
                  {typedProfile.role.replace("_", " ")}
                </span>
                {/* Team member title */}
                {typedProfile.team_members && typedProfile.team_members.length > 0 && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 px-3 py-0.5 text-xs font-medium capitalize">
                    {typedProfile.team_members[0].title.replace("_", " ")}
                  </span>
                )}
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-glass-border"
                >
                  <Pencil className="h-3 w-3 text-primary" />
                  <span>Edit Profile</span>
                </Link>
              </div>
              <p className="mt-1 text-sm text-muted-foreground font-mono">@{typedProfile.username}</p>
              {typedProfile.bio && (
                <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-2xl">
                  {typedProfile.bio}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {chapter && (
                  <span className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5">
                    🌍 {chapter.name}
                    {chapter.city ? `, ${chapter.city}` : ""}
                    {chapter.country ? `, ${chapter.country}` : ""}
                  </span>
                )}
                {/* Chapter Lead badge */}
                {typedProfile.led_chapters && typedProfile.led_chapters.length > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-400">
                    👑 Lead, {typedProfile.led_chapters[0].name}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Member since {formatMemberSince(typedProfile.created_at)}
                </span>
              </div>

              {/* Social links */}
              <div className="mt-4 flex flex-wrap gap-3">
                {typedProfile.github_url && (
                  <a href={typedProfile.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {typedProfile.linkedin_url && (
                  <a href={typedProfile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {typedProfile.twitter_url && (
                  <a href={typedProfile.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </a>
                )}
                {typedProfile.website_url && (
                  <a href={typedProfile.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
            </div>

            {/* Contribution score & breakdown */}
            <div className="w-full sm:w-[280px] shrink-0 text-center">
              <div className="rounded-2xl border border-primary/20 bg-primary/8 px-6 py-5 shadow-[0_0_40px_rgba(255,122,0,0.12)]">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Contribution
                </div>
                <div className="mt-2 font-display text-4xl font-semibold tracking-tight text-primary">
                  {typedProfile.contribution_score}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">points</div>
              </div>
              
              {/* Leaderboard breakdown */}
              {typedProfile.leaderboard_entries && typedProfile.leaderboard_entries.length > 0 && (
                <LeaderboardBreakdown entries={typedProfile.leaderboard_entries} />
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Badges & Achievements ── */}
      <SectionWrapper eyebrow="Badges & Achievements" title="Achievements" className="pt-12 pb-0">
        {typedBadges.length === 0 && (!typedProfile.won_challenges || typedProfile.won_challenges.length === 0) ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 flex items-center gap-4 text-muted-foreground">
            <Award className="h-5 w-5 text-zinc-600 shrink-0" />
            <span className="text-sm">No badges or awards yet — earn them by attending events, winning challenges, and contributing.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {/* Challenge Winners */}
            {typedProfile.won_challenges?.map((challenge) => (
              <div
                key={challenge.id}
                title={`Won Monthly Challenge: ${challenge.title}`}
                className="flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-2.5"
              >
                <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-amber-400 flex items-center gap-1">
                    Challenge Winner
                  </div>
                  {challenge.end_at && (
                    <div className="text-[9px] text-muted-foreground font-mono">
                      {new Date(challenge.end_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground truncate max-w-[150px] mt-0.5">
                    {challenge.title}
                  </div>
                </div>
              </div>
            ))}

            {/* Badges */}
            {typedBadges.map(({ awarded_at, badge }) => {
              if (!badge) return null;
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-2.5"
                >
                  {badge.icon_url ? (
                    <SafeImage 
                      src={badge.icon_url} 
                      alt={badge.name} 
                      width={20}
                      height={20}
                      className="h-5 w-5 object-cover" 
                      fallback={<Star className="h-4 w-4 text-primary" />}
                    />
                  ) : (
                    <Star className="h-4 w-4 text-primary" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">{badge.name}</div>
                    {badge.description && (
                      <div className="text-[9px] text-zinc-400 max-w-[200px] leading-tight">
                        {badge.description}
                      </div>
                    )}
                    <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">
                      {new Date(awarded_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionWrapper>

      {/* ── Open Source Projects ── */}
      <SectionWrapper eyebrow="Open Source" title="Projects &amp; Contributions" className="pt-12 pb-0">
        {(!typedProfile.project_maintainers || typedProfile.project_maintainers.length === 0) &&
        (filteredContributors.length === 0) ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 flex items-center gap-4 text-muted-foreground">
            <Award className="h-5 w-5 text-zinc-600 shrink-0" />
            <span className="text-sm">No open-source project affiliations yet. Join or maintain projects on the platform!</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Maintaining */}
            {typedProfile.project_maintainers && typedProfile.project_maintainers.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Award className="h-4 w-4" /> Maintains
                </h4>
                <div className="flex flex-wrap gap-2">
                  {typedProfile.project_maintainers.map(({ project }) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/20 text-xs text-white transition-colors"
                    >
                      {project.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contributing */}
            {filteredContributors.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Contributes to
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filteredContributors.map(({ project }) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {project.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
