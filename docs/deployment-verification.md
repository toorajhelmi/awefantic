# Awfantic Deployment Verification

Date: 2026-07-05

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

## Supabase migrations

- `supabase/migrations/20260704040000_create_waitlist_submissions.sql`
- `supabase/migrations/20260704043700_create_landing_analytics_events.sql`

Chief unblock task `4788bf77-884d-4603-9a5b-bb46c7c5521a` recorded that:

- Supabase project `amcznqtqnlaqrfpubfrn` is active and healthy.
- Both migrations above were applied.
- Vercel project `awfantic` / `prj_6pzYSQeIhovACSpW6uo1Pegl77c1` exists.
- Vercel env var names `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
  present for production, preview, and development. Values were not exposed.
- `awfantic.com` is bound/verified on the Vercel project.

## Remaining deployment blocker

The Vercel and Supabase Orgenix connector capabilities are installed, but the
runtime rejected this specialist role for both connector namespaces:

- `supabase.list_projects`: `forbidden`, restricted to roles `[chief, master]`.
- `vercel.list_projects`: `forbidden`, restricted to roles `[chief, master]`.

The shell environment has no Vercel/Supabase deployment credentials available.
A non-interactive Vercel CLI deploy attempt was made with:

```bash
CI=1 npx --yes vercel@latest deploy --prod --yes
```

It could not deploy because no existing Vercel credentials were available and
the CLI started an interactive device-login flow:

```text
No existing credentials found. Starting login flow...
Waiting for authentication...
```

Live URL probes also showed no deployed app yet:

- `https://awfantic.com`: Vercel `DEPLOYMENT_NOT_FOUND`
- `https://www.awfantic.com`: Vercel `DEPLOYMENT_NOT_FOUND`
- `https://awfantic.vercel.app`: Vercel `DEPLOYMENT_NOT_FOUND`

GitHub read-only deployment metadata for branch
`cursor/awfantic-mvp-deployment-verification-d4ad` showed no deployment records
or check runs.

A chief/master role or a runtime with Vercel deployment credentials must deploy
the pushed branch, then live-smoke:

1. Browsable landing page URL.
2. Valid waitlist row in Supabase.
3. Invalid email rejection with no row.
4. Honeypot success-like response with no normal waitlist row.
5. Analytics rows for `page_view` and `waitlist_submission_success`.
