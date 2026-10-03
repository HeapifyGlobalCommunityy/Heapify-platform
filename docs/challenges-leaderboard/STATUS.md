# Challenges & Leaderboard — status

Last updated: 2026-09-29 (CL-P1 migration pack applied + verified live; next up CL-P2/CL-P3)

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

- **CL-P1 migration pack authored, applied to `hfdymlfmamjyonzasxwvc`, verified live** (2026-09-29):
  - `012_challenges_rls.sql` — hardened `has_role()`; dedupe preflight; lifecycle columns; winner FK SET NULL; unique indexes; RLS + scoped SELECT; client-role DML revoked; `submit_challenge_entry`; `get_approved_submission_counts`.
  - `013_points_ledger.sql` — `point_awards` ledger; RLS + DML revocation; `review_challenge_submission` (atomic); `set_challenge_winner`; `recompute_leaderboard_category`.
  - `014_rpc_execute_hardening.sql` — live-verification fix for Supabase default-privilege EXECUTE grants (see finding below).
  - Full verification matrix under "Verification evidence".

## In progress
- CL-P1 done. Next: CL-P2 (`/leaderboard` server component) and CL-P3 (submission UX + action rewire). CL-P3 must ship before/with the next deploy — direct submission writes are now revoked.

## Next
- CL-P2 query layer + real `/leaderboard`; CL-P3 rewires `submitChallengeEntry` to `submit_challenge_entry` and hardens the card UX.

## Decisions and changes
- `EXPERIENCE_GUIDELINES_DOC` excluded from this slice (recorded 2026-08-26, decision by md): UI quality rules live inside R6/R7 acceptance criteria for now. Reversal is cheap — write the file if UI scope grows beyond the current patterns.
- Scoring model: global points (category `contributors`) via approval-gated ledger; per-challenge ranking deferred. Source: md, round 2.
- Reviewers = core_team/super_admin (D3 confirmed).
- Point constants: base 100 / winner bonus 250 (D1 confirmed).
- Winner mechanism: explicit RPC with approved-submission precondition (D2 confirmed + F3 strengthening).
- Merge policy: PRs target `develop`; md merges all PRs personally (set 2026-08-26).

## Blockers and known issues
- **Interim breakage until CL-P3**: 012 revoked direct table DML, so the current `submitChallengeEntry` server action (direct insert into `challenge_submissions`) now fails on the live project. Reads/rendering are unaffected. CL-P3 must land and deploy to restore submissions.
- `npx tsc --noEmit` is **not clean on `develop`** — pre-existing errors in `app/dashboard/page.tsx` (chapter join typed as an array; `.name` accessed at lines 78/108). Unrelated to CL; fold into CL-P5.
- Throwaway challenge `fcac88c1-a572-4ee8-9023-a4faa390b7ce` (`TEST: CL-P1 open (throwaway)`) left on the project; safe to delete.
- Known issue (deferred): `/profile` still displays legacy `profiles.contribution_score` until a later cleanup slice.
- Eventual removal of the dead `contribution_score` column ticketed as post-slice cleanup (second review, defect 6).
- Pre-existing TODO (out of scope): decorative Turnstile fix on login/signup (TODO.md).
- Pre-existing security gap being closed BY this project: `challenges`/`challenge_submissions` had no RLS in production — now closed by 012.

## Verification evidence
- Docs review: Codex Terra xhigh final report (this repo, session log 2026-08-26); findings-by-line citations folded into REQUIREMENTS/SYSTEM_CONTRACTS/EXECUTION_PLAN annotations.
- Live environment: **CL-P1 REST matrix exercised 2026-09-29** on project `hfdymlfmamjyonzasxwvc` (PostgREST + anon/service keys + one throwaway authenticated user; all test rows removed afterwards):
  - anon SELECT `challenges`/`leaderboard_entries` 200; anon SELECT/INSERT/UPDATE/DELETE on `challenge_submissions`/`point_awards` → `42501`. All four tables deny anon DML.
  - authenticated direct INSERT `challenge_submissions` → `42501`; own-row SELECT returns own row only.
  - `submit_challenge_entry`: first `{pending,changed:true}`; resubmit `{pending,changed:true}`; `javascript:` and non-http(s) rejected; unknown challenge rejected; closed challenge rejected.
  - `review_challenge_submission`: member `Insufficient permissions`; approve → `{approved,changed:true,points_awarded:100}`; repeat approve / later reject → `{changed:false}` no-op; ledger + board +100.
  - `set_challenge_winner`: unapproved winner → error; set self → `{changed:true}` (+250 → board 350); repeat → `{changed:false}`.
  - `recompute_leaderboard_category`: core_team → `Only super_admin`; super_admin → `{rebuilt_rows:1}`, idempotent, board == ledger sum (350).
  - `get_approved_submission_counts`: anon 200 with no body / `{}` / `null`.
  - Cascade check: deleting the test user removed profile, submissions, awards, board rows and set `challenges.winner_id` null.
  - Debugging finding (fixed in 014): Supabase default privileges granted anon EXECUTE on every new public function, so `revoke … from public` in 012/013 was insufficient — anon could reach `recompute_leaderboard_category` (`200 {"rebuilt_rows":0}`). After 014, all four privileged RPCs return `42501` for anon; the public aggregate still works.
  - Note: PostgREST can serve one `PGRST202` on a zero-arg RPC immediately after DDL until its schema cache reloads; transient, not a code issue.
