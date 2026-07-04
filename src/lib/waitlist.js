export const SUCCESS_MESSAGE =
  "Thanks — you're on the Awfantic waitlist. We'll use your answer to prioritize early access.";

export const INVALID_EMAIL_MESSAGE = "Enter a valid email address to join the waitlist.";

export const RATE_LIMIT_MESSAGE =
  "Too many waitlist requests from this network. Please try again later.";

export const WAITLIST_RATE_LIMIT = {
  maxSubmissions: 5,
  windowMs: 60 * 60 * 1000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_ERROR_CODES = new Set(["23505", "409"]);

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function validateWaitlistInput(input = {}) {
  const email = normalizeEmail(input.email);
  const qualifyingAnswer = String(input.qualifyingAnswer || "").trim();
  const errors = {};

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = INVALID_EMAIL_MESSAGE;
  }

  if (qualifyingAnswer.length < 3) {
    errors.qualifyingAnswer = "Share a short answer so we can qualify the request.";
  }

  if (qualifyingAnswer.length > 500) {
    errors.qualifyingAnswer = "Keep the answer under 500 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      email,
      qualifyingAnswer,
      sourcePath: sanitizeSourcePath(input.sourcePath),
    },
  };
}

export async function createWaitlistSubmission(input, options = {}) {
  const honeypotValue = String(input?.website || "").trim();

  if (honeypotValue) {
    return {
      ok: true,
      stored: false,
      reason: "honeypot",
      publicMessage: SUCCESS_MESSAGE,
    };
  }

  const validation = validateWaitlistInput(input);
  if (!validation.valid) {
    return {
      ok: false,
      stored: false,
      reason: "validation",
      errors: validation.errors,
      publicMessage: validation.errors.email || "Please check the form and try again.",
    };
  }

  if (!options.supabase) {
    throw new Error("Supabase client is required to persist waitlist submissions.");
  }

  const metadata = options.metadata || {};
  const rateLimit = await checkWaitlistRateLimit({
    supabase: options.supabase,
    metadata,
    now: options.now,
    maxSubmissions: options.maxSubmissions,
    windowMs: options.windowMs,
  });

  if (rateLimit.limited) {
    return {
      ok: false,
      stored: false,
      reason: "rate_limited",
      publicMessage: RATE_LIMIT_MESSAGE,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  const row = {
    email: validation.values.email,
    qualifying_answer: validation.values.qualifyingAnswer,
    source_path: validation.values.sourcePath,
    user_agent_hash: metadata.userAgentHash || null,
    ip_hash: metadata.ipHash || null,
    status: "active",
  };

  const { data, error } = await options.supabase
    .from("waitlist_submissions")
    .insert(row)
    .select("id,email,status")
    .single();

  if (error) {
    if (isDuplicateEmailError(error)) {
      return {
        ok: true,
        stored: false,
        reason: "duplicate",
        publicMessage: SUCCESS_MESSAGE,
      };
    }

    throw new Error(`Failed to persist waitlist submission: ${error.message || error.code}`);
  }

  return {
    ok: true,
    stored: true,
    reason: "created",
    id: data?.id,
    publicMessage: SUCCESS_MESSAGE,
  };
}

export async function checkWaitlistRateLimit(options = {}) {
  const limitKey = getRateLimitKey(options.metadata);

  if (!limitKey) {
    return {
      limited: false,
      reason: "missing_request_fingerprint",
    };
  }

  const windowMs = options.windowMs || WAITLIST_RATE_LIMIT.windowMs;
  const maxSubmissions = options.maxSubmissions || WAITLIST_RATE_LIMIT.maxSubmissions;
  const now = options.now instanceof Date ? options.now.getTime() : options.now || Date.now();
  const since = new Date(now - windowMs).toISOString();

  const { count, error } = await options.supabase
    .from("waitlist_submissions")
    .select("id", { count: "exact", head: true })
    .eq(limitKey.column, limitKey.value)
    .gte("created_at", since);

  if (error) {
    throw new Error(`Failed to check waitlist rate limit: ${error.message || error.code}`);
  }

  return {
    limited: Number(count || 0) >= maxSubmissions,
    count: Number(count || 0),
    limit: maxSubmissions,
    keyType: limitKey.type,
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  };
}

export function isDuplicateEmailError(error = {}) {
  const message = String(error.message || "").toLowerCase();
  return DUPLICATE_ERROR_CODES.has(String(error.code || "")) || message.includes("duplicate");
}

export function sanitizeSourcePath(sourcePath) {
  const value = String(sourcePath || "/").trim();

  if (!value.startsWith("/")) {
    return "/";
  }

  return value.slice(0, 256);
}

function getRateLimitKey(metadata = {}) {
  if (metadata.ipHash) {
    return {
      column: "ip_hash",
      value: metadata.ipHash,
      type: "ip_hash",
    };
  }

  if (metadata.userAgentHash) {
    return {
      column: "user_agent_hash",
      value: metadata.userAgentHash,
      type: "user_agent_hash",
    };
  }

  return null;
}
