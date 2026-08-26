# Challenges & Leaderboard — requirements

Project slice of the Heapify Global Community Platform (`~/Projects/Heapify-platform`, Next.js App Router + Supabase project `hfdymlfamjyonzasxwvc`).

## Outcome
- Problem or opportunity: `/challenges` accepts submission URLs but nothing scores or curates them; `/leaderboard` renders hardcoded mock names. `leaderboard_entries` exists in schema but has no writer. The gamification loop (participate → validated → ranked) is broken.
- Intended users or stakeholders: members (submit entries, see standing), core_team/super_admin (validate submissions, pick winners), public visitors (browse rankings).
- Core outcome: an approved challenge completion converts into an audited point award, reflected on a real global leaderboard rendered from `leaderboard_entries`.
- Success measures: submit → approve → points visible on `/leaderboard` + dashboard within one page load; no unauthorized score mutation possible via direct Supabase REST; zero RLS regressions.

## Scope
- In scope:
  - DB migration pack: RLS on `challenges` + `challenge_submissions`; submission review lifecycle; `point_awards` ledger; award + recompute RPCs.
  - `/leaderboard` rewritten onto real data (category tabs, all-time period).
  - Submission UX on `/challenges` (status badges, resubmit, participants count).
  - Admin approval queue + review server action.
  - Dashboard personal-score widget.
  - Live-environment verification (staging build + Supabase, throwaway test rows marked and cleaned).
- Explicitly out of scope (non-goals):
  - Realtime/live-updating boards (fetch-on-load everywhere).
  - Monthly/period-filtered boards beyond the `period='all_time'` default.
  - External verification integrations (LeetCode API, GitHub API).
  - Badges integration, notifications, emails.
  - Per-challenge ranking page (trivial follow-up once R7 data exists).
- Constraints and assumptions:
  - Scoring is honor-system with proof URL (existing `submission_url` field); human review provides the anti-spam layer.
  - Challenge creation/curations remain manual DB/admin work for now (no challenge-authoring UI in this slice).

## Requirements

### R1 — Submission review lifecycle (LOCKED)
- Description: `challenge_submissions` gains `status text not null default 'pending' check (status in ('pending','approved','rejected'))`, `reviewed_by uuid null references profiles(id)`, `reviewed_at timestamptz null`, `review_note text null`. One row per `(challenge_id, user_id)` (unique). Resubmission while pending or rejected overwrites `submission_url` in place (idempotent upsert from the server action); approved rows become immutable to the member.
- Discretion: LOCKED
- Acceptance criteria: anonymous REST insert denied; authenticated user cannot insert/update another user's row; duplicate submit reuses the existing row; `tsc --noEmit` clean.
- Failure or edge behavior: submit on a challenge whose `end_at < now()` returns a clear "submissions closed" error; nonexistent challenge id returns clean error.

### R2 — Points ledger (LOCKED)
- Description: new table `point_awards` (`id`, `user_id → profiles`, `source_type check in ('challenge_completion','challenge_winner')`, `source_id uuid` (challenge id), `points int > 0`, `awarded_by uuid null`, `created_at`). Immutable once written; `unique (source_type, source_id, user_id)`. Inserts allowed **only** through the security-definer RPC (grants revoked from authenticated/service paths other than the RPC body).
- Discretion: LOCKED
- Acceptance criteria: no direct-table insert path for authenticated roles; two approvals of the same submission cannot double-award.

### R3 — Awarding rule (LOCKED)
- Description: only the transition `pending → approved` performed by `core_team` or `super_admin` creates a `challenge_completion` award (base points, see open decision D1). When a `core_team`/`super_admin` sets `challenges.winner_id`, a `challenge_winner` bonus award is created if none exists (open decision D2 governs mechanism). Rejected submissions never carry points; approving later re-runs the same guard.
- Discretion: LOCKED
- Acceptance criteria: member-role approval attempt raises/returns permission error; approval RPC and leaderboard upsert happen in one transaction (partial failure leaves no half-state).

### R4 — `leaderboard_entries` is a derived store (LOCKED)
- Description: unique index on `(user_id, category, period)`. The award RPC upserts score increments; a `recompute_leaderboard_category(p_category)` RPC (security definer, advisory-lock guarded) rebuilds the store from `point_awards` for drift repair/backfill. Challenge points map to category `'contributors'`.
- Discretion: LOCKED
- Acceptance criteria: deleting a user cascades cleanly and recompute reproduces totals matching the ledger sum.

### R5 — RLS hardening (LOCKED)
- Description: `challenges`: public read; insert/update/delete restricted to `core_team`/`super_admin`. `challenge_submissions`: anon none; authenticated read all; insert own (`with check (auth.uid() = user_id)`); update limited to the review columns by reviewers (`core_team`/`super_admin`) via grants mirroring migration `006` style; member edits of own pending URL go through the server action's upsert path with explicit narrow grant.
- Discretion: LOCKED
- Acceptance criteria: REST matrix verified with `curl` (anon/authed/member/admin combinations) and results recorded in `STATUS.md`.

### R6 — `/leaderboard` on real data (LOCKED)
- Description: replaces mock array. Tabs for the four existing categories; top 50 per category ordered by score desc, stable tie order (score, then older `updated_at`, then username asc; equal ranks shown as shared rank). Signed-in viewer sees their own row highlighted, plus their true rank appended below the top 50 when outside it. Avatar, username, full name, role label from `profiles`; rows link to `/profile`. Loading skeleton (existing pattern) and empty state ("No scores yet — be the first").
- Discretion: LOCKED
- Acceptance criteria: renders correctly with empty table, single user, 50+, ties; signed-out view hides "your rank" footer. No change-rate indicator (the mock's "+12%" is dropped).
- Failure or edge behavior: query error shows inline retry card, never blank page.

### R7 — Submission UX on `/challenges` (LOCKED)
- Description: member sees status badge (pending/approved/rejected) on their submission; rejected surfaces `review_note` + a "resubmit" affordance; while pending the field is editable. Card shows approved-participant count ("N solved") per active challenge.
- Discretion: LOCKED

### R8 — Admin approval queue (LOCKED)
- Description: `/admin` gains a pending-submissions list (challenge title, username, proof URL target=_blank, submitted time) with approve/reject (+ optional note) controls calling a `reviewSubmission` server action which invokes the award RPC for approvals. Every action stamps `reviewed_by`/`reviewed_at`.
- Discretion: LOCKED
- Acceptance criteria: non-reviewer hitting the action is refused server-side; approve on already-reviewed row is a no-op returning current status.

### R9 — Dashboard score widget (LOCKED)
- Description: `/dashboard` shows personal total points, per-category breakdown, last 5 ledger awards with reason labels.
- Discretion: LOCKED

### R10 — Production visibility gating (AGENT_DISCRETION)
- Description: `/challenges` and `/leaderboard` stay hidden behind the existing `NEXT_PUBLIC_STAGE==='production'` nav flag until md signs off after live E2E. June may flip the flag in the merge PR immediately after that sign-off.
- Discretion: AGENT_DISCRETION — bounded to the nav/footer/stage-flag wiring only; no other gating changes.

## Open decisions
- **D1 — Point values**: base per approved completion; bonus for winner. Recommended: `100` base, `250` winner bonus. Owner: md. Needed by: P1 migration constants (provisional 100/250 coded until confirmed).
- **D2 — Winner award mechanism**: DB trigger on `winner_id` set vs explicit admin action button calling an RPC. Recommended: explicit RPC invoked from the same admin UI that sets the winner (visible, undoable-by-decision, no hidden triggers). Owner: md. Needed by: P1.
- **D3 — Reviewer role set**: confirm `core_team + super_admin` (no `chapter_admin` — challenges are global, chapters aren't modeled on them). Owner: md. Needed by: P1.
