import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "../../../src/lib/supabase-admin.js";
import {
  LANDING_ANALYTICS_EVENTS,
  recordLandingAnalyticsEvent,
} from "../../../src/lib/analytics.js";
import { getRequestMetadata } from "../../../src/lib/request-metadata.js";
import {
  createWaitlistSubmission,
  SUCCESS_MESSAGE,
} from "../../../src/lib/waitlist.js";

export const runtime = "nodejs";

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Submit the waitlist form as JSON." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const metadata = getRequestMetadata(request);
    const result = await createWaitlistSubmission(payload, {
      supabase,
      metadata,
    });

    if (!result.ok) {
      const status = result.reason === "rate_limited" ? 429 : 400;
      const headers = result.retryAfterSeconds
        ? { "Retry-After": String(result.retryAfterSeconds) }
        : undefined;

      return NextResponse.json(
        { ok: false, message: result.publicMessage, errors: result.errors },
        { status, headers },
      );
    }

    if (result.stored) {
      try {
        await recordLandingAnalyticsEvent(LANDING_ANALYTICS_EVENTS.waitlistSubmissionSuccess, {
          supabase,
          metadata,
          sourcePath: payload?.sourcePath,
        });
      } catch (error) {
        console.error("Failed to record waitlist submission analytics.", error);
      }
    }

    return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        message: "The waitlist is temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }
}
