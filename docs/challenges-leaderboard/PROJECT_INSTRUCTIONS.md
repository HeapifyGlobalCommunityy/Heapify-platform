# Challenges & Leaderboard — working instructions

Routing file for any agent or human starting work on this slice. Keep it short. It routes; other documents define.

## Start of a session
1. Read `STATUS.md` — current phase, blockers, last evidence.
2. Read `EXECUTION_PLAN.md` — find your assigned CL-P* item and its dependencies.
3. Read only what the item touches: `REQUIREMENTS.md` (behavior), `SYSTEM_CONTRACTS.md` (interfaces and permissions), `SOLUTION_CONSTRAINTS.md` (rules), `FLOW.md` (runtime behavior per actor).

## Canonical sources
These five files, beside this one, are the single source of truth:
REQUIREMENTS · SYSTEM_CONTRACTS · SOLUTION_CONSTRAINTS · EXECUTION_PLAN · STATUS · plus this file and FLOW.
If code and docs disagree: stop. Verify against the live database. Then fix the code or raise a doc amendment with md. Never pick a side silently.

## Change rules
- Each requirement carries `LOCKED` or `AGENT_DISCRETION`. LOCKED means no change without md's approval. Discretion stays inside its written bounds.
- An undocumented behavior or value: never infer silently. Record an open decision in `STATUS.md`. Take the smallest reversible option only when impact is low. Otherwise stop and ask md.
- Schema changes happen only through numbered migration files, applied to Supabase project `hfdymlfamjyonzasxwvc`.
- Destructive database operations (dedupe preflight, drops) need md's approval before you execute them.

## Git protocol
- Branches: `feat/cl-*`, cut from `develop`. Commits authored as mddragon18.
- Pull requests exist only when md asks for one. md performs every merge. Agents never merge.
- No force-pushes to shared branches without saying so first.

## External actions
Deploys, DNS, third-party services, anything visible outside this repository: stop and ask.

## End of a verified slice
Update `STATUS.md` in the same commit as the work: what changed, verification evidence, next item, blockers, known limits.

## Vocabulary
CL = this Challenges & Leaderboard slice. CL-P0…P6 are phases defined in `EXECUTION_PLAN.md`. Ledger = `point_awards`. Derived store = `leaderboard_entries`. RPC = security-definer function that owns a write path.
