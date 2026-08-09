# Local development

## Prerequisites

- Node.js compatible with the versions supported by Next.js 15.
- An npm installation.
- A Supabase project for database and authentication.
- A Cloudflare Turnstile site and secret key if testing protected auth flows.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` after the development server starts.

## Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser and server clients | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser and server clients | Safe for RLS-bound clients; still do not treat it as an admin key |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` | Secret; bypasses RLS and must remain server-only |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | CAPTCHA widget | Public widget key |
| `TURNSTILE_SECRET_KEY` | `lib/captcha/verify.ts` | Secret used for Siteverify |
| `NEXT_PUBLIC_STAGE` | feature visibility | Set to `production` to hide the scaffolded feature links described in the root README |

If Supabase variables are missing, the clients return `null` and parts of the application render without data. That is useful for limited UI work, but it is not a substitute for a configured integration environment.

## Database setup

For a fresh project, run `supabase/schema.sql`, then apply the numbered files in `supabase/migrations/` in order. Configure these Supabase Auth redirect URLs for local development:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`

The migrations contain the incremental contract for registration fields, RLS tightening, profile role protection, project maintainers, and storage policies. Review the migration history before editing the baseline schema; the baseline and later migrations must remain understandable together.

## Verification

Run the checks relevant to the change:

```bash
npm run lint
npm run build
```

For a focused change, lint the touched files first if the repository has unrelated existing warnings. Before opening a PR, run the full checks and report any environment-only failures explicitly.

## Working conventions

- Keep server-only imports and secrets out of Client Components.
- Prefer query helpers for repeated server reads.
- Preserve compatibility at API boundaries when payload names differ between callers; the registration route currently accepts both camelCase and snake_case variants.
- Use `null` for an unused `teamConfig` and `[]` for no `customQuestions`; the registration UI relies on those safe defaults.
- When changing Supabase behavior, update the relevant migration and the checked-in schema documentation in the same change.
