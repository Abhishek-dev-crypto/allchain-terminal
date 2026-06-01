export const retryRequest = async (
  fn: () => Promise<any>,
  retries = 2,
  delay = 1000
): Promise<any> => {
  try {
    return await fn();
  } catch (err: any) {
    const status = err?.response?.status;

    console.warn("API Error:", status || err.message);

    // ❌ Do NOT retry network/CORS errors aggressively
    const isRetryable =
      status === 429 || status === 500 || status === 502 || status === 503;

    if (retries > 0 && isRetryable) {
      await new Promise((r) => setTimeout(r, delay));
      return retryRequest(fn, retries - 1, delay * 2); // exponential backoff
    }

    // fallback safe return
    return null;
  }
};