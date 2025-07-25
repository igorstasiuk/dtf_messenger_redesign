import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "src/popup/index.html",
          dest: "popup",
        },
      ],
    }),
  ], // crx({ manifest }),
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/stores": resolve(__dirname, "src/stores"),
      "@/composables": resolve(__dirname, "src/composables"),
      "@/types": resolve(__dirname, "src/types"),
      "@/utils": resolve(__dirname, "src/utils"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3001,
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
        entryFileNames: (chunk) => {
          return `${chunk.name}.js`;
        },
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          // For Chrome Extension, CSS files should have static names
          if (assetInfo.name?.endsWith(".css")) {
            return `${assetInfo.name}`;
          }
          return "assets/[name].[hash].[ext]";
        },
      },
    },
    sourcemap: process.env.NODE_ENV === "development",
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
