#!/usr/bin/env node

import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

console.log("🎨 Creating placeholder icons for DTF Messenger Extension...");

const iconsDir = resolve(rootDir, "public/icons");
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes required by Chrome Extension
const iconSizes = [16, 32, 48, 128];

// DTF primary color
const primaryColor = "#8000ff";

iconSizes.forEach((size) => {
  console.log(`Creating icon-${size}.png...`);

  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background (transparent)
  ctx.clearRect(0, 0, size, size);

  // Create simple icon design
  // Circle background
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
  ctx.fill();

  // Letter "M" for Messenger
  ctx.fillStyle = "white";
  ctx.font = `bold ${Math.floor(size * 0.6)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("M", size / 2, size / 2);

  // Save as PNG
  const buffer = canvas.toBuffer("image/png");
  const iconPath = resolve(iconsDir, `icon-${size}.png`);
  writeFileSync(iconPath, buffer);

  console.log(`  ✅ Created icon-${size}.png`);
});

console.log("\n🎉 All placeholder icons created!");
console.log("💡 You can replace these with custom DTF-themed icons later");
