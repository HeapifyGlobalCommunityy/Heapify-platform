# Event registration flow

## User journey

1. `app/events/[slug]/page.tsx` loads the event and current seat count. The page is revalidated every 60 seconds.
2. `EventDetailClient` checks the browser session when the user opens registration. If no user exists, it redirects to `/login?redirectTo=/events/[slug]?register=true`.
3. After authentication, `?register=true` reopens the registration panel. Desktop uses a transform-based slide; mobile stacks the summary and form.
4. `RegistrationForm` submits to `POST /api/events/[slug]/register`.
5. The route authenticates the request again, normalizes the request body, validates event status, team rules, custom questions, and capacity, then inserts the registration under RLS.

## Request compatibility

The route accepts the current snake_case shape:

```json
{
  "full_name": "Ada Lovelace",
  "email": "ada@example.com",
  "github_url": "https://github.com/ada",
  "linkedin_url": "https://linkedin.com/in/ada",
  "team_name": "Analytical Engines",
  "team_members": [
    { "full_name": "Grace Hopper", "email": "grace@example.com", "github_url": "https://github.com/grace" }
  ],
  "answers": { "tech_stack": "TypeScript" }
}
```

It also normalizes the phase-zero camelCase aliases `fullName`, `github`, `linkedin`, `teamName`, and `teammates`, including teammate fields `name` and `github`. Keep this adapter until all callers use one agreed contract.

## Validation and statuses

- Missing `full_name` or `email` returns `400`.
- Missing or invalid event returns `404`.
- Cancelled or ended events return `409`.
- Invalid team configuration, team size, required answers, choice values, or number answers returns `400`.
- Capacity counts only `registered` and `attended` rows. A full event creates a `waitlisted` registration instead of rejecting it.
- A duplicate `(event_id, user_id)` returns `409` with a user-safe message.
- Successful inserts return `201` and include the resulting registration and status.

## Configuration shape

`events.team_config` accepts the database-oriented shape `{ solo_allowed, team_min, team_max }` and the UI-oriented aliases `{ allowSolo, minSize, maxSize }`. `events.custom_questions` is an array of objects with `id`, `label`, `type`, `required`, and optional `options`.

Supported question types are `short_text`, `long_text`, `single_choice`, `multiple_choice`, and `number`. Required values are checked before type-specific coercion; choice answers are checked against the configured options.

## Change checklist

When changing registration behavior, check all of these together:

- `components/registration/RegistrationForm.tsx` and its child sections
- `app/api/events/[slug]/register/route.ts`
- `app/events/[slug]/page.tsx` and `components/events/EventDetailClient.tsx`
- `supabase/schema.sql` plus the relevant migration
- `lib/types/database.ts` if database types or returned fields change

The API route and RLS policy are the security boundary; client validation is only a convenience for the user.
