// app/challenges/page.tsx
// Public challenges page — server component.
// Fetches active + past challenges from Supabase with full error handling.
// Auth session checked server-side so ChallengeCard knows whether to show
// the submission form or a "sign in" CTA — no client-side auth check.

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveChallenges, getPastChallenges } from "@/lib/supabase/queries";
import { SectionWrapper } from "@/components/site/ui";
import ChallengeCard, { type ChallengeData } from "@/components/challenges/ChallengeCard";

// PostgREST always returns joined rows as an array, even for many-to-one FKs.
// This mapper normalises winner from { ... }[] → { ... } | null so the data
// matches ChallengeData exactly. No runtime behaviour change.
function normaliseChallenge(row: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_at: string | null;
  end_at: string | null;
  winner: { id: string; username: string; full_name: string | null; avatar_url: string | null }[];
}): ChallengeData {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as ChallengeData["status"],
    start_at: row.start_at,
    end_at: row.end_at,
    winner: row.winner?.[0] ?? null,
  };
}

// ─── Skeleton for streaming fallback ─────────────────────────────────────

function ChallengeSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1.75rem] border border-glass-border bg-glass-bg p-6 space-y-4 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-zinc-800/60" />
              <div className="h-7 w-48 rounded-lg bg-zinc-800/60" />
            </div>
            <div className="h-6 w-14 rounded-full bg-zinc-800/50" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-zinc-800/40" />
            <div className="h-3.5 w-4/5 rounded bg-zinc-800/40" />
            <div className="h-3.5 w-3/5 rounded bg-zinc-800/30" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-40 rounded-xl bg-zinc-800/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Active challenges section ────────────────────────────────────────────

async function ActiveChallenges({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { data, error } = await getActiveChallenges();

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-8 text-center text-sm text-muted-foreground">
        Couldn&apos;t load active challenges. Please refresh.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-12 text-center space-y-2">
        <p className="font-display text-lg font-semibold text-white">No active challenges right now.</p>
        <p className="text-sm text-muted-foreground">
          New challenges drop monthly — check back soon or follow us on socials.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {(data as unknown[]).map((row) => normaliseChallenge(row as Parameters<typeof normaliseChallenge>[0])).map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}

// ─── Past challenges section ──────────────────────────────────────────────

async function PastChallenges() {
  const { data, error } = await getPastChallenges(10);

  if (error) return null; // past challenges failing is non-critical — silent skip

  if (!data || data.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-10 text-center space-y-2">
        <p className="font-display text-lg font-semibold text-white">No past challenges yet.</p>
        <p className="text-sm text-muted-foreground">Be the first to participate when we launch.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {(data as unknown[]).map((row) => normaliseChallenge(row as Parameters<typeof normaliseChallenge>[0])).map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          isAuthenticated={false} // past challenges never show submission form
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function ChallengesPage() {
  // Auth check — server-side, session from cookie. We pass the boolean down
  // to ChallengeCard so it can render the correct CTA without a client fetch.
  // We do NOT redirect here — challenges are fully public; auth only gates submit.
  const supabase = await createClient();
  let isAuthenticated = false;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  return (
    <>
      <SectionWrapper
        eyebrow="Monthly Challenges"
        title="Build. Ship. Get noticed."
        description="Community challenges with real prizes and visibility. Submit a link to your entry — repos, deployed sites, or docs all qualify."
        className="pt-36 pb-12"
      >
        <Suspense fallback={<ChallengeSkeleton />}>
          <ActiveChallenges isAuthenticated={isAuthenticated} />
        </Suspense>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Past Challenges"
        title="Previous rounds"
        description="Browse past challenges and see what the community built."
        className="pb-20"
      >
        <Suspense fallback={<ChallengeSkeleton />}>
          <PastChallenges />
        </Suspense>
      </SectionWrapper>
    </>
  );
}
