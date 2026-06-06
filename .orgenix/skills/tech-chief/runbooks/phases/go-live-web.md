# Runbook: Go-Live (Web)

## Purpose

Take a web app live on its own domain, with TLS, monitoring, and a clean smoke from a fresh network. A web feature is not done until it is reachable, secure, and observed healthy (`chief-of-tech-operating-doc.md` §P9).

## When to use

The first time a web app reaches production for any project, and any time a new public domain is added (subdomain, locale-specific TLD, app split).

## Outputs

- A populated `docs/runbooks/go-live-web-<project-slug>.md` recording every step taken.
- DNS records committed (where infra-as-code is used).
- Updated `critical-accounts.md` with the registrar entry.
- A passing post-go-live smoke check.

## Required steps (in order)

1. **Choose the domain.** CoT shortlists 3–5 candidates against the brand brief, checks availability and reasonable cost via the registrar API, and routes the shortlist through CoS. The founder picks.
2. **Register the domain.** Real-time block per §5.2 — founder provides billing or identity through CoS; CoT runs the registrar API. Record in `critical-accounts.md`.
3. **Configure DNS.** Apex, `www`, MX (if email), DKIM/SPF/DMARC (if email sending), verification records for connected services. All records in the IaC source where possible.
4. **TLS / certificate.** Issue and verify via the platform-managed path; ensure auto-renewal. Verify HTTPS works on apex and `www`.
5. **Point the prod deployment at the domain.** Update the platform's domain binding. Verify the prod build resolves correctly from outside the platform.
6. **Canonical host and redirects.** Decide and configure: apex vs. www, redirect rules, locale subpaths if any. Make the choice an ADR.
7. **SEO basics.** Robots, sitemap, canonical tags, Open Graph, favicons, structured data where relevant.
8. **External uptime check.** Configure a synthetic transaction from outside the platform that hits a critical endpoint on the live domain.
9. **Status page.** Provision a public or internal status page linked from the app footer or admin.
10. **Smoke from a clean network and a clean browser.** Sign up, sign in, complete the primary workflow, sign out. Record screenshots in the runbook output.
11. **Add to monitoring.** Sentry/Better Stack DSNs scoped to prod; alerts on error rate, latency, uptime; cost monitoring on the platform.
12. **Announce internally.** Update the next CoS-routed batch summary with the go-live, the URL, and any open follow-ups.

## Anti-patterns

- Configuring DNS by hand without committing the records.
- Skipping the external uptime check ("Vercel monitors it").
- TLS that "looks fine" but is not auto-renewing.
- Smoke from inside the development VPN.
- Pointing prod at the domain before the smoke passes on a preview environment that mirrors prod.
- Marking the go-live closed before adding production alerts.

## Required failure handling

| Failure | Action |
|---|---|
| Domain unavailable / contested | Return to the shortlist; if all are unavailable, report a real-time block for CoS routing. |
| DNS misconfig | Roll back the DNS change; verify resolution with `dig`/`drill` from multiple resolvers; redeploy after fix. |
| TLS issuance failure | Switch to a fallback issuer; force renewal; verify via external monitor. |
| Smoke fails | Block the go-live; treat as an incident (`incident-note.md`). |
| Monitoring incomplete at go-live | Block until alerts are live; a deploy without alerts is not a go-live. |

---

## Review Agent rubric

- Did CoT shortlist domains and the founder pick via CoS before registration?
- Is the registrar entry in `critical-accounts.md` populated?
- Are all DNS records in IaC (or explicitly justified as platform-managed)?
- Is HTTPS live on apex and `www` with auto-renewal verified?
- Is the canonical host decision recorded as an ADR?
- Are SEO basics in place (robots, sitemap, canonical, OG)?
- Is the external uptime check passing?
- Is the status page live?
- Did the smoke pass from a clean network and a clean browser, with evidence in the runbook output?
- Are production alerts active before this is marked closed?
- Was the go-live announced in the next CoS-routed batch summary?
