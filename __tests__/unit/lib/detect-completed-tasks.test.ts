import { describe, it, expect } from "vitest";
import { detectCompletedTaskIds } from "@/hooks/use-tarefas-ativas";

describe("detectCompletedTaskIds", () => {
  describe("Given previous and current task ID sets", () => {
    it("When a task disappears from the active list, Then it should be detected as completed", () => {
      const previous = new Set(["A", "B"]);
      const current = new Set(["A"]);
      const notified = new Set<string>();

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual(["B"]);
    });

    it("When multiple tasks disappear, Then all should be detected", () => {
      const previous = new Set(["A", "B", "C"]);
      const current = new Set(["A"]);
      const notified = new Set<string>();

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual(expect.arrayContaining(["B", "C"]));
      expect(result).toHaveLength(2);
    });

    it("When a new task appears, Then it should NOT be in completed list", () => {
      const previous = new Set(["A"]);
      const current = new Set(["A", "B"]);
      const notified = new Set<string>();

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual([]);
    });

    it("When no tasks change, Then nothing should be detected", () => {
      const previous = new Set(["A", "B"]);
      const current = new Set(["A", "B"]);
      const notified = new Set<string>();

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual([]);
    });

    it("When all tasks disappear, Then all should be detected", () => {
      const previous = new Set(["A", "B"]);
      const current = new Set<string>();
      const notified = new Set<string>();

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual(expect.arrayContaining(["A", "B"]));
      expect(result).toHaveLength(2);
    });

    it("When both sets are empty, Then nothing should be detected", () => {
      const previous = new Set<string>();
      const current = new Set<string>();
      const notified = new Set<string>();

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual([]);
    });
  });

  describe("Given already-notified task IDs", () => {
    it("When a previously notified task disappears again, Then it should be skipped", () => {
      const previous = new Set(["A", "B"]);
      const current = new Set(["A"]);
      const notified = new Set(["B"]);

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual([]);
    });

    it("When some tasks are notified and others are not, Then only unnotified ones are returned", () => {
      const previous = new Set(["A", "B", "C"]);
      const current = new Set<string>();
      const notified = new Set(["A"]);

      const result = detectCompletedTaskIds(previous, current, notified);

      expect(result).toEqual(expect.arrayContaining(["B", "C"]));
      expect(result).not.toContain("A");
    });
  });
});
