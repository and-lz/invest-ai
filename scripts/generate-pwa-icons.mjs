#!/usr/bin/env node

/**
 * Generate PWA and Electron icons from the Fortuna icon PNG.
 * Uses sharp for PNG resizing.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  try {
    const sharp = (await import("sharp")).default;

    const sourcePath = path.join(__dirname, "..", "public", "fortuna-icon.png");
    const publicDir = path.join(__dirname, "..", "public");
    const electronIconsDir = path.join(__dirname, "..", "electron", "icons");

    if (!fs.existsSync(sourcePath)) {
      console.error("Error: fortuna-icon.png not found in public/");
      process.exit(1);
    }

    const sourceBuffer = fs.readFileSync(sourcePath);

    const targets = [
      { name: "icon-192.png", size: 192, dir: publicDir },
      { name: "icon-512.png", size: 512, dir: publicDir },
      { name: "apple-icon-180.png", size: 180, dir: publicDir },
      { name: "favicon.ico", size: 32, dir: publicDir },
      { name: "icon.png", size: 512, dir: electronIconsDir },
    ];

    console.log("Generating icons from fortuna-icon.png...\n");

    for (const { name, size, dir } of targets) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const outputPath = path.join(dir, name);

      await sharp(sourceBuffer)
        .trim()
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`  ${name} (${size}x${size})`);
    }

    console.log("\nAll icons generated successfully!");
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.error("\nError: 'sharp' package not found.");
      console.error("\nInstall with: npm install --save-dev sharp\n");
      process.exit(1);
    }
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
