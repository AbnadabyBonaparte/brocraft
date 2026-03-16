import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@": path.resolve(import.meta.dirname, "client/src"),
    },
  },
  test: {
    environment: "node",
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      "shared/**/*.test.ts",
      "client/src/lib/**/*.test.ts",
      "client/src/shared/**/*.test.ts",
      "client/src/components/**/*.smoke.test.tsx",
      "client/src/components/ui/button.smoke.test.tsx",
    ],
  },
});
