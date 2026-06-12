"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function NotFound() {
  useEffect(() => {
  if (typeof window !== "undefined" && window.gtag) {
    const eventSentKey = "404_event_sent";

    if (!sessionStorage.getItem(eventSentKey)) {
      window.gtag("event", "404_error", {
        page_url: window.location.href,
        page_path: window.location.pathname,
        referrer: document.referrer || "direct",
      });

      sessionStorage.setItem(eventSentKey, "true");
    }
  }

  console.log("404 URL:", window.location.href);
}, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p>Page not found.</p>
      </div>
    </div>
  );
}