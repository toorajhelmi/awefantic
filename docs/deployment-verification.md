# Awfantic Deployment Verification

Date: 2026-07-04

## Local verification

- `npm test` passed: 10/10 tests.
- `npm run build` passed with routes:
  - `/`
  - `/api/waitlist`
  - `/api/analytics/page-view`

## Required Vercel environment variable names

Values are intentionally not recorded.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase migrations to apply

- `supabase/migrations/20260704040000_create_waitlist_submissions.sql`
- `supabase/migrations/20260704043700_create_landing_analytics_events.sql`

## Deployment and migration blocker

The Vercel and Supabase Orgenix connector capabilities are installed, but the
runtime rejected this specialist role for both connector namespaces:

- `supabase.list_projects`: `forbidden`, restricted to roles `[chief, master]`.
- `vercel.list_projects`: `forbidden`, restricted to roles `[chief, master]`.

The shell environment also has no Vercel/Supabase deployment credentials or
CLIs available. A chief/master role must run the privileged connector steps to:

1. Apply the Supabase migrations.
2. Confirm the Vercel env var names are present.
3. Deploy the app and bind `awfantic.com` or return a Vercel preview URL.
4. Smoke-test live valid waitlist submission, invalid email, honeypot behavior,
   and `page_view` / `waitlist_submission_success` analytics rows.
