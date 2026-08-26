# Challenges & Leaderboard — flows

Runtime behavior per actor. Steps marked [STOP] halt the flow with a clear message. [DECISION] marks a judgment point. [HANDOFF] moves responsibility.

Actors:
- **member** — authenticated user with role below core_team
- **reviewer** — core_team or super_admin
- **super_admin** — top role, owns repair tooling
- **system** — Postgres security-definer RPCs (all write authority lives here)
- **visitor** — no session

## Flow 1 — Member submits or resubmits an entry
- Trigger and actor: member presses submit on an active challenge card (`/challenges`).
- Preconditions: valid member session. Challenge exists. Challenge `end_at` is null or future.
1. Card sends `challenge_id` + URL to the `submitChallengeEntry` server action.
2. Action checks the session. No session → redirect to `/login?next=/challenges`. [DECISION]
3. Action calls `submit_challenge_entry`. Identity derives from `auth.uid()` inside Postgres, never from the browser.
4. RPC validates the URL scheme. Not http(s) → error string to the card. [STOP]
5. RPC checks the challenge window. Closed → "submissions closed" error. [STOP]
6. RPC looks up the row for `(challenge_id, user_id)`:
   - No row → INSERT with `status=pending`. [HANDOFF to Flow 2 later]
   - Row pending → overwrite URL and `submitted_at`. Status stays pending.
   - Row rejected → overwrite URL, reset `status=pending`, clear review metadata.
   - Row approved → return `{status:'approved', changed:false}`. Row stays immutable. [STOP]
7. Action maps the JSON result to card copy.
- Success outcome: exactly one row per `(challenge_id, user_id)`; card shows its badge.
- Failure and recovery: a Postgres exception surfaces as the generic retry string. Statements inside the RPC form one transaction, so no partial state exists.
- Data touched: `challenge_submissions`, through the RPC only.

## Flow 2 — Reviewer approves or rejects (approve = award)
- Trigger and actor: reviewer acts on the `/admin` pending queue.
- Preconditions: reviewer session passes `has_role('core_team')`. Target row has `status=pending`.
1. Queue lists pending rows with challenge title and username (`getPendingChallengeSubmissions`; visibility comes from the reviewer SELECT policy).
2. Reviewer opens the proof URL in a new tab (`rel="noopener noreferrer"`) and judges externally. [DECISION]
3. Reviewer selects approve or reject, optional note. `reviewSubmission` action calls `review_challenge_submission(submission_id, decision, note)`.
4. RPC asserts the caller role. Fail → permission error. [STOP]
5. RPC locks the row and re-reads status. Not pending → return `{status:<current>, changed:false}` with zero side effects. Handles double-clicks and stale pages. [STOP]
6. Approve path, one transaction: stamp `reviewed_by=auth.uid()`, `reviewed_at`, note → INSERT `point_awards` (base 100, `challenge_completion`) → upsert `leaderboard_entries` (`contributors`, `all_time`) under the advisory lock. COMMIT covers all three writes.
7. Reject path: stamp reviewer fields, set `status=rejected`. No ledger write ever.
- Success outcome: approved submissions carry their ledger row and board increment; the member sees points on the next `/leaderboard` load.
- Failure and recovery: any step fails → full rollback → row remains pending → reviewer retries. The unique constraint on `(source_type, source_id, user_id)` blocks double awards even under races.
- Data touched: `challenge_submissions`, `point_awards`, `leaderboard_entries`.

## Flow 3 — Reviewer declares a winner
- Trigger and actor: reviewer sets a winner from the admin control.
- Preconditions: proposed winner holds an APPROVED submission on that challenge.
1. Admin control calls `set_challenge_winner(challenge_id, winner_id)`.
2. RPC asserts reviewer role. Asserts the approved-submission precondition. Violations raise clear exceptions. [STOP]
3. Same winner again → `{winner_id, changed:false}`. Idempotent.
4. New winner → stamp `challenges.winner_id` → INSERT the `challenge_winner` award (+250) when absent. One transaction.
- Failure and recovery: no stamp survives without its award. Rollback leaves the old winner intact.
- Data touched: `challenges`, `point_awards`, `leaderboard_entries`.

## Flow 4 — Super admin repairs board drift
- Trigger and actor: totals look wrong; repair runs on demand.
1. Call `recompute_leaderboard_category()` as super_admin, or from the SQL editor as owner (`auth.uid()` is null there).
2. Function accepts only `contributors` / `all_time`. Anything else errors by design, so other partitions survive untouched. [STOP on mismatch]
3. Function takes the category advisory lock, rebuilds rows from `SUM(point_awards)`, replaces the derived store contents, returns `{rebuilt_rows:n}`.
- Recovery guarantee: output always equals ledger sums. Safe to run at any time, repeatedly.
- Data touched: `leaderboard_entries` (rebuild), `point_awards` (read-only).

## Flow 5 — Reads
- Visitor: `/leaderboard` server component renders top-50 per category. Cards show approved counts from `get_approved_submission_counts` (public executable, aggregate only, no identities).
- Member signed in: adds own-rank footer; own submissions and statuses come through own-row RLS.
- Reviewer: sees the whole queue through the wide reviewer SELECT policy.
- Failure and empty states: query error → inline retry card. No data → empty-state copy. The page never goes blank.
