# Challenges & Leaderboard — execution plan

Canonical artifacts: REQUIREMENTS.md · SYSTEM_CONTRACTS.md · SOLUTION_CONSTRAINTS.md (same directory). Status: STATUS.md. Work tracked in slice branches `feat/cl-*` against `main`.

## Plan

1. **CL-P0 — Canonical docs committed**
   - Depends on: interrogation rounds 1–2 settled by md.
   - Inputs: schema.sql, existing actions/queries, interview decisions.
   - Produce: this doc set on branch `feat/cl-migrations` head (docs land with P1's PR if opened together).
   - Verify: md acknowledges decisions D1–D3 (or accepts provisional 100/250, core_team reviewer set).
   - Done when: docs merged or explicitly approved in chat.

2. **CL-P1 — Migration pack `012_challenges_rls.sql`, `013_points_ledger.sql`**
   - Depends on: CL-P0.
   - Inputs: SYSTEM_CONTRACTS data table; `006` style guide; open decisions D1–D3 (provisional defaults allowed, constants centralized at migration head as `COMMENT`-documented values).
   - Produce: review-lifecycle columns + unique indexes + RLS policies/grants on `challenges`+`challenge_submissions`; `point_awards`; `award_challenge_points`, `set_challenge_winner`, `recompute_leaderboard_category` RPCs; applied to remote project `hfdymlfamjyonzasxwvc`.
   - Verify (live): curl REST matrix — anon insert to either table denied; member cannot update others' rows nor touch status fields; member cannot call `award_challenge_points` successfully; simulated approve → `point_awards` row + `leaderboard_entries` upsert present; replay approve → no second award; `recompute` restores identical sums after a seeded perturbation (then cleaned). All test rows removed afterward.
   - Done when: matrix evidence recorded in STATUS.md and TypeScript types updated (`lib/types`).

3. **CL-P2 — Query layer + real `/leaderboard`**
   - Depends on: CL-P1.
   - Produce: `getLeaderboard` (+viewer rank block), page rewrite with 4 category tabs, top-50 list, own-row highlight/rank footer, skeleton, empty/error states per R6.
   - Verify: `npx tsc --noEmit`; dev run against remote DB showing seeded numbers matching SQL sum query; signed-in vs signed-out snapshot difference observed.
   - Done when: page renders exclusively from DB (zero hardcoded names left) and PR merged green.

4. **CL-P3 — Submission UX hardening**
   - Depends on: CL-P1 (status fields); parallel-safe with CL-P2.
   - Produce: idempotent upsert in `submitChallengeEntry` (end_at gate, edit-while-pending/rejected, approved immutability), status badge + review-note display + resubmit affordance, "N solved" count per card (R7).
   - Verify: scripted UI cycle with throwaway account — submit → resubmit → blocked-after-approve; double-submit dedupes to one row; tsc clean.
   - Done when: member-facing flows behave per contract and PR merged green.

5. **CL-P4 — Admin approval queue + award wiring**
   - Depends on: CL-P1; integrates output surfaces of CL-P2/P3.
   - Produce: `/admin` pending list + approve/reject(+note) controls, `reviewSubmission` server action → `award_challenge_points`; double-review no-op path; winner-set control per D2.
   - Verify (live E2E, throwaway pair of accounts): member submits → admin approves → member sees approved + points on `/leaderboard` + dashboard; reject path shows note + resubmission works; member-role approval attempt refused in UI and via direct action call.
   - Done when: end-to-end money-path ("submit → approve → ranked") demonstrated on the deployed preview/production URL with screenshots/log lines in STATUS.md; PR merged green.

6. **CL-P5 — Dashboard score widget**
   - Depends on: CL-P1 (ledger readable); parallel-safe otherwise.
   - Produce: total, category breakdown, last 5 awards (R9).
   - Verify: values equal SQL cross-check for the test account; empty-account shows zeros gracefully.
   - Done when: PR merged green.

7. **CL-P6 — Production gating flip** (explicit gate)
   - Depends on: CL-P4 + md sign-off (R10).
   - Produce: `NEXT_PUBLIC_STAGE` nav/footer visibility flip PR.
   - Verify: production build hides/shows links per flag.
   - Done when: live site exposes features behind auth exactly per flag.

## Sequencing note
CL-P2/P3/P5 can run as parallel branches after CL-P1 merges; CL-P4 is the integration checkpoint. Follow-ups captured as optional (realtime subscriptions, period filters, per-challenge ranking page, LeetCode-style integrations) — none convert to requirements without a new interrogation round.
