import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "invest-ai-default-key-change-in-prod";
const ALGORITHM = "aes-256-cbc";

/**
 * Encrypts sensitive data (like API keys) before storing in database
 */
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)), iv);
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts data stored in database
 */
export function decryptData(encryptedData: string): string {
  const parts = encryptedData.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Invalid encrypted data format");
  }
  const [iv, encrypted] = parts;
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
    Buffer.from(iv, "hex"),
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}
