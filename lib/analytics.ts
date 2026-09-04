declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  // Never send analytics from development/local environments
  if (
    process.env.NODE_ENV !== "production" ||
    typeof window === "undefined"
  ) {
    return;
  }

  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
};