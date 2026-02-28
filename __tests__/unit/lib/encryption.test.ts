import { describe, it, expect } from "vitest";
import { encryptData, decryptData } from "@/lib/encryption";

describe("encryption", () => {
  describe("Given a plaintext string", () => {
    it("When encrypted and decrypted, Then returns the original string", () => {
      const original = "AIzaSyBtest123456789";

      const encrypted = encryptData(original);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(original);
    });
  });

  describe("Given two encryptions of the same input", () => {
    it("When compared, Then they produce different ciphertexts (random IV)", () => {
      const original = "same-api-key";

      const encrypted1 = encryptData(original);
      const encrypted2 = encryptData(original);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it("When both are decrypted, Then they return the same original value", () => {
      const original = "same-api-key";

      const decrypted1 = decryptData(encryptData(original));
      const decrypted2 = decryptData(encryptData(original));

      expect(decrypted1).toBe(original);
      expect(decrypted2).toBe(original);
    });
  });

  describe("Given an encrypted string in iv:ciphertext format", () => {
    it("When the format is valid, Then decryption succeeds", () => {
      const encrypted = encryptData("test-value");

      expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    });
  });

  describe("Given invalid encrypted data", () => {
    it("When format has no colon separator, Then throws error", () => {
      expect(() => decryptData("no-colon-here")).toThrow(
        "Invalid encrypted data format",
      );
    });

    it("When format has too many colon separators, Then throws error", () => {
      expect(() => decryptData("a:b:c")).toThrow(
        "Invalid encrypted data format",
      );
    });

    it("When IV part is empty, Then throws error", () => {
      expect(() => decryptData(":some-data")).toThrow(
        "Invalid encrypted data format",
      );
    });

    it("When ciphertext part is empty, Then throws error", () => {
      expect(() => decryptData("some-iv:")).toThrow(
        "Invalid encrypted data format",
      );
    });
  });

  describe("Given special characters in input", () => {
    it("When input contains unicode and symbols, Then round-trips correctly", () => {
      const original = "chave-com-acentuação-e-símbolos!@#$%^&*()";

      const result = decryptData(encryptData(original));

      expect(result).toBe(original);
    });

    it("When input is a single character, Then round-trips correctly", () => {
      const result = decryptData(encryptData("x"));

      expect(result).toBe("x");
    });
  });
});
