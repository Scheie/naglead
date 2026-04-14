// Fetch with timeout and retry for 3rd party API calls
// Retries on 5xx and network errors only, not 4xx

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BACKOFF_MS = 1000; // 1 second, doubles each retry

interface FetchRetryOptions {
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: FetchRetryOptions = {}
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    backoffMs = DEFAULT_BACKOFF_MS,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Don't retry on 4xx — those are permanent errors
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on 5xx
      if (response.status >= 500 && attempt < maxRetries) {
        lastError = new Error(`HTTP ${response.status}`);
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry if aborted intentionally (not timeout)
      if (lastError.name === "AbortError" && attempt < maxRetries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }

      // Network errors — retry
      if (attempt < maxRetries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Fetch failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
