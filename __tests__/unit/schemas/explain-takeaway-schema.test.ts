import { describe, it, expect } from "vitest";
import { ExplainTakeawayRequestSchema } from "@/schemas/explain-takeaway.schema";

describe("ExplainTakeawayRequestSchema", () => {
  it("Given a valid request with conclusions, When parsing, Then it should succeed", () => {
    const input = {
      conclusions: [
        { text: "Rendimento acima do CDI.", type: "positivo" },
        { text: "Concentracao alta.", type: "atencao" },
      ],
    };

    const result = ExplainTakeawayRequestSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("Given all three conclusion types, When parsing, Then it should accept all of them", () => {
    const input = {
      conclusions: [
        { text: "Positivo.", type: "positivo" },
        { text: "Neutro.", type: "neutro" },
        { text: "Atencao.", type: "atencao" },
      ],
    };

    const result = ExplainTakeawayRequestSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("Given an empty conclusions array, When parsing, Then it should fail", () => {
    const input = { conclusions: [] };

    const result = ExplainTakeawayRequestSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("Given a conclusion with invalid type, When parsing, Then it should fail", () => {
    const input = {
      conclusions: [{ text: "Some text", type: "invalid" }],
    };

    const result = ExplainTakeawayRequestSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("Given more than 10 conclusions, When parsing, Then it should fail", () => {
    const conclusions = Array.from({ length: 11 }, (_, i) => ({
      text: `Conclusion ${i}`,
      type: "neutro" as const,
    }));

    const result = ExplainTakeawayRequestSchema.safeParse({ conclusions });

    expect(result.success).toBe(false);
  });

  it("Given a conclusion with empty text, When parsing, Then it should fail", () => {
    const input = {
      conclusions: [{ text: "", type: "positivo" }],
    };

    const result = ExplainTakeawayRequestSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("Given a request without conclusions field, When parsing, Then it should fail", () => {
    const input = {};

    const result = ExplainTakeawayRequestSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
