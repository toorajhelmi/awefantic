import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "../../../../src/lib/supabase-admin.js";
import {
  LANDING_ANALYTICS_EVENTS,
  recordLandingAnalyticsEvent,
} from "../../../../src/lib/analytics.js";
import { getRequestMetadata } from "../../../../src/lib/request-metadata.js";

export const runtime = "nodejs";

export async function POST(request) {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  try {
    await recordLandingAnalyticsEvent(LANDING_ANALYTICS_EVENTS.pageView, {
      supabase: getSupabaseAdmin(),
      metadata: getRequestMetadata(request),
      sourcePath: payload.sourcePath,
    });
  } catch (error) {
    console.error("Failed to record page-view analytics.", error);
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
