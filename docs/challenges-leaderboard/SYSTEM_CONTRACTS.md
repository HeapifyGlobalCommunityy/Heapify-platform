# Challenges & Leaderboard — system contracts

Architecture principle (per CL-P0 review): every state-changing write is owned by a security-definer RPC that validates inputs, derives identity from `auth.uid()`, and enforces role/lifecycle rules INSIDE Postgres. Client-side roles hold read grants only (scoped by RLS) plus `EXECUTE` on their specific functions. Server actions wrap RPC calls for UX; they confer no authority.

## Data

| Entity | Fields | Owner | Validation | Retention/access |
| --- | --- | --- | --- | --- |
| `challenges` (existing) | id, title, description, status(active/past), start_at, end_at, winner_id → profiles(id) ON DELETE SET NULL (migrated) | core_team via SQL/admin tooling (no member UI this slice) | schema checks | public SELECT via RLS; all client-role DML revoked |
| `challenge_submissions` (extended) | existing: id, challenge_id, user_id, submission_url, submitted_at; new: status(pending/approved/rejected) default pending, reviewed_by ON DELETE SET NULL, reviewed_at, review_note | row owner reads own; reviewers read/write via RPC | UNIQUE (challenge_id, user_id) after preflight dedup; URL scheme http/https enforced in RPC | RLS: authenticated SELECT own, reviewers SELECT all; ALL DML revoked from anon/authenticated/service_role — writes exist only behind `submit_challenge_entry` |
| `point_awards` (new) | id, user_id → profiles ON DELETE CASCADE, source_type(challenge_completion/challenge_winner), source_id, points>0, awarded_by ON DELETE SET NULL, created_at | written only inside review/winner RPC bodies | UNIQUE (source_type, source_id, user_id) | RLS: own-row read (authenticated), reviewer-wide read; all DML revoked from client roles; ledger IS the audit log |
| `leaderboard_entries` (existing, constrained) | id, user_id, category(enum 4), score, period, updated_at; NEW UNIQUE (user_id, category, period) | maintained by review/winner RPCs + recompute only | public SELECT via RLS; all client-role DML revoked |

## Interfaces

All functions: `SECURITY DEFINER`, `LANGUAGE plpgsql`, `set search_path = pg_catalog, public, pg_temp` (temp searched last, explicitly listed), default PUBLIC `EXECUTE` revoked, `GRANT EXECUTE` to exactly the intended role(s), all application objects schema-qualified (review F7). The shared `has_role()` helper is recreated onto this same hardened path in migration `012` so every definer caller shares one invariant.

Naming pairs: SQL functions take snake_case (`review_challenge_submission`); their TypeScript wrappers and query helpers take camelCase (`reviewSubmission`, `getPendingChallengeSubmissions`) and map 1:1. Table columns stay snake_case everywhere.

| Boundary | Request/input | Response/output | Auth/permission | Failure behavior |
| --- | --- | --- | --- | --- |
| `submit_challenge_entry(p_challenge_id uuid, p_url text)` | challenge + proof URL | jsonb `{status:'pending'\|'approved-noop', changed:boolean}` | EXECUTE → authenticated; identity = `auth.uid()` inside | rejects unknown challenge, closed challenge (`end_at <= now()`), non-http(s) URL, approved-immutability as structured no-op |
| `review_challenge_submission(p_submission_id uuid, p_decision text, p_note text)` | submission id + 'approved'/'rejected' | jsonb `{status, changed:boolean, points_awarded?:int}` | EXECUTE → authenticated; internally asserts `has_role('core_team')`; hard-codes source_type + reviewer=`auth.uid()` | non-pending → structured `{status:<current>, changed:false}`; insufficient role → exception (permission message); single transaction covers stamp + ledger + board increment (advisory-locked) |
| `set_challenge_winner(p_challenge_id uuid, p_winner_id uuid)` | challenge + winner | jsonb `{winner_id, changed:boolean}` | EXECUTE → authenticated; asserts `has_role('core_team')`; asserts winner owns an APPROVED submission on that challenge | unchanged winner → `{changed:false}`; unknown/unapproved winner → exception |
| `recompute_leaderboard_category()` | — (parameterless; operates on 'contributors'/'all_time' only) | jsonb `{rebuilt_rows:int}` | succeeds when `auth.uid() IS NULL` (SQL editor/owner) or `has_role('super_admin')` | rejects all other categories/timespans by design (F11) |
| `get_approved_submission_counts()` | — | SET OF `(challenge_id uuid, approved_count bigint)` | EXECUTE → public (incl. anon) | returns zero rows when table empty; no PII exposure |
| `submitChallengeEntry` server action (`lib/actions/challenges.ts`) | challengeId, submissionUrl | passes through to `submit_challenge_entry`; maps exceptions to error strings, no-op result to friendly "already approved" | login redirect when signed out; keeps session-derived guarantee | preserves existing error-string API for the card UI |
| `reviewSubmission` server action (new, `lib/actions/challenges.ts`) | submissionId, decision, note | maps RPC result/error | auth boundary lives in the RPC | `useTransition` double-click guard retained |
| `getLeaderboard(p_category)` query (`lib/supabase/queries.ts`) | category key | top 50 joined `profiles(username, full_name, avatar_url, role)` + viewer `{rank,total}` via session cookie client | public read; viewer block only when signed in | error propagated → inline retry UI |
| `getMySubmissionsWithStatus(userId)` query (`lib/supabase/queries.ts`, CL-P3) | userId | caller's own submission rows + status + review_note + per-challenge approved counts | own-row visibility via RLS | empty array when none |
| `getPendingChallengeSubmissions()` query (`lib/supabase/queries.ts`, CL-P4) | — | pending submissions joined challenge title + username for the `/admin` queue | reviewer-wide visibility via RLS alone — no extra privilege surface | empty array when queue is clear |
| `lib/types/database.ts` additions | — | literal unions: `SubmissionStatus`, `PointSource`, `LeaderboardCategory`; interfaces: submission rows, ledger rows, board rows, all RPC result shapes | — | compiled contracts required by strict repo (F17); no `unknown` casts in new code |

## Operational rules
- Auditability: `point_awards` (who/why/when/how much) + review stamps reconstruct any score; reviewer identity is forged-proof (derived in Postgres).
- Recovery: drift repair exclusively via `recompute_leaderboard_category()`; hand-editing scores prohibited.
- Concurrency: every derived-row writer takes the same `pg_advisory_xact_lock(hashtext(category||':all_time'))`; recompute-safe.
- Observability: structured `[actionName]` console logs per house style; Vercel logs remain the surface.
- Service expectations: fetch-on-load reads; no ISR changes this slice.
- Test hygiene: verification uses throwaway accounts/rows; every inserted test row deleted or clearly marked `TEST:` per authorized-pentest convention.
