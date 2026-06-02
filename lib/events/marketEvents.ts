export type MarketEvent =
  | "MARKET_REFRESHED"
  | "REGIME_CHANGED"
  | "VOLATILITY_SPIKE"
  | "STREAM_DISCONNECTED";

type Listener = () => void;

const listeners = new Map<
  MarketEvent,
  Listener[]
>();

export function emitMarketEvent(
  event: MarketEvent
) {
  const eventListeners =
    listeners.get(event);

  if (!eventListeners) return;

  eventListeners.forEach((listener) =>
    listener()
  );
}

export function subscribeMarketEvent(
  event: MarketEvent,
  listener: Listener
) {
  const existing = listeners.get(event) || [];

  // ❗ Prevent duplicate registration
  const alreadyExists = existing.includes(listener);
  if (!alreadyExists) {
    listeners.set(event, [...existing, listener]);
  }

  return () => {
    const updated =
      (listeners.get(event) || []).filter(
        (l) => l !== listener
      );

    listeners.set(event, updated);
  };
}