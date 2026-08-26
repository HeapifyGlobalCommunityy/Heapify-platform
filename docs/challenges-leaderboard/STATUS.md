# Challenges & Leaderboard — status

Last updated: 2026-08-26 (planning phase, pre-implementation)

## Completed
- Codebase recon: `challenges`, `challenge_submissions`, `leaderboard_entries` exist; `/challenges` live-reads DB; `/leaderboard` is mock; `leaderboard_entries` unwritten; known RLS gap flagged in code comments.
- Interrogation rounds 1–2 answered by md; all suggestions accepted.
- Canonical docs drafted: REQUIREMENTS / SYSTEM_CONTRACTS / SOLUTION_CONSTRAINTS / EXECUTION_PLAN / STATUS (this file).

## In progress
- CL-P0: independent plan review by Codex (`gpt-5.6-terra`, xhigh reasoning) per budget-routing table. Findings reconcile into the docs before any migration runs.

## Next
- CL-P1 migration pack (`012_challenges_rls.sql`, `013_points_ledger.sql`) after Terra findings are reconciled.

## Decisions and changes
- Scoring model: global points (category `contributors`) via approval-gated ledger; per-challenge ranking deferred. Source: md, round 2.
- Reviewers = core_team/super_admin (D3 confirmed).
- Point constants: base 100 / winner bonus 250 (D1 confirmed).
- Winner mechanism: explicit RPC from admin UI, no hidden triggers (D2 confirmed).

## Blockers and known issues
- Pre-existing TODO (out of scope here): decorative Turnstile fix on login/signup noted in TODO.md.
- `challenges`/`challenge_submissions` currently have NO RLS in production — treat CL-P1 as also closing a flagged security gap (code comments reference "spec section 8, Change 1" from the Aug 2026 pentest review).

## Verification evidence
- None yet beyond static recon; live Supabase checks begin with CL-P1 matrix.
