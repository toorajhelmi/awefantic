"use client";

import { useEffect } from "react";

export default function AnalyticsPageView() {
  useEffect(() => {
    const sourcePath = window.location.pathname || "/";

    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourcePath }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
