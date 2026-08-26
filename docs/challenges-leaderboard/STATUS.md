# Challenges & Leaderboard — status

Last updated: 2026-08-26 (CL-P0 complete; holding for md go-ahead on CL-P1)

## Completed
- Codebase recon: `challenges`, `challenge_submissions`, `leaderboard_entries` exist; `/challenges` live-reads DB; `/leaderboard` mock; `leaderboard_entries` unwritten; pre-existing RLS gap flagged in code comments.
- Interrogation rounds answered by md; D1–D3 decided (100/250 constants, explicit winner RPC, core_team+ reviewers).
- Canonical docs authored and committed on `feat/cl-migrations` (rebased onto `origin/develop`; .gitignore whitelist for `docs/**/*.md` added alongside develop's roadmap exemption).
- **CL-P0 independent review by Codex `gpt-5.6-terra` @ xhigh (119k tokens)**: verdicts NEEDS-FIXES on REQUIREMENTS/SYSTEM_CONTRACTS/SOLUTION_CONSTRAINTS/EXECUTION_PLAN, SOUND on STATUS; 18 findings (4 critical / 6 high / 8 medium). ALL 18 accepted and reconciled into the docs the same day. Highest-impact outcomes:
  - Write path redesigned: member table privileges → zero; all mutations behind five narrowly-scoped security-definer RPCs (`submit_challenge_entry`, `review_challenge_submission` [atomic review+award], `set_challenge_winner` [approved-submission precondition], `recompute_leaderboard_category` [contributors-only], `get_approved_submission_counts` [anon-safe aggregates]).
  - Securing scope widened to all four tables incl. `point_awards`/`leaderboard_entries`.
  - http(s)-only URL scheme validation (javascript: vector closed), noopener mandatory.
  - Definer hardening: `search_path = pg_catalog, public, pg_temp`, default-PUBLIC execute revoked, schema qualification.
  - Pre-existing duplicate-row preflight before unique indexes; FK delete-behavior fixes (SET NULL/CASCADE).
  - `/leaderboard` becomes server component; no fake profile links; dashboard swaps dead `contribution_score` display for ledger total; R10/P6 gating wording corrected (leaderboard has no nav entry today).

## In progress
- None. **Holding per md instruction: stop after docs, inform before implementation.**

## Next
- Await md go-ahead → CL-P1 migration pack.

## Decisions and changes
- Scoring model: global points (category `contributors`) via approval-gated ledger; per-challenge ranking deferred. Source: md, round 2.
- Reviewers = core_team/super_admin (D3 confirmed).
- Point constants: base 100 / winner bonus 250 (D1 confirmed).
- Winner mechanism: explicit RPC with approved-submission precondition (D2 confirmed + F3 strengthening).
- Merge policy: PRs target `develop`; md merges all PRs personally (set 2026-08-26).

## Blockers and known issues
- Awaiting md's go/no-go for CL-P1.
- Known issue (deferred): `/profile` still displays legacy `profiles.contribution_score` until a later cleanup slice.
- Pre-existing TODO (out of scope): decorative Turnstile fix on login/signup (TODO.md).
- Pre-existing security gap being closed BY this project: `challenges`/`challenge_submissions` currently have no RLS in production.

## Verification evidence
- Docs review: Codex Terra xhigh final report (this repo, session log 2026-08-26); findings-by-line citations folded into REQUIREMENTS/SYSTEM_CONTRACTS/EXECUTION_PLAN annotations.
- Live environment: none exercised yet beyond static recon; begins with CL-P1 matrix.
