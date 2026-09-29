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
- **Second independent review** (delegated senior reviewer with full repo inspection): verdict ACCEPTABLE-WITH-CORRECTIONS; 6 findings (2 medium, 4 low). All 6 applied directly to the docs: CL-P0 done-criterion rewritten to on-disk reality, `has_role()` hardened-path recreation added to CL-P1, TS-types scope qualifier, SQL↔TS naming-pair note, `getPendingChallengeSubmissions()` interface added, dead-`contribution_score` column cleanup ticketed below.
- **Artifact-coverage correction** (2026-08-26, found by md auditing the doc tree against the workflow skill's nine artifact types): five-doc set silently omitted four artifacts; the gap was never recorded as an open decision. Remedy applied: `PROJECT_INSTRUCTIONS.md` (session routing) and `FLOW.md` (five actor flows with stop/decision/handoff points) added; `EXPERIENCE_GUIDELINES` excluded by recorded decision (see Decisions); `LESSONS_FILE` intentionally absent until a failure pattern repeats.

## In progress
- None. Holding for Stavan's security review + md's go/no-go on CL-P1.

## Next
- Await md go-ahead → CL-P1 migration pack.

## Decisions and changes
- `EXPERIENCE_GUIDELINES_DOC` excluded from this slice (recorded 2026-08-26, decision by md): UI quality rules live inside R6/R7 acceptance criteria for now. Reversal is cheap — write the file if UI scope grows beyond the current patterns.
- Scoring model: global points (category `contributors`) via approval-gated ledger; per-challenge ranking deferred. Source: md, round 2.
- Reviewers = core_team/super_admin (D3 confirmed).
- Point constants: base 100 / winner bonus 250 (D1 confirmed).
- Winner mechanism: explicit RPC with approved-submission precondition (D2 confirmed + F3 strengthening).
- Merge policy: PRs target `develop`; md merges all PRs personally (set 2026-08-26).

## Blockers and known issues
- Awaiting md's go/no-go for CL-P1.
- Known issue (deferred): `/profile` still displays legacy `profiles.contribution_score` until a later cleanup slice.
- Eventual removal of the dead `contribution_score` column itself ticketed as post-slice cleanup (second review, defect 6).
- Pre-existing TODO (out of scope): decorative Turnstile fix on login/signup (TODO.md).
- Pre-existing security gap being closed BY this project: `challenges`/`challenge_submissions` currently have no RLS in production.

## Verification evidence
- Docs review: Codex Terra xhigh final report (this repo, session log 2026-08-26); findings-by-line citations folded into REQUIREMENTS/SYSTEM_CONTRACTS/EXECUTION_PLAN annotations.
- Live environment: none exercised yet beyond static recon; begins with CL-P1 matrix.
