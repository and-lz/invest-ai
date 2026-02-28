import { describe, it, expect } from "vitest";
import {
  cabecalhosCachePrivado,
  cabecalhosCachePublico,
  cabecalhosSemCache,
} from "@/lib/cache-headers";

describe("cache-headers utilities", () => {
  describe("cabecalhosCachePrivado", () => {
    describe("Given only maxAge is provided", () => {
      it("When called with 60 seconds, Then returns private Cache-Control without stale-while-revalidate", () => {
        const result = cabecalhosCachePrivado(60);

        expect(result).toEqual({
          headers: { "Cache-Control": "private, max-age=60" },
        });
      });

      it("When called with 0 seconds, Then returns private Cache-Control with max-age=0", () => {
        const result = cabecalhosCachePrivado(0);

        expect(result).toEqual({
          headers: { "Cache-Control": "private, max-age=0" },
        });
      });

      it("When called with a large value, Then returns private Cache-Control with that value", () => {
        const result = cabecalhosCachePrivado(86400);

        expect(result).toEqual({
          headers: { "Cache-Control": "private, max-age=86400" },
        });
      });
    });

    describe("Given maxAge and stale-while-revalidate are provided", () => {
      it("When called with 60s maxAge and 300s stale, Then returns both directives", () => {
        const result = cabecalhosCachePrivado(60, 300);

        expect(result).toEqual({
          headers: {
            "Cache-Control":
              "private, max-age=60, stale-while-revalidate=300",
          },
        });
      });

      it("When called with 0s stale-while-revalidate, Then includes stale-while-revalidate=0", () => {
        const result = cabecalhosCachePrivado(120, 0);

        expect(result).toEqual({
          headers: {
            "Cache-Control":
              "private, max-age=120, stale-while-revalidate=0",
          },
        });
      });
    });

    describe("Given stale-while-revalidate is explicitly undefined", () => {
      it("When called with undefined as second argument, Then omits stale-while-revalidate", () => {
        const result = cabecalhosCachePrivado(30, undefined);

        expect(result).toEqual({
          headers: { "Cache-Control": "private, max-age=30" },
        });
      });
    });
  });

  describe("cabecalhosCachePublico", () => {
    describe("Given only maxAge is provided", () => {
      it("When called with 600 seconds, Then returns public Cache-Control without stale-while-revalidate", () => {
        const result = cabecalhosCachePublico(600);

        expect(result).toEqual({
          headers: { "Cache-Control": "public, max-age=600" },
        });
      });

      it("When called with 0 seconds, Then returns public Cache-Control with max-age=0", () => {
        const result = cabecalhosCachePublico(0);

        expect(result).toEqual({
          headers: { "Cache-Control": "public, max-age=0" },
        });
      });
    });

    describe("Given maxAge and stale-while-revalidate are provided", () => {
      it("When called with 300s maxAge and 600s stale, Then returns both directives", () => {
        const result = cabecalhosCachePublico(300, 600);

        expect(result).toEqual({
          headers: {
            "Cache-Control":
              "public, max-age=300, stale-while-revalidate=600",
          },
        });
      });
    });

    describe("Given stale-while-revalidate is explicitly undefined", () => {
      it("When called with undefined as second argument, Then omits stale-while-revalidate", () => {
        const result = cabecalhosCachePublico(60, undefined);

        expect(result).toEqual({
          headers: { "Cache-Control": "public, max-age=60" },
        });
      });
    });
  });

  describe("cabecalhosSemCache", () => {
    describe("Given no-cache headers are requested", () => {
      it("When called, Then returns no-store, no-cache, must-revalidate directives", () => {
        const result = cabecalhosSemCache();

        expect(result).toEqual({
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      });

      it("When called multiple times, Then returns identical results", () => {
        const first = cabecalhosSemCache();
        const second = cabecalhosSemCache();

        expect(first).toEqual(second);
      });
    });
  });

  describe("Return shape", () => {
    it("Given any cache function, When called, Then returns an object with a headers property containing Cache-Control", () => {
      const privado = cabecalhosCachePrivado(60);
      const publico = cabecalhosCachePublico(60);
      const semCache = cabecalhosSemCache();

      for (const result of [privado, publico, semCache]) {
        expect(result).toHaveProperty("headers");
        expect(result.headers).toHaveProperty("Cache-Control");
        expect(typeof result.headers["Cache-Control"]).toBe("string");
      }
    });
  });
});
