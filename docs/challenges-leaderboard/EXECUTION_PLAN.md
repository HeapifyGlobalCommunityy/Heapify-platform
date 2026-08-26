# Challenges & Leaderboard — execution plan

Canonical artifacts: REQUIREMENTS.md · SYSTEM_CONTRACTS.md · SOLUTION_CONSTRAINTS.md (same directory). Status: STATUS.md. Work tracked in slice branches `feat/cl-*` targeting `develop`. Merges are performed by md only.

## Plan

1. **CL-P0 — Canonical docs committed ✅**
   - Depends on: interrogation rounds settled; Terra independent review reconciled (18/18 findings accepted, incorporated).
   - Verify: docs reviewed by `gpt-5.6-terra` (xhigh) against schema/code ground truth; verdicts + remediation recorded.
   - Done when: doc tree merged to `develop`.

2. **CL-P1 — Migration pack `012_challenges_rls.sql`, `013_points_ledger.sql`**
   - Depends on: CL-P0.
   - Produce:
     - Preflight: detect + dedupe duplicate `(challenge_id, user_id)` submission rows (keep latest) BEFORE unique index creation (F9).
     - FK fixes: `challenges.winner_id`, new `reviewed_by`/`awarded_by` → `ON DELETE SET NULL`; `point_awards.user_id` → CASCADE (F8).
     - Column pack + UNIQUE `(challenge_id, user_id)` on `challenge_submissions`; UNIQUE `(user_id, category, period)` on `leaderboard_entries`.
     - RLS enablement + scoped SELECT policies; blanket `REVOKE` of all DML on all four tables from `anon`/`authenticated`/`service_role`.
     - RPCs: `submit_challenge_entry`, `review_challenge_submission`, `set_challenge_winner`, `recompute_leaderboard_category`, `get_approved_submission_counts` — hardening posture per SYSTEM_CONTRACTS header (F3/F7/F11/F12).
     - TypeScript: literal unions + RPC result interfaces in `lib/types/database.ts` (F17).
     - Applied to remote project `hfdymlfamjyonzasxwvc`.
   - Verify (live): curl REST matrix — anon/authed DML denied on all four tables; member cannot invoke review/winner/recompute; submission RPC cycle (insert→resubmit→closed-gate→immutability-after-approve); fault-injection proving no partial commits (award without stamp / vice versa); replay approve → `{changed:false}`; recompute restores identical sums after seeded perturbation; anon `get_approved_submission_counts` works. Test rows cleaned afterward; evidence in STATUS.md.
   - Done when: matrix recorded + types compile (`npx tsc --noEmit`).

3. **CL-P2 — Query layer + real `/leaderboard`**
   - Depends on: CL-P1.
   - Produce: `getLeaderboard` (+viewer rank block) in `queries.ts`; `/leaderboard/page.tsx` converted to server component fetching via server client; client child handles tabs/retry; tie ranks, highlight, skeleton, empty/error states (R6).
   - Verify: `npx tsc --noEmit`; dev run against remote DB showing numbers matching raw SQL sum cross-check; signed-in/out snapshot difference observed.
   - Done when: page renders exclusively from DB; PR merged to `develop`.

4. **CL-P3 — Submission UX hardening**
   - Depends on: CL-P1; parallel-safe with CL-P2/P5.
   - Produce: `submitChallengeEntry` action rewired to `submit_challenge_entry` (structured-result mapping); status badge + review-note display + resubmit affordance; "N solved" counts via `get_approved_submission_counts` wired into challenge queries; copy replaces multi-submission promise (R7).
   - Verify: scripted UI cycle with throwaway account — submit → resubmit(returns pending) → closed-challenge gate → immutability after admin approval; JS-scheme URL rejected with clean message; tsc clean.
   - Done when: member flows behave per contract; PR merged to `develop`.

5. **CL-P4 — Admin queue + award wiring (integration checkpoint)**
   - Depends on: CL-P1, CL-P2, CL-P3 (consumes their surfaces — explicit dependency chain, F18).
   - Produce: `/admin` pending list + approve/reject(+note)/winner controls; thin `reviewSubmission` server action wrapping the review RPC; noopener enforcement; dashboard widget launch if CL-P5 landed (else its own PR).
   - Verify (live E2E, throwaway pair): member submits → admin approves → member sees approved + points on `/leaderboard` within one reload; reject → note shown → resubmit restores pending; winner-set honors approved-submission precondition; member-role approval refused in UI AND via direct action call; double-review no-op path verified.
   - Done when: money-path demonstrated on deployed preview URL with evidence in STATUS.md; PR merged to `develop`.

6. **CL-P5 — Dashboard score widget**
   - Depends on: CL-P1; parallel-safe otherwise.
   - Produce: `/dashboard` contribution card re-sourced from ledger (R9) + category breakdown + last 5 awards; `/profile` legacy-score cleanup explicitly deferred (STATUS known issue).
   - Verify: values equal SQL cross-check for test account; empty account shows zeros gracefully.
   - Done when: PR merged to `develop`.

7. **CL-P6 — Production gating flip** (explicit gate)
   - Depends on: CL-P4 + md sign-off (R10).
   - Produce: PR flipping the nav/footer visibility predicate for `/challenges` AND adding the previously nonexistent `/leaderboard` navigation entries (exact links presented for approval in the PR description).
   - Verify: production build hides/shows per flag.
   - Done when: PR ready; merged by md after his review.

## Sequencing note
CL-P2/P3/P5 parallel branches after CL-P1 merges; CL-P4 integrates. Follow-ups stay optional (realtime subscriptions, period filters, per-challenge ranking page, public profile routes enabling leaderboard row links, external integrations) — none convert to requirements without a fresh interrogation round.
