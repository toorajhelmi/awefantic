export const SUCCESS_MESSAGE =
  "Thanks — you're on the Awfantic waitlist. We'll use your answer to prioritize early access.";

export const INVALID_EMAIL_MESSAGE = "Enter a valid email address to join the waitlist.";

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

export function isDuplicateEmailError(error = {}) {
  const message = String(error.message || "").toLowerCase();
  return DUPLICATE_ERROR_CODES.has(String(error.code || "")) || message.includes("duplicate");
}

function sanitizeSourcePath(sourcePath) {
  const value = String(sourcePath || "/").trim();

  if (!value.startsWith("/")) {
    return "/";
  }

  return value.slice(0, 256);
}
