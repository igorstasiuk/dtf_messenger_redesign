#!/usr/bin/env node

import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

console.log("🚀 Building DTF Messenger Chrome Extension...");

// Step 1: Clean and build (skip if already built for zip)
const isZipMode = process.argv.includes("--zip");
if (!isZipMode) {
  console.log("📦 Building with Vite...");
  execSync("vue-tsc && vite build", { stdio: "inherit", cwd: rootDir });
} else {
  console.log("📦 Using existing build for zip creation...");
}

// Step 2: Copy icons to dist if they exist
console.log("🎨 Copying icons...");
const iconsDir = resolve(rootDir, "public/icons");
const distIconsDir = resolve(rootDir, "dist/icons");

if (existsSync(iconsDir)) {
  if (!existsSync(distIconsDir)) {
    mkdirSync(distIconsDir, { recursive: true });
  }

  // Copy icon files (SVG and PNG)
  const iconSizes = [16, 32, 48, 128];
  iconSizes.forEach((size) => {
    // Try SVG first, then PNG
    const svgPath = resolve(iconsDir, `icon-${size}.svg`);
    const pngPath = resolve(iconsDir, `icon-${size}.png`);
    const distSvgPath = resolve(distIconsDir, `icon-${size}.svg`);
    const distPngPath = resolve(distIconsDir, `icon-${size}.png`);

    if (existsSync(svgPath)) {
      copyFileSync(svgPath, distSvgPath);
      console.log(`  ✅ Copied icon-${size}.svg`);
    } else if (existsSync(pngPath)) {
      copyFileSync(pngPath, distPngPath);
      console.log(`  ✅ Copied icon-${size}.png`);
    } else {
      console.log(
        `  ⚠️  Icon icon-${size}.svg/png not found, you'll need to add it manually`
      );
    }
  });
} else {
  console.log("  ⚠️  Icons directory not found at public/icons/");
}

// Step 3: Validate manifest.json
console.log("📋 Validating manifest...");
const manifestPath = resolve(rootDir, "dist/manifest.json");
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    // Basic validation
    if (!manifest.manifest_version || manifest.manifest_version !== 3) {
      throw new Error("Invalid manifest_version, should be 3");
    }

    if (!manifest.name || !manifest.version) {
      throw new Error("Missing required fields: name or version");
    }

    console.log(`  ✅ Manifest valid: ${manifest.name} v${manifest.version}`);
  } catch (error) {
    console.error("  ❌ Manifest validation failed:", error.message);
    process.exit(1);
  }
} else {
  console.error("  ❌ Manifest not found in dist/");
  process.exit(1);
}

// Step 4: Check required files
console.log("🔍 Checking required files...");
const requiredFiles = [
  "content.js",
  "background.js",
  "content.css",
  "manifest.json",
];

const missingFiles = [];
requiredFiles.forEach((file) => {
  const filePath = resolve(rootDir, "dist", file);
  if (existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error("\n❌ Build failed: Missing required files");
  process.exit(1);
}

// Step 5: Create zip for Chrome Web Store (optional)
if (process.argv.includes("--zip")) {
  console.log("📦 Creating zip file for Chrome Web Store...");
  try {
    execSync("cd dist && zip -r ../dtf-messenger-extension.zip .", {
      stdio: "inherit",
      cwd: rootDir,
    });
    console.log("  ✅ Created dtf-messenger-extension.zip");
  } catch (error) {
    console.log("  ⚠️  Could not create zip (zip command not available)");
  }
}

// Step 6: Development instructions
console.log("\n🎉 Build completed successfully!");
console.log("\n📖 Next steps:");
console.log("  1. Open Chrome and go to chrome://extensions/");
console.log('  2. Enable "Developer mode"');
console.log('  3. Click "Load unpacked" and select the "dist" folder');
console.log("  4. Visit https://dtf.ru to test the extension");
console.log(
  "\n💡 For production: run with --zip flag to create Chrome Web Store package"
);
