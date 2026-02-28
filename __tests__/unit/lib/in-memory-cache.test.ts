import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CacheEmMemoria, TTL_PADRAO_MS } from "@/lib/in-memory-cache";

describe("CacheEmMemoria", () => {
  let cache: CacheEmMemoria;

  beforeEach(() => {
    cache = new CacheEmMemoria();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Given an empty cache", () => {
    it("When obter is called, Then returns null", () => {
      expect(cache.obter("nonexistent")).toBeNull();
    });
  });

  describe("Given a value was stored", () => {
    it("When obter is called before TTL expires, Then returns the value", () => {
      cache.definir("key-1", { name: "test" });

      const result = cache.obter<{ name: string }>("key-1");

      expect(result).toEqual({ name: "test" });
    });

    it("When obter is called after TTL expires, Then returns null", () => {
      cache.definir("key-1", "value-1", 5000);

      vi.advanceTimersByTime(5001);

      expect(cache.obter("key-1")).toBeNull();
    });

    it("When obter is called just before TTL, Then still returns value", () => {
      cache.definir("key-1", "value-1", 5000);

      vi.advanceTimersByTime(4999);

      expect(cache.obter("key-1")).toBe("value-1");
    });
  });

  describe("Given default TTL", () => {
    it("When no TTL is specified, Then uses 30 minutes default", () => {
      expect(TTL_PADRAO_MS).toBe(30 * 60 * 1000);

      cache.definir("key-1", "value-1");

      vi.advanceTimersByTime(TTL_PADRAO_MS - 1);
      expect(cache.obter("key-1")).toBe("value-1");

      vi.advanceTimersByTime(2);
      expect(cache.obter("key-1")).toBeNull();
    });
  });

  describe("Given a key to invalidate", () => {
    it("When invalidar is called, Then the key is removed", () => {
      cache.definir("key-1", "value-1");

      cache.invalidar("key-1");

      expect(cache.obter("key-1")).toBeNull();
    });

    it("When invalidating a nonexistent key, Then no error is thrown", () => {
      expect(() => cache.invalidar("nonexistent")).not.toThrow();
    });
  });

  describe("Given multiple keys with a common prefix", () => {
    it("When invalidarPorPrefixo is called, Then only matching keys are removed", () => {
      cache.definir("user:1:data", "data-1");
      cache.definir("user:1:settings", "settings-1");
      cache.definir("user:2:data", "data-2");
      cache.definir("global:config", "config");

      cache.invalidarPorPrefixo("user:1:");

      expect(cache.obter("user:1:data")).toBeNull();
      expect(cache.obter("user:1:settings")).toBeNull();
      expect(cache.obter("user:2:data")).toBe("data-2");
      expect(cache.obter("global:config")).toBe("config");
    });
  });

  describe("Given a cache with entries", () => {
    it("When limpar is called, Then all entries are removed", () => {
      cache.definir("a", 1);
      cache.definir("b", 2);
      cache.definir("c", 3);

      cache.limpar();

      expect(cache.obter("a")).toBeNull();
      expect(cache.obter("b")).toBeNull();
      expect(cache.obter("c")).toBeNull();
    });
  });

  describe("Given a key is overwritten", () => {
    it("When definir is called again, Then the new value replaces the old", () => {
      cache.definir("key-1", "old-value");
      cache.definir("key-1", "new-value");

      expect(cache.obter("key-1")).toBe("new-value");
    });
  });
});
