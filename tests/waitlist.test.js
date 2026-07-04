import assert from "node:assert/strict";
import test from "node:test";

import {
  RATE_LIMIT_MESSAGE,
  checkWaitlistRateLimit,
  createWaitlistSubmission,
  normalizeEmail,
  validateWaitlistInput,
} from "../src/lib/waitlist.js";

test("normalizes email and validates required fields", () => {
  assert.equal(normalizeEmail("  Founder@Awfantic.COM "), "founder@awfantic.com");

  const invalid = validateWaitlistInput({
    email: "not-an-email",
    qualifyingAnswer: "I need clarity",
  });

  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.email, "Enter a valid email address to join the waitlist.");
});

test("invalid email does not attempt persistence", async () => {
  const supabase = createSupabaseMock({});

  const result = await createWaitlistSubmission(
    {
      email: "not-an-email",
      qualifyingAnswer: "I want to validate onboarding.",
      sourcePath: "/",
    },
    { supabase },
  );

  assert.equal(result.ok, false);
  assert.equal(result.stored, false);
  assert.equal(result.reason, "validation");
  assert.equal(supabase.calls.length, 0);
});

test("valid submission inserts one normalized row in Supabase", async () => {
  const supabase = createSupabaseMock({
    data: { id: "sub_123", email: "founder@example.com", status: "active" },
  });

  const result = await createWaitlistSubmission(
    {
      email: " Founder@Example.com ",
      qualifyingAnswer: "I want to validate a landing page offer.",
      sourcePath: "/?utm=test",
    },
    {
      supabase,
      metadata: {
        ipHash: "ip_hash",
        userAgentHash: "ua_hash",
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.stored, true);
  assert.equal(result.reason, "created");
  assert.equal(supabase.calls.length, 1);
  assert.deepEqual(supabase.calls[0], {
    table: "waitlist_submissions",
    row: {
      email: "founder@example.com",
      qualifying_answer: "I want to validate a landing page offer.",
      source_path: "/?utm=test",
      user_agent_hash: "ua_hash",
      ip_hash: "ip_hash",
      status: "active",
    },
  });
});

test("duplicate email returns non-enumerating success without reporting a new row", async () => {
  const supabase = createSupabaseMock({
    error: { code: "23505", message: "duplicate key value violates unique constraint" },
  });

  const result = await createWaitlistSubmission(
    {
      email: "founder@example.com",
      qualifyingAnswer: "I want to validate onboarding.",
      sourcePath: "/",
    },
    { supabase },
  );

  assert.equal(result.ok, true);
  assert.equal(result.stored, false);
  assert.equal(result.reason, "duplicate");
  assert.equal(supabase.calls.length, 1);
});

test("honeypot submission returns success shape without persistence", async () => {
  const supabase = createSupabaseMock({});

  const result = await createWaitlistSubmission(
    {
      email: "bot@example.com",
      qualifyingAnswer: "spam",
      website: "https://spam.example",
    },
    { supabase },
  );

  assert.equal(result.ok, true);
  assert.equal(result.stored, false);
  assert.equal(result.reason, "honeypot");
  assert.equal(supabase.calls.length, 0);
});

test("waitlist rate limit blocks new storage for saturated request fingerprint", async () => {
  const supabase = createSupabaseMock({ count: 5 });

  const result = await createWaitlistSubmission(
    {
      email: "founder@example.com",
      qualifyingAnswer: "I want to validate onboarding.",
      sourcePath: "/",
    },
    {
      supabase,
      metadata: { ipHash: "ip_hash" },
      now: new Date("2026-07-04T04:37:00.000Z"),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.stored, false);
  assert.equal(result.reason, "rate_limited");
  assert.equal(result.publicMessage, RATE_LIMIT_MESSAGE);
  assert.equal(result.retryAfterSeconds, 3600);
  assert.equal(supabase.calls.length, 0);
  assert.deepEqual(supabase.rateLimitCalls[0], {
    table: "waitlist_submissions",
    column: "ip_hash",
    value: "ip_hash",
    since: "2026-07-04T03:37:00.000Z",
  });
});

test("waitlist rate limit falls back to user-agent hash when IP hash is unavailable", async () => {
  const supabase = createSupabaseMock({ count: 0 });

  const result = await checkWaitlistRateLimit({
    supabase,
    metadata: { userAgentHash: "ua_hash" },
    now: new Date("2026-07-04T04:37:00.000Z"),
  });

  assert.equal(result.limited, false);
  assert.equal(result.keyType, "user_agent_hash");
  assert.deepEqual(supabase.rateLimitCalls[0], {
    table: "waitlist_submissions",
    column: "user_agent_hash",
    value: "ua_hash",
    since: "2026-07-04T03:37:00.000Z",
  });
});

function createSupabaseMock({ data = null, error = null, count = 0, countError = null }) {
  const calls = [];
  const rateLimitCalls = [];

  return {
    calls,
    rateLimitCalls,
    from(table) {
      return {
        select() {
          return {
            eq(column, value) {
              return {
                async gte(_column, since) {
                  rateLimitCalls.push({ table, column, value, since });
                  return { count, error: countError };
                },
              };
            },
          };
        },
        insert(row) {
          calls.push({ table, row });
          return {
            select() {
              return {
                async single() {
                  return { data, error };
                },
              };
            },
          };
        },
      };
    },
  };
}
