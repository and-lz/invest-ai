import { AppError } from "@/domain/errors/app-errors";

const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 10_000;

interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  readonly maxAttempts?: number;
}

/**
 * Retries an async operation with exponential backoff when a recoverable
 * (transient) error is thrown. Non-recoverable errors are thrown immediately.
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  let attempt = 0;

  for (;;) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      const isRecoverable = error instanceof AppError && error.recuperavel;

      if (!isRecoverable || attempt >= maxAttempts) {
        throw error;
      }

      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
      console.warn(
        `[retryWithBackoff] Attempt ${attempt}/${maxAttempts} failed (retrying in ${delay}ms): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
