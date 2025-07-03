#!/usr/bin/env node

import { watch } from "chokidar";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

console.log("🔥 DTF Messenger Extension - Development Mode");
console.log("👀 Watching for changes...");
console.log("🔄 Auto-rebuilding on file changes");
console.log(
  "\n💡 Remember to manually reload the extension in chrome://extensions/ after changes\n"
);

let isBuilding = false;

// Initial build
console.log("🚀 Initial build...");
try {
  execSync("npm run build:dev", { stdio: "inherit", cwd: rootDir });
  console.log("✅ Initial build completed\n");
} catch (error) {
  console.error("❌ Initial build failed");
  process.exit(1);
}

// Watch for changes
const watcher = watch(["src/**/*", "public/**/*"], {
  ignored: ["**/node_modules/**", "**/dist/**"],
  persistent: true,
  cwd: rootDir,
});

watcher.on("change", async (path) => {
  if (isBuilding) return;

  console.log(`📝 Changed: ${path}`);
  isBuilding = true;

  try {
    console.log("🔄 Rebuilding...");
    execSync("npm run build:dev", { stdio: "pipe", cwd: rootDir });
    console.log("✅ Rebuild completed");
    console.log("🔄 Please reload the extension in chrome://extensions/\n");
  } catch (error) {
    console.error("❌ Rebuild failed:");
    console.error(error.stdout?.toString() || error.message);
    console.log("");
  }

  isBuilding = false;
});

watcher.on("error", (error) => {
  console.error("❌ Watcher error:", error);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Stopping development server...");
  watcher.close();
  process.exit(0);
});

console.log(
  "Ready! Make changes to your files and watch them rebuild automatically."
);
