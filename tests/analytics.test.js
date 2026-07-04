import assert from "node:assert/strict";
import test from "node:test";

import {
  LANDING_ANALYTICS_EVENTS,
  recordLandingAnalyticsEvent,
} from "../src/lib/analytics.js";

test("records landing page-view analytics event", async () => {
  const supabase = createAnalyticsSupabaseMock({});

  const result = await recordLandingAnalyticsEvent(LANDING_ANALYTICS_EVENTS.pageView, {
    supabase,
    sourcePath: "/",
    metadata: {
      ipHash: "ip_hash",
      userAgentHash: "ua_hash",
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.recorded, true);
  assert.deepEqual(supabase.calls[0], {
    table: "landing_analytics_events",
    row: {
      event_name: "page_view",
      source_path: "/",
      user_agent_hash: "ua_hash",
      ip_hash: "ip_hash",
    },
  });
});

test("records successful waitlist submission analytics event", async () => {
  const supabase = createAnalyticsSupabaseMock({});

  const result = await recordLandingAnalyticsEvent(
    LANDING_ANALYTICS_EVENTS.waitlistSubmissionSuccess,
    {
      supabase,
      sourcePath: "/waitlist",
      metadata: {
        ipHash: "ip_hash",
        userAgentHash: "ua_hash",
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.recorded, true);
  assert.equal(supabase.calls[0].row.event_name, "waitlist_submission_success");
});

test("does not store unsupported analytics events", async () => {
  const supabase = createAnalyticsSupabaseMock({});

  const result = await recordLandingAnalyticsEvent("newsletter_signup", {
    supabase,
    sourcePath: "external",
  });

  assert.equal(result.ok, false);
  assert.equal(result.recorded, false);
  assert.equal(result.reason, "unsupported_event");
  assert.equal(supabase.calls.length, 0);
});

function createAnalyticsSupabaseMock({ error = null }) {
  const calls = [];

  return {
    calls,
    from(table) {
      return {
        async insert(row) {
          calls.push({ table, row });
          return { error };
        },
      };
    },
  };
}
