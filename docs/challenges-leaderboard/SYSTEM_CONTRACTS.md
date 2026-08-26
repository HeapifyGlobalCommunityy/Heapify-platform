# Challenges & Leaderboard — system contracts

## Data

| Entity | Fields | Owner | Validation | Retention/access |
| --- | --- | --- | --- | --- |
| `challenges` (existing) | id, title, description, status(active/past), start_at, end_at, winner_id → profiles | core_team | schema checks; new: RLS gates writes to core_team/super_admin | public read |
| `challenge_submissions` (extended) | existing: id, challenge_id, user_id, submission_url, submitted_at; new: status(pending/approved/rejected) default pending, reviewed_by, reviewed_at, review_note | submitting member owns row; reviewers own status fields | UNIQUE (challenge_id, user_id); URL validity enforced server-side (`new URL()`); end_at gate server-side | anon: none; authenticated: read all, insert/update own (own edits limited to submission_url while status != approved); reviewers: status fields |
| `point_awards` (new) | id, user_id, source_type(challenge_completion/challenge_winner), source_id, points, awarded_by, created_at | written only by `award_challenge_points` RPC | UNIQUE (source_type, source_id, user_id); points > 0 | immutable; member reads own + aggregate; admins read all; ledger IS the audit log |
| `leaderboard_entries` (existing, constrained) | id, user_id, category(enum 4), score, period, updated_at | maintained by award/recompute RPCs only | NEW UNIQUE (user_id, category, period) | public read |

## Interfaces

| Boundary | Request/input | Response/output | Auth/permission | Failure behavior |
| --- | --- | --- | --- | --- |
| `submitChallengeEntry` server action (extends existing `lib/actions/challenges.ts`) | challengeId, submissionUrl | `{success}` \| `{success:false,error}`; now idempotent: updates existing row's URL while status ≠ approved | session-derived user_id only; challenges.end_at must be null/future | login redirect (`?next=/challenges`) when logged out; explicit error strings otherwise |
| `getLeaderboard(p_category?)` query (`lib/supabase/queries.ts`) | category key | top 50 rows joined `profiles(username, full_name, avatar_url, role)` + viewer `{rank,total}` when signed in | public read; viewer block needs session | error surfaced to caller → inline retry UI |
| `getMySubmissionsWithStatus(userId)` (extends `getMyChallengeSubmissions`) | userId | rows + status, review_note, per-challenge approved counts | own rows | empty array on none |
| `reviewSubmission(challengeId, submissionUserId, decision:'approved'\|'rejected', note?)` server action | ids + decision | `{success}`; invokes `award_challenge_points` when approved | session user must hold role ≥ core_team (checked server-side twice: in action and again inside RPC) | no-op + current status returned if already reviewed; permission error string for non-reviewers |
| `award_challenge_points(p_user_id uuid, p_challenge_id uuid, p_source_type text, p_reviewer_id uuid)` RPC | submission identity | creates `point_awards` row + upserts `leaderboard_entries` in one transaction; returns new total | SECURITY DEFINER; executable by authenticated but internally asserts caller is core_team/super_admin; idempotent on (source_type, source_id, user_id) | exception with clear message on replay/idempotent-hit (caught as success-no-op by action), rollback on failure |
| `set_challenge_winner(p_challenge_id uuid, p_winner_id uuid)` RPC (mechanism per open decision D2) | challenge + winner | stamp winner_id + award challenge_winner points if absent | SECURITY DEFINER, core_team/super_admin assert inside | idempotent when winner unchanged; blocks unknown winner_id |
| `recompute_leaderboard_category(p_category text)` RPC | category | rebuilds rows from `point_awards` sum; `pg_advisory_xact_lock` on category hash | SECURITY DEFINER, super_admin-only via internal assert | refuses unknown category |

## Operational rules
- Auditability: `point_awards` (who, why, when, how much) + `reviewed_by/reviewed_at/review_note` fully reconstruct any score.
- Recovery: any suspected drift is repaired by `recompute_leaderboard_category`, never by hand-editing scores.
- Observability: server actions log structured `[actionName]` console errors (house style); Vercel logs remain the surface.
- Service expectations: leaderboard/challenges pages read on request (no ISR change this slice; `/events` ISR pattern untouched).
- Test hygiene: verification uses throwaway accounts/rows; every inserted test row is deleted or clearly marked `TEST:` in title/username per authorized-pentest convention.
