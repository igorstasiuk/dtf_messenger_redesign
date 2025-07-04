const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "../package.json");
const manifestPath = path.join(__dirname, "../public/manifest.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (manifest.version !== pkg.version) {
  manifest.version = pkg.version;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`manifest.json version updated to ${pkg.version}`);
} else {
  console.log("manifest.json version already matches package.json");
}
