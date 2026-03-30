import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "electron/dist/**",
      "electron-dist/**",
    ],
  },
  {
    rules: {
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: [
      "__tests__/**",
      "drizzle/**",
      "src/lib/schema.ts",
      "src/components/ui/chart.tsx",
    ],
    rules: {
      "max-lines": "off",
    },
  },
];

export default eslintConfig;
