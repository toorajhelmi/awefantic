import { sanitizeSourcePath } from "./waitlist.js";

export const LANDING_ANALYTICS_EVENTS = {
  pageView: "page_view",
  waitlistSubmissionSuccess: "waitlist_submission_success",
};

const ALLOWED_EVENTS = new Set(Object.values(LANDING_ANALYTICS_EVENTS));

export async function recordLandingAnalyticsEvent(eventName, options = {}) {
  const normalizedEventName = String(eventName || "").trim();

  if (!ALLOWED_EVENTS.has(normalizedEventName)) {
    return {
      ok: false,
      recorded: false,
      reason: "unsupported_event",
    };
  }

  if (!options.supabase) {
    throw new Error("Supabase client is required to record landing analytics.");
  }

  const metadata = options.metadata || {};
  const row = {
    event_name: normalizedEventName,
    source_path: sanitizeSourcePath(options.sourcePath),
    user_agent_hash: metadata.userAgentHash || null,
    ip_hash: metadata.ipHash || null,
  };

  const { error } = await options.supabase.from("landing_analytics_events").insert(row);

  if (error) {
    throw new Error(`Failed to record landing analytics: ${error.message || error.code}`);
  }

  return {
    ok: true,
    recorded: true,
    eventName: normalizedEventName,
  };
}
