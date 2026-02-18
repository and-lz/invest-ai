import { describe, it, expect } from "vitest";
import { buildExplanationUserPrompt } from "@/lib/prompt-explicacao-conclusao";

describe("buildExplanationUserPrompt", () => {
  it("Given a single conclusion, When building the prompt, Then it should format as a numbered line with type", () => {
    const conclusions = [
      { text: "Sua carteira rendeu 1.50% no mes.", type: "positivo" },
    ];

    const result = buildExplanationUserPrompt(conclusions);

    expect(result).toBe(
      "0. [positivo] Sua carteira rendeu 1.50% no mes.",
    );
  });

  it("Given multiple conclusions, When building the prompt, Then it should produce one numbered line per conclusion", () => {
    const conclusions = [
      { text: "Rendimento acima do CDI.", type: "positivo" },
      { text: "Concentracao em renda fixa.", type: "atencao" },
      { text: "Patrimonio estavel.", type: "neutro" },
    ];

    const result = buildExplanationUserPrompt(conclusions);

    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("0. [positivo] Rendimento acima do CDI.");
    expect(lines[1]).toBe("1. [atencao] Concentracao em renda fixa.");
    expect(lines[2]).toBe("2. [neutro] Patrimonio estavel.");
  });

  it("Given an empty array, When building the prompt, Then it should return an empty string", () => {
    const result = buildExplanationUserPrompt([]);

    expect(result).toBe("");
  });
});
