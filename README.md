# Heapify Global Community

A community operating system — events (Luma-grade), open-source hub
(GitHub-grade), leaderboard, internships, resources, chapters, and an
admin panel — built on Next.js 15 + Supabase.

## Status

This is an early scaffold:

- ✅ Design system (Tailwind tokens, fonts, dark/light mode, logo mark)
- ✅ App Router structure for every module described in the brief
- ✅ Fully built **Home** page (hero, stats, pillars, journey)
- ✅ Supabase client/server/middleware wiring
- ✅ Full database schema with RLS policies (`supabase/schema.sql`)
- 🚧 All other pages are stubs — structure exists, UI doesn't yet

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project keys
npm run dev
```

## Supabase setup

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy your project URL + anon key into `.env.local`.
4. (Optional) Seed `site_stats`, `team_members`, `sponsors` with real data —
   the homepage stats section is already written to read from this shape.

## Project structure

```
app/                  Routes (one folder per module from the brief)
components/ui/        shadcn-style primitives (Button, etc.)
components/layout/    Navbar, Footer, ThemeProvider, Logo
components/sections/  Homepage building blocks (background, counters)
lib/supabase/         Browser + server Supabase clients
lib/placeholder-content.ts   All placeholder copy/stats — swap for Supabase queries
supabase/schema.sql   Full Postgres schema + RLS
```

## Next steps (suggested build order)

1. Events platform — listing + filters + individual event page + registration
2. Open Source Hub — project directory + project detail page
3. Community Dashboard (auth-gated)
4. Leaderboard + Contributor Profiles
5. Admin Panel (role-gated by `profiles.role`)
6. Remaining content pages (Resources, Chapters, Internships, Social, Sponsor, Team)

## Notes on the design

- Palette: `#FF7A00` orange on near-black `#0A0A0B` / white, used sparingly.
- Type: Space Grotesk (display), Inter (body), JetBrains Mono (stats/labels).
- Signature element: the particle network in the hero is a literal nod to
  the heap data structure the brand is named after.
