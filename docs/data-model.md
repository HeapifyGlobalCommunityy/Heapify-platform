# Data model and Supabase rules

## Main domains

| Domain | Tables | User-facing areas |
| --- | --- | --- |
| Identity | `profiles`, `chapters`, `team_members` | profiles, chapters, navigation, admin views |
| Events | `events`, `event_registrations` | event directory, event details, registration, event history |
| Community projects | `projects`, `project_contributors`, `project_maintainers` | open-source project pages and contributor relationships |
| Challenges and recognition | `challenges`, `challenge_submissions`, `badges`, `user_badges`, `leaderboard_entries` | challenges, leaderboard, profile details |
| Opportunities and content | `internships`, `resources`, bookmarks, `announcements`, `site_stats`, `testimonials`, `sponsors` | resources, internships, home page, social content |
| Submissions | `form_submissions` | contact and dynamic forms |

## Important relationships

- `profiles.id` references `auth.users.id`; the new-user trigger creates the public profile row.
- `profiles.chapter_id` points to a user's chapter, while `chapters.lead_id` points back to the chapter lead. Queries involving both relationships need explicit PostgREST relationship hints.
- `event_registrations` belongs to both an `event` and a `profile`, and has a unique `(event_id, user_id)` constraint so one user cannot register twice for the same event.
- Event-specific registration behavior is stored on `events`: `capacity`, `is_hackathon`, `team_config`, and `custom_questions`.
- Project maintainers are represented by the `project_maintainers` join table after migration `001`; older baseline fields may still appear in the historical schema text, so use the migration state as the authority for an already-migrated database.

## Row-level security

Public reads are enabled for profiles, chapters, events, projects, internships, and resources. User-owned writes are constrained by the authenticated user's ID. In particular:

- Registration select/insert/update/delete policies require `auth.uid() = user_id`.
- Profile updates require `auth.uid() = id`; a later trigger prevents users from changing their own role.
- Bookmarks and project participation are user-owned.
- Form submissions can be inserted by the submitting user or anonymously when `submitted_by` is null, and users can read their own submissions.

RLS is the database enforcement layer. Route-level checks improve error messages and UX, but they must not be treated as a replacement for policies.

## Migration workflow

1. Make the SQL change in a new numbered migration.
2. Keep the SQL idempotent where practical (`drop policy if exists`, guarded changes, and explicit names are common in this repository).
3. Update the baseline/schema reference when the repository expects it to mirror the current contract.
4. Test the affected route with both an authenticated and unauthenticated session where applicable.

Do not use the service-role client to hide an RLS design problem in ordinary user flows.
