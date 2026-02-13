declare module "node-qpdf" {
  import type { Readable } from "stream";

  export interface EncryptOptions {
    outputFile?: string;
    password?: string;
    keyLength?: "40" | "128" | "256";
    restrictions?: {
      print?: "full" | "low" | "none";
      modify?: "all" | "annotate" | "form" | "assembly" | "none";
      extract?: "y" | "n";
      useAes?: "y" | "n";
    };
  }

  export function encrypt(inputFile: string, options: EncryptOptions): Promise<{ info: string }>;

  export function decrypt(inputFile: string, password: string): Readable;
}
