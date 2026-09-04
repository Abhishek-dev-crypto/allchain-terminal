const inFlight =
  new Map<string, Promise<unknown>>();

export function getInFlight<T>(
  key: string
): Promise<T> | null {
  return (
    (inFlight.get(key) as Promise<T>) ||
    null
  );
}

export function setInFlight<T>(
  key: string,
  promise: Promise<T>
) {
  inFlight.set(key, promise);

  promise.finally(() => {
    inFlight.delete(key);
  });
}

export function clearInFlight(
  key: string
) {
  inFlight.delete(key);
}