# Awfantic Deployment Notes

## Target

- Hosting: Vercel.
- Domain: `awfantic.com` once the Vercel project is connected.
- Database: Supabase Postgres via the server-side `/api/waitlist` route.
- Analytics: first-party Supabase events via `/api/analytics/page-view` and
  successful `/api/waitlist` submissions.

## Required Vercel environment variables

Set these for Production, Preview, and Development environments before enabling
the waitlist form:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key must remain server-only. The app does not require
Supabase Auth, payment credentials, email-provider credentials, a mobile app
configuration, or any new analytics/service account for this MVP.

## Supabase migration

Run the SQL migration at:

`supabase/migrations/20260704040000_create_waitlist_submissions.sql`

The migration:

1. Creates `public.waitlist_submissions`.
2. Stores email, one qualifying answer, source path, hashed IP/user-agent
   metadata, status, and creation time.
3. Enforces one active waitlist row per lower-cased email.
4. Enables RLS so browser clients cannot read or write rows directly.

Also run:

`supabase/migrations/20260704043700_create_landing_analytics_events.sql`

This migration creates `public.landing_analytics_events` for the basic
`page_view` vs `waitlist_submission_success` signal documented in
`docs/analytics-and-anti-spam.md`.

## Expected behavior

- Valid submissions insert one active row.
- Invalid email submissions return user-visible correction and do not insert.
- Honeypot-filled submissions receive the same success copy as valid requests
  but do not insert a normal waitlist row.
- Duplicate email submissions receive success copy and rely on the unique index
  to avoid duplicate active rows.
- Waitlist submissions are rate-limited server-side to 5 successful
  submissions per hashed IP per hour, with hashed user-agent as the fallback
  fingerprint when an IP hash is unavailable.
- If required Supabase env vars are missing, the API returns a temporary
  unavailable response instead of accepting data that cannot be persisted.

## Deployment command

After env vars and domain binding are configured in Vercel:

```bash
npm run build
vercel deploy --prod --yes
```
