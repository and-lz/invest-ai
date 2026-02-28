import { describe, it, expect } from "vitest";
import { valueColor, trendIconColor, badgeColor } from "@/lib/design-system";

describe("design-system semantic color utilities", () => {
  describe("valueColor", () => {
    it("Given a positive value, When called, Then returns text-success", () => {
      expect(valueColor(10)).toBe("text-success");
    });

    it("Given zero, When called, Then returns text-success (non-negative)", () => {
      expect(valueColor(0)).toBe("text-success");
    });

    it("Given a negative value, When called, Then returns text-destructive", () => {
      expect(valueColor(-5)).toBe("text-destructive");
    });

    it("Given null, When called, Then returns empty string", () => {
      expect(valueColor(null)).toBe("");
    });
  });

  describe("trendIconColor", () => {
    it("Given a positive value, When called, Then returns text-success", () => {
      expect(trendIconColor(3.5)).toBe("text-success");
    });

    it("Given zero, When called, Then returns text-success", () => {
      expect(trendIconColor(0)).toBe("text-success");
    });

    it("Given a negative value, When called, Then returns text-destructive", () => {
      expect(trendIconColor(-1)).toBe("text-destructive");
    });

    it("Given null, When called, Then returns text-muted-foreground", () => {
      expect(trendIconColor(null)).toBe("text-muted-foreground");
    });
  });

  describe("badgeColor", () => {
    it("Given 'success', When called, Then returns success badge classes", () => {
      const result = badgeColor("success");

      expect(result).toContain("bg-success/10");
      expect(result).toContain("text-success");
      expect(result).toContain("border-success/30");
    });

    it("Given 'destructive', When called, Then returns destructive badge classes", () => {
      const result = badgeColor("destructive");

      expect(result).toContain("bg-destructive/10");
      expect(result).toContain("text-destructive");
      expect(result).toContain("border-destructive/30");
    });

    it("Given 'warning', When called, Then returns warning badge classes", () => {
      const result = badgeColor("warning");

      expect(result).toContain("bg-warning/10");
      expect(result).toContain("text-warning");
      expect(result).toContain("border-warning/30");
    });
  });
});
