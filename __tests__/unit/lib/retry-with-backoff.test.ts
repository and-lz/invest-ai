import { describe, it, expect, vi } from "vitest";
import { retryWithBackoff } from "@/lib/retry-with-backoff";
import { AiApiTransientError, AiApiError } from "@/domain/errors/app-errors";

// Use minimal delays to keep tests fast (override module constants via a
// thin wrapper is not worth it — the real delays are 1-10s but tests run
// against real timers so we keep maxAttempts low).

describe("retryWithBackoff", () => {
  describe("Given an operation that succeeds on the first attempt", () => {
    it("should return the result without retrying", async () => {
      // Given
      const operation = vi.fn(() => Promise.resolve("ok"));

      // When
      const result = await retryWithBackoff(operation);

      // Then
      expect(result).toBe("ok");
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe("Given an operation that fails with a transient error then succeeds", () => {
    it("should retry and return the successful result", async () => {
      // Given
      let attempt = 0;
      const operation = vi.fn(async () => {
        attempt++;
        if (attempt === 1) {
          throw new AiApiTransientError("503 service unavailable");
        }
        return "recovered";
      });

      // When
      const result = await retryWithBackoff(operation, { maxAttempts: 2 });

      // Then
      expect(result).toBe("recovered");
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("Given an operation that fails with a non-recoverable error", () => {
    it("should throw immediately without retrying", async () => {
      // Given
      const operation = vi.fn(async () => {
        throw new AiApiError("invalid API key");
      });

      // When / Then
      await expect(retryWithBackoff(operation)).rejects.toThrow("invalid API key");
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe("Given an operation that fails with transient errors on all attempts", () => {
    it("should exhaust max attempts and throw the last error", async () => {
      // Given
      const operation = vi.fn(async () => {
        throw new AiApiTransientError("rate limit exceeded");
      });

      // When / Then
      await expect(
        retryWithBackoff(operation, { maxAttempts: 2 }),
      ).rejects.toThrow("rate limit exceeded");
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("Given an operation that fails twice then succeeds on third attempt", () => {
    it("should retry and eventually return the result", async () => {
      // Given
      let attempt = 0;
      const operation = vi.fn(async () => {
        attempt++;
        if (attempt <= 2) {
          throw new AiApiTransientError("timeout");
        }
        return "finally";
      });

      // When
      const result = await retryWithBackoff(operation, { maxAttempts: 3 });

      // Then
      expect(result).toBe("finally");
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe("Given a non-Error throwable", () => {
    it("should throw it immediately without retrying", async () => {
      // Given
      const operation = vi.fn(async () => {
        throw "string error";
      });

      // When / Then
      await expect(retryWithBackoff(operation)).rejects.toBe("string error");
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe("Given maxAttempts of 1", () => {
    it("should not retry at all", async () => {
      // Given
      const operation = vi.fn(async () => {
        throw new AiApiTransientError("503");
      });

      // When / Then
      await expect(
        retryWithBackoff(operation, { maxAttempts: 1 }),
      ).rejects.toThrow("503");
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});
