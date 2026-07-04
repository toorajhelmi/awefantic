# Awfantic Analytics and Anti-Spam Guard

## Page-view vs waitlist-submission signal

The landing page records two first-party events in Supabase through server-side
Next.js API routes:

- `page_view` is recorded by `POST /api/analytics/page-view` when the landing
  page loads.
- `waitlist_submission_success` is recorded by `POST /api/waitlist` only after a
  new waitlist row is successfully stored.

Both events are stored in `public.landing_analytics_events` with `source_path`,
hashed IP, hashed user-agent, and `created_at`. No third-party analytics service
or browser-visible Supabase key is added.

Use this query to compare the basic funnel signal:

```sql
select
  event_name,
  count(*) as events
from public.landing_analytics_events
where created_at >= now() - interval '7 days'
group by event_name
order by event_name;
```

## Waitlist rate-limit posture

`POST /api/waitlist` checks recent stored submissions before inserting a new
row. The guard allows up to 5 successful submissions per hashed IP per 1 hour.
If no IP hash is available, it falls back to the hashed user-agent. Requests
over the limit return HTTP `429` with a `Retry-After` header and do not insert a
waitlist row.

This is the strongest feasible guard in the current stack because the MVP has
Next.js API routes and Supabase but no shared Redis/edge-rate-limit provider.
The guard is server-side, uses non-raw request fingerprints, and keeps duplicate
and honeypot behavior unchanged.

Revisit the limit when either trigger is observed:

- legitimate users report being blocked by the 5-per-hour network limit, or
- rejected/bot-like waitlist traffic exceeds 5% of normal successful
  submissions over a week.

If either trigger fires, add a shared rate-limit store or captcha escalation
through a separate scoped task.
