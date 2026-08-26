# Challenges & Leaderboard — solution constraints

## Approved choices

| Area | Decision | Version/configuration | Rationale | Change authority |
| --- | --- | --- | --- | --- |
| Framework patterns | Next.js App Router, React Server Components, Server Actions | as deployed (Next.js 15 line) | repo standard; no client-side auth checks | md |
| DB access | `@supabase/ssr` cookie clients (`lib/supabase/{client,server,admin}.ts`) | existing | house pattern; service-role only via `admin.ts` | md |
| Identity for writes | Always session-derived `user.id`; client-sent identity ignored | enforced in every action | existing security guarantee in `lib/actions/challenges.ts` | locked |
| Authorization model | Role ladder `member < mentor < chapter_admin < core_team < super_admin`; reviewers = `core_team`+ | `user_role` enum + `006_profile_role_security.sql` pattern | mirrors existing role protection | md (D3 confirms) |
| Migration style | Numbered SQL files `012+` in `supabase/migrations/`, revoke-then-grant, `security definer` with `set search_path = public`, `drop policy if exists` first | follows `006` precedent | proven audit-safe style in this repo | md |
| Points math location | Postgres RPCs (security definer), not JS | single place, transactional | race-proof; derivable store consistency | md |
| UI kit | Tailwind + glass tokens + `components/site/ui` primitives (`SectionWrapper`, CTA, Skeleton), Framer Motion sparingly | existing | visual continuity with shipped pages | June (within tokens) |
| Dependency policy | No new npm dependencies this slice | — | package-lock untouched | md |
| Model routing (process) | Planning/independent review: Codex CLI `gpt-5.6-terra` (xhigh); bulk execution: `opencode-go/deepseek-v4-flash` lane; docs/status prose: cheap lane | per budget-routing worked example | Go-plan quotas rationed | md |

## Conventions
- Structure and locations: migrations `supabase/migrations/0NN_*.sql`; queries append to `lib/supabase/queries.ts`; actions extend `lib/actions/`; pages under `app/`; this doc tree `docs/challenges-leaderboard/`.
- Naming: SQL plural table names, snake_case; TS camelCase; status strings lowercase enums as in schema.
- Quality gates: `npx tsc --noEmit` must pass; no unused imports/variables (Vercel ESLint fails builds); every PR gets green build + live E2E evidence before merge.
- Delivery protocol: feature branch per slice → PR authored by mddragon18 → squash merge after checks + live verification.
- Security constraints: no secrets in client components; Turnstile scope unchanged; RLS is the real boundary (server actions are convenience, not enforcement).

## Prohibited or approval-required changes
- Editing `components/ui/dropdown.tsx` isolation fix (documented regression trap in SITE_STRUCTURE §5.4).
- Any schema change outside a numbered migration file (hot-editing the live project).
- Hand-updating `leaderboard_entries.score` values manually instead of recompute RPC.
- Enabling production nav links for the new features without md's explicit sign-off (R10).
- Granting challenge/submission write access to roles below `core_team`.
