# Challenges & Leaderboard — solution constraints

## Approved choices

| Area | Decision | Version/configuration | Rationale | Change authority |
| --- | --- | --- | --- | --- |
| Framework patterns | Next.js App Router, React Server Components, Server Actions | as deployed (Next.js 15 line) | repo standard; new pages default to server components with isolated client children | md |
| DB access | `@supabase/ssr` cookie clients (`lib/supabase/{client,server,admin}.ts`) | existing | house pattern; service-role only via `admin.ts` | md |
| Identity for writes | Derived inside Postgres from `auth.uid()` in every RPC | SECURITY DEFINER functions | stronger than session-in-JS: immune to client forgery entirely | locked |
| Authorization model | Role ladder `member < mentor < chapter_admin < core_team < super_admin`; RPC asserts `has_role(...)` from migration `006` | `user_role` enum + `006_profile_role_security.sql` helper | mirrors existing role protection | md |
| Migration style | Numbered SQL files `012+` in `supabase/migrations/`, revoke-then-grant, `drop policy if exists` first, definer functions qualified-schema with `set search_path = pg_catalog, public, pg_temp` and default-PUBLIC execute revoked — including recreating the shared `has_role()` helper from `001` onto the hardened path so privileged callers never invoke a weakly-pathed function | supersedes `001`'s bare `search_path = public` precedent (review F7; second-review defect 2) | hardened definer posture from CL-P0 review | md |
| Write-path ownership | Member submission, review+award, winner-set, recompute: ALL through security-definer RPCs; client roles receive NO table DML on the four involved tables | review F1–F4 corrections | atomicity + anti-forgery + self-approval prevention | md |
| Constants | Base completion `100`, winner bonus `250`, isolated at migration head with explanatory `COMMENT`s | D1 decided | cheap central retuning | md |
| UI kit | Tailwind + glass tokens + `components/site/ui` primitives (`SectionWrapper`, CTA, Skeleton), Framer Motion sparingly | existing | visual continuity with shipped pages | June (within tokens) |
| Dependency policy | No new npm dependencies this slice | — | package-lock untouched | md |
| Model routing (process) | Planning/independent review: Codex CLI `gpt-5.6-terra` (xhigh); bulk execution: `opencode-go/deepseek-v4-flash` lane; docs/status prose: cheap lane | per budget-routing worked example | Go-plan quotas rationed | md |

## Conventions
- Structure and locations: migrations `supabase/migrations/0NN_*.sql`; queries append to `lib/supabase/queries.ts`; actions extend `lib/actions/`; pages under `app/`; spec tree `docs/challenges-leaderboard/`.
- Naming: SQL plural table names, snake_case; TS camelCase; SQL functions snake_case paired 1:1 with camelCase TS wrappers/actions (`review_challenge_submission` ↔ `reviewSubmission`); status strings lowercase enums as in schema.
- Quality gates: `npx tsc --noEmit` must pass; no unused imports/variables (Vercel ESLint fails builds); PRs get green build + live E2E evidence before requesting merge.
- Delivery protocol: feature branch per slice → PR authored by mddragon18 targeting `develop` (never main directly) → **md personally merges every PR; June never merges**.
- Security constraints: no secrets in client components; Turnstile scope unchanged; RLS + privilege revocation is the enforcement boundary, server actions are UX wrappers.

## Prohibited or approval-required changes
- Editing `components/ui/dropdown.tsx` isolation fix (documented regression trap in SITE_STRUCTURE §5.4).
- Any schema change outside a numbered migration file (hot-editing the live project).
- Hand-updating `leaderboard_entries.score` values manually instead of recompute RPC.
- Any create/update/delete on challenge definitions, submission statuses, awards, or scores executed with less than `core_team` privileges (members submit exclusively through the granted `submit_challenge_entry` function).
- Rendering submission URLs without `rel="noopener noreferrer"` or accepting non-http(s) schemes.
- Enabling production navigation changes for these features without md's explicit sign-off (R10).
