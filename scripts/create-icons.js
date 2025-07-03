#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

console.log("🎨 Creating SVG icons for DTF Messenger Extension...");

const iconsDir = resolve(rootDir, "public/icons");
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes required by Chrome Extension
const iconSizes = [16, 32, 48, 128];

// DTF primary color
const primaryColor = "#8000ff";

// Create SVG template
function createSVG(size) {
  const fontSize = Math.floor(size * 0.5);
  const letterY = size / 2 + fontSize / 3; // Adjust vertical centering
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="${primaryColor}"/>
  <text x="${size/2}" y="${letterY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">M</text>
</svg>`;
}

iconSizes.forEach((size) => {
  console.log(`Creating icon-${size}.svg...`);
  
  const svgContent = createSVG(size);
  const iconPath = resolve(iconsDir, `icon-${size}.svg`);
  writeFileSync(iconPath, svgContent, 'utf8');
  
  console.log(`  ✅ Created icon-${size}.svg`);
});

// Create favicon
const faviconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15" fill="${primaryColor}"/>
  <text x="16" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">M</text>
</svg>`;

writeFileSync(resolve(iconsDir, "favicon.svg"), faviconSVG, 'utf8');

console.log("\n🎉 All SVG icons created!");
console.log("💡 Chrome Extension will work with SVG icons too");
console.log("🔧 You can convert these to PNG later using online tools if needed");
