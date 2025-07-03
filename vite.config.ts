import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import webExtension from "vite-plugin-web-extension";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    webExtension({
      manifest: "public/manifest.json",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/main.ts"),
        background: resolve(__dirname, "src/background/service-worker.ts"),
        popup: resolve(__dirname, "src/popup/index.html"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep service worker as .js for Chrome Extension compatibility
          if (chunkInfo.name === "background") {
            return "background/service-worker.js";
          }
          if (chunkInfo.name === "content") {
            return "content/main.js";
          }
          return "[name].js";
        },
        chunkFileNames: "[name].[hash].js",
        assetFileNames: (assetInfo) => {
          // Handle CSS files
          if (assetInfo.name?.endsWith(".css")) {
            if (assetInfo.name.includes("content")) {
              return "content/styles.css";
            }
            return "assets/[name].[ext]";
          }
          // Handle other assets
          return "assets/[name].[ext]";
        },
      },
    },
    // Target ES2020 for Chrome Extension compatibility
    target: "es2020",
    // Disable minification in development
    minify: process.env.NODE_ENV === "production",
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  // Ensure proper handling of Chrome extension APIs
  esbuild: {
    target: "es2020",
  },
});
