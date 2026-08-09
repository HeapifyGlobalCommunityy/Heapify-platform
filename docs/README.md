# Heapify documentation

This directory documents the current codebase rather than an idealized future architecture.

## Start here

- [Architecture](architecture.md) — request flow, application boundaries, and where to find behavior.
- [Development](development.md) — local setup, environment variables, checks, and contributor conventions.
- [Data model](data-model.md) — the Supabase tables, RLS rules, migrations, and schema ownership.
- [Event registration](event-registration.md) — the end-to-end registration flow and its API contract.

## Repository map

| Area | Responsibility |
| --- | --- |
| `app/` | App Router pages, layouts, authentication callbacks, and API route handlers |
| `components/` | Reusable UI and client-side interaction components |
| `lib/` | Supabase clients, query helpers, authorization, validation, and shared content |
| `supabase/` | Baseline SQL schema and incremental migrations |
| `public/` | Static images and other browser-served assets |
| `middleware.ts` | Supabase session refresh at the request boundary |

## Documentation conventions

When behavior changes, update the closest document in the same pull request. Keep examples aligned with the code and call out known limitations instead of presenting scaffolding as production behavior.
