# Challenges & Leaderboard — requirements

Project slice of the Heapify Global Community Platform (`~/Projects/Heapify-platform`, Next.js App Router + Supabase project `hfdymlfamjyonzasxwvc`). Reconciled with the independent Terra review (CL-P0, 2026-08-26); write-path architecture follows the review's corrections.

## Outcome
- Problem or opportunity: `/challenges` accepts submission URLs but nothing scores or curates them; `/leaderboard` renders hardcoded mock names. `leaderboard_entries` exists in schema but has no writer. The gamification loop (participate → validated → ranked) is broken.
- Intended users or stakeholders: members (submit entries, see standing), core_team/super_admin (validate submissions, pick winners), public visitors (browse rankings).
- Core outcome: an approved challenge completion converts into an audited point award, reflected on a real global leaderboard rendered from `leaderboard_entries`.
- Success measures: submit → approve → points visible on `/leaderboard` within one page load; no unauthorized score mutation possible via direct Supabase REST; zero RLS regressions.

## Scope
- In scope:
  - DB migration pack: RLS + privilege revocation on `challenges`, `challenge_submissions`, `point_awards`, `leaderboard_entries`; review lifecycle; `point_awards` ledger; security-definer RPCs owning ALL state-changing writes (submission/resubmission, review+award, winner, recompute); FK deletion-behavior fixes; public approved-counts aggregate function; TypeScript type unions in `lib/types/database.ts` (authored in CL-P1 alongside the migrations).
  - `/leaderboard` rebuilt as a server component on real data (category tabs, all-time period).
  - Submission UX on `/challenges` (status badges, resubmit, approved-count per card).
  - Admin approval queue calling the review RPC.
  - Dashboard personal-score widget sourced from the ledger (replacing the unwritten `profiles.contribution_score` display on `/dashboard`).
  - Live-environment verification (curl REST matrix + deployed build E2E, throwaway test rows marked and cleaned).
- Explicitly out of scope (non-goals):
  - Realtime/live-updating boards (fetch-on-load everywhere).
  - Monthly/period-filtered boards beyond the `period='all_time'` default.
  - External verification integrations (LeetCode API, GitHub API).
  - Badges integration, notifications, emails.
  - Per-challenge ranking page.
  - Row links from leaderboard entries to individual profiles (no public profile route exists yet — dropped per review F14).
- Constraints and assumptions:
  - Scoring is honor-system with proof URL (existing `submission_url` field); human review provides the anti-spam layer.
  - Challenge creation/curation remains manual DB/admin work for now (no challenge-authoring UI in this slice).

## Requirements

### R1 — Submission lifecycle via DB-owned RPC (LOCKED)
- Description: `challenge_submissions` gains `status text not null default 'pending' check (status in ('pending','approved','rejected'))`, `reviewed_by`, `reviewed_at`, `review_note`. One row per `(challenge_id, user_id)` (unique, created only after migration preflight dedups historical duplicates). Members have ZERO insert/update grants on the base table; all writes go through `submit_challenge_entry(p_challenge_id, p_url)` — a security-definer RPC that derives `auth.uid()`, validates URL scheme (`http`/`https` only), asserts the challenge exists and is open (`end_at` null or future), then: no row → insert pending; pending → overwrite URL + `submitted_at`; rejected → overwrite URL + reset to `pending` + clear review metadata; approved → structured no-op (immutable). Returns structured `{status, changed}` JSON, never an exception, for deterministic typing.
- Discretion: LOCKED
- Acceptance criteria: anonymous AND authenticated REST DML against `challenge_submissions` denied; duplicate submit reuses the row via conflict-target handling; JS scheme payloads rejected; `tsc --noEmit` clean.

### R2 — Points ledger (LOCKED)
- Description: new table `point_awards` (`id`, `user_id uuid not null references profiles(id) on delete cascade`, `source_type text check in ('challenge_completion','challenge_winner')`, `source_id uuid`, `points int not null check (points > 0)`, `awarded_by uuid references profiles(id) on delete set null`, `created_at`). Immutable audit log. Unique `(source_type, source_id, user_id)`. RLS: users read own rows, reviewers read all. ALL DML revoked from `anon`, `authenticated`, and `service_role`; inserts happen only inside definer-function bodies (which run as owner).
- Discretion: LOCKED
- Acceptance criteria: no direct-table write path exists for any client-facing role; two approvals cannot double-award (unique constraint + transition guard).

### R3 — Awarding rule, atomic review+award (LOCKED)
- Description: a single security-definer RPC `review_challenge_submission(p_submission_id, p_decision, p_note)` performs the whole transition: locks the submission row, asserts caller is `core_team`/`super_admin` (via `has_role`), asserts current status is `pending` (else structured `{status: <current>, changed:false}` no-op), stamps `reviewed_by = auth.uid()` / `reviewed_at` / `review_note`, and — ONLY for `pending → approved` — inserts the `challenge_completion` award (base 100) and increments/upserts `leaderboard_entries` under the same transaction advisory lock. No generic award RPC exists (forgeability removed per review F3); reviewer identity is never client-supplied. Rejecting later-approved-again flows is structurally impossible because approved rows leave the pending pool.
- Discretion: LOCKED
- Acceptance criteria: award, review stamp, and store update commit or roll back together (verified by fault injection test); member-role invocation returns permission error string.

### R4 — `leaderboard_entries` is a derived, secured store (LOCKED)
- Description: unique index on `(user_id, category, period)`. RLS enables public SELECT; ALL DML revoked from `anon`/`authenticated`/`service_role`. Writers: the review/winner RPCs (increment upserts, category `'contributors'`) and `recompute_leaderboard_category()` (see R11) — every writer acquires the shared category/period advisory lock first (review F12).
- Discretion: LOCKED
- Acceptance criteria: deleting a user cascades the ledger and recompute reproduces totals matching ledger sums; direct REST mutation attempts fail with permission denied.

### R5 — RLS hardening across all four tables (LOCKED)
- Description: `challenges`: public SELECT, no client-write policies, DML revoked from non-owner roles. `challenge_submissions`: SELECT own rows (authenticated) plus reviewer-wide SELECT; no write policies, DML revoked (writes flow exclusively through R1/R3 RPCs). `point_awards` per R2. `leaderboard_entries` per R4. Server actions become thin callers of the RPCs (session-derived identity preserved); they are convenience, not enforcement.
- Discretion: LOCKED
- Acceptance criteria: curl REST matrix (anon/authenticated/member/admin × select/insert/update/delete × 4 tables) recorded in STATUS.md; expected denials observed live.
- Note (review F5/F8): this intentionally narrows earlier "authenticated read all submissions"; proof URLs and review notes are visible only to row owners and reviewers. FK deletion behavior fixed while migrating: `challenges.winner_id`, `reviewed_by`, `awarded_by` → `ON DELETE SET NULL`; `point_awards.user_id` → CASCADE.

### R6 — `/leaderboard` on real data (LOCKED)
- Description: route becomes a SERVER component fetching via cookie-bound server client (review F13); interactivity (category tabs) lives in a client child component. Four category tabs; top 50 per category ordered `score desc, updated_at asc, username asc` with shared ranks for ties; signed-in viewer sees own row highlighted plus true rank appended below top 50 when outside it; avatar, username, full name, role label rendered plain (no hyperlinks); loading skeleton and empty state ("No scores yet — be the first"); inline retry card on error. Signed-out view hides the personal footer. Mock "+X%" change indicators are dropped.
- Discretion: LOCKED
- Acceptance criteria: renders correctly empty, single-user, 50+, ties; page performs zero hardcoded-data reads; `tsc --noEmit` clean.

### R7 — Submission UX on `/challenges` (LOCKED)
- Description: member sees own status badge (pending/approved/rejected); rejected surfaces `review_note` + resubmit affordance (calls the R1 RPC, restoring `pending`); pending shows editable URL field; approved is read-only with confirmation copy. Every active-challenge card shows an approved-participant count ("N solved") fed by `get_approved_submission_counts()` — a public-executable security-definer function returning `(challenge_id, approved_count)` tuples with no URLs, identities, or notes (review F10) — wired into `getActiveChallenges`/`getPastChallenges`. Copy updates replace "Multiple submissions are allowed".
- Discretion: LOCKED

### R8 — Admin approval queue (LOCKED)
- Description: `/admin` gains a pending-submissions list (challenge title, username, proof URL opening `target="_blank" rel="noopener noreferrer"`, submitted time) with approve/reject(+note) controls invoking the R3 RPC via a thin `reviewSubmission` server action. Winner-set control (D2) sits alongside, invoking `set_challenge_winner(p_challenge_id, p_winner_id)` — which additionally asserts the proposed winner holds an APPROVED submission for that challenge before stamping `winner_id` and creating the 250-point `challenge_winner` award if absent (idempotent on unchanged winner). Every action stamps reviewer identity from the session inside Postgres.
- Discretion: LOCKED
- Acceptance criteria: non-reviewer invocation refused server-side at RPC level even when reached directly; approve-on-reviewed returns current status without side effects.

### R9 — Dashboard score widget from the ledger (LOCKED)
- Description: `/dashboard` "Contribution Score" card switches its source from the never-written `profiles.contribution_score` column to the ledger-derived total (own `point_awards` sum / `leaderboard_entries` value), plus per-category breakdown and last 5 awards with reason labels. No second score store may be introduced (review F15). `/profile` continues showing the legacy column until a later cleanup slice (known issue, tracked in STATUS.md).
- Discretion: LOCKED

### R10 — Production visibility gating (AGENT_DISCRETION)
- Description: `/challenges` stays hidden behind the existing nav/footer filter predicate (`NEXT_PUBLIC_STAGE==='production' || NODE_ENV==='production'`) until md signs off after live E2E. `/leaderboard` currently has no navigation entry anywhere — post-sign-off work adds its nav/footer entry explicitly (a new UI change, listed for approval rather than assumed). June prepares the PR immediately after sign-off.
- Discretion: AGENT_DISCRETION — bounded to the exact predicate/link changes described; nothing else.

### R11 — Repair procedure (LOCKED)
- Description: `recompute_leaderboard_category()` accepts only `'contributors'` (rejecting every other schema-valid category with a clear error so unrelated partitions can never be blanked — review F11), rebuilds `(contributors, 'all_time')` strictly from `point_awards` sums under the advisory lock. Callable when `auth.uid() IS NULL` (owner/SQL-editor context) or by `super_admin`.
- Discretion: LOCKED

## Open decisions
None. D1 (100 base / 250 winner bonus), D2 (explicit winner RPC, no triggers), D3 (core_team + super_admin reviewer set) — decided by md, 2026-08-26.
