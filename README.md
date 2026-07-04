# Awfantic Landing + Waitlist MVP

This repository contains the Awfantic public landing page and waitlist capture
MVP. It is a small Next.js app intended for Vercel with Supabase-backed lead
storage.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

- `SUPABASE_URL` - Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` - server-only key used by the `/api/waitlist`
  route to insert submissions. Do not expose this value with a
  `NEXT_PUBLIC_` prefix.

## Supabase schema

Apply the migration in `supabase/migrations/20260704040000_create_waitlist_submissions.sql`.
It creates `public.waitlist_submissions`, enables RLS, and adds a unique index
that prevents duplicate active waitlist rows for the same lower-cased email.

## Verification

```bash
npm test
npm run build
```

The unit tests cover:

- email normalization and invalid-email rejection,
- valid Supabase insertion payloads,
- duplicate email handling as non-enumerating success,
- honeypot submissions returning success without persistence,
- server-side waitlist rate-limit blocking,
- first-party landing analytics event recording.

## Analytics and anti-spam

The app records a basic first-party funnel signal in Supabase:

- `page_view` when the landing page loads,
- `waitlist_submission_success` after a new waitlist submission is stored.

`POST /api/waitlist` also enforces a server-side throttle of 5 successful
submissions per hashed IP per hour, falling back to hashed user-agent when an IP
hash is unavailable. See `docs/analytics-and-anti-spam.md` for the Supabase
query, limits, and revisit triggers.
