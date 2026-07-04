import { createHash } from "node:crypto";

export function getRequestMetadata(request) {
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
