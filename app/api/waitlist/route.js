import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "../../../src/lib/supabase-admin.js";
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
    const result = await createWaitlistSubmission(payload, {
      supabase: getSupabaseAdmin(),
      metadata: getRequestMetadata(request),
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.publicMessage, errors: result.errors },
        { status: 400 },
      );
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

function getRequestMetadata(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "";

  return {
    ipHash: hashValue(ip),
    userAgentHash: hashValue(userAgent || ""),
  };
}

function hashValue(value) {
  if (!value) {
    return null;
  }

  return createHash("sha256").update(value).digest("hex").slice(0, 64);
}
