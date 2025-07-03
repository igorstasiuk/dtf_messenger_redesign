import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "src/**/*.test.*",
        "src/**/*.spec.*",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/components": resolve(__dirname, "src/components"),
      "@/stores": resolve(__dirname, "src/stores"),
      "@/composables": resolve(__dirname, "src/composables"),
      "@/types": resolve(__dirname, "src/types"),
      "@/utils": resolve(__dirname, "src/utils"),
    },
  },
});
