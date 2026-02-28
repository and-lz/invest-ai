import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/application/use-cases/**",
        "src/domain/**",
        "src/lib/**",
      ],
      exclude: [
        "src/components/ui/**",
        // Domain interfaces — TypeScript-only, no runtime code
        "src/domain/interfaces/**",
        // Infrastructure / external system dependencies
        "src/lib/db.ts",
        "src/lib/schema.ts",
        "src/lib/container.ts",
        "src/lib/env.ts",
        "src/lib/swr-fetcher.ts",
        "src/lib/notifier.ts",
        "src/lib/notification.ts",
        "src/lib/background-task.ts",
        "src/lib/dispatch-task.ts",
        "src/lib/auth-utils.ts",
        "src/lib/asset-analysis-storage.ts",
        "src/lib/artigos-registry.ts",
        // DOM-dependent (requires browser APIs)
        "src/lib/chat-highlight.ts",
        // Prompt templates — string building, no logic to test
        "src/lib/asset-analysis-prompt.ts",
        "src/lib/build-chat-system-prompt.ts",
        "src/lib/manual-extraction-prompt.ts",
        "src/lib/manual-insights-prompt.ts",
        "src/lib/enrich-action-prompt.ts",
        "src/lib/explain-conclusion-prompt.ts",
        // Uses GoogleGenerativeAI constructor — untestable mock issue
        "src/application/use-cases/test-gemini-api-key.ts",
        "src/application/use-cases/check-key-health.ts",
        // Single-line config exports / re-exports — no logic to test
        "src/lib/ai-features.ts",
        "src/lib/utils.ts",
        "src/lib/markdown-config.ts",
        "src/lib/format-currency.ts",
        "src/lib/format-percentage.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
