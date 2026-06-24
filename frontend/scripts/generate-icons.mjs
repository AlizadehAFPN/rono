// Single source of truth for the Rono brand mark.
//
// The mark is an "hourglass" rono graph: 5 nodes (four corners + a center
// hub) joined by a top bar, a bottom bar, and two crossing diagonals. Every
// raster icon across every platform (PWA, favicon, Apple touch, iOS AppIcon)
// is rendered from the SAME geometry here so the logo is pixel-consistent.
//
// Run: `node scripts/generate-icons.mjs` (sharp ships with Next, already installed).
//
// The inline/in-app logos (web React <LogoMark>, iOS SwiftUI BrandMark) draw
// the IDENTICAL geometry by hand — keep the node coordinates below in sync if
// you ever retune the mark.

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(__dirname, "..");
const IOS_APPICON = resolve(
  FRONTEND,
  "../ios/Rono/Resources/Assets.xcassets/AppIcon.appiconset",
);

// ── Brand mark geometry, normalised to a 100×100 box ───────────────────────
// Corners inset to 22/78, center hub at 50,50. Mirrored in logo.tsx & BrandMark.
const NODES = [
  [22, 24, 7], // top-left
  [78, 24, 7], // top-right
  [22, 76, 7], // bottom-left
  [78, 76, 7], // bottom-right
  [50, 50, 6.5], // center hub
];
const EDGES = [
  [22, 24, 78, 24], // top bar
  [22, 76, 78, 76], // bottom bar
  [22, 24, 78, 76], // diagonal ╲
  [78, 24, 22, 76], // diagonal ╱
];

const BRAND_TOP = "#2BA6F4";
const BRAND_BOTTOM = "#0A66C2";

/**
 * Build an SVG string.
 * @param {number} size      canvas px
 * @param {number} markFrac  fraction of canvas the 100-unit mark spans
 * @param {object} opts      { radiusFrac, bleed }  radiusFrac:null = square
 */
function iconSVG(size, markFrac, { radiusFrac = 0.2234, color = "#FFFFFF" } = {}) {
  const mark = size * markFrac;
  const offset = (size - mark) / 2;
  const s = (v) => offset + (v / 100) * mark; // map 0..100 → canvas px
  const sw = (9 / 100) * mark; // stroke width tracks the mark
  const lines = EDGES.map(
    ([x1, y1, x2, y2]) =>
      `<line x1="${s(x1)}" y1="${s(y1)}" x2="${s(x2)}" y2="${s(y2)}"/>`,
  ).join("");
  const dots = NODES.map(
    ([cx, cy, r]) =>
      `<circle cx="${s(cx)}" cy="${s(cy)}" r="${(r / 100) * mark}"/>`,
  ).join("");
  const bg =
    radiusFrac == null
      ? `<rect width="${size}" height="${size}" fill="url(#g)"/>`
      : `<rect width="${size}" height="${size}" rx="${size * radiusFrac}" ry="${size * radiusFrac}" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BRAND_TOP}"/>
      <stop offset="1" stop-color="${BRAND_BOTTOM}"/>
    </linearGradient>
  </defs>
  ${bg}
  <g stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="${color}">
    ${lines}${dots}
  </g>
</svg>`;
}

async function png(svg, outPath, size) {
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log("✓", outPath.replace(FRONTEND + "/", ""), `${size}×${size}`);
}

// Minimal single-image .ico wrapper around a PNG payload (Vista+ PNG-in-ICO).
async function ico(svg, outPath, size = 256) {
  const body = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  header.writeUInt8(size >= 256 ? 0 : size, 6); // width (0 == 256)
  header.writeUInt8(size >= 256 ? 0 : size, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // planes
  header.writeUInt16LE(32, 12); // bpp
  header.writeUInt32LE(body.length, 14); // bytes in image
  header.writeUInt32LE(6 + 16, 18); // offset
  writeFileSync(outPath, Buffer.concat([header, body]));
  console.log("✓", outPath.replace(FRONTEND + "/", ""), `ico ${size}`);
}

const p = (rel) => resolve(FRONTEND, rel);

// Rounded app-icon look (PWA "any", favicon, Apple touch render full-bleed below)
const rounded = (size) => iconSVG(size, 0.58, { radiusFrac: 0.2234 });
// Full-bleed square — for maskable + Apple touch + iOS AppIcon (OS masks corners)
const bleed = (size, frac = 0.58) => iconSVG(size, frac, { radiusFrac: null });

await png(rounded(192), p("public/icon-192x192.png"), 192);
await png(rounded(512), p("public/icon-512x512.png"), 512);
// Maskable: keep mark inside the safe zone (smaller), background to the edges.
await png(bleed(512, 0.46), p("public/icon-maskable-512x512.png"), 512);
// Apple touch: full-bleed, iOS rounds it itself.
await png(bleed(180), p("public/apple-touch-icon.png"), 180);
// Favicon (PNG-in-ICO) so /favicon.ico shows the brand mark.
await ico(rounded(256), p("app/favicon.ico"), 256);
// iOS AppIcon — single 1024 universal, full-bleed, opaque.
await png(bleed(1024), resolve(IOS_APPICON, "AppIcon-1024.png"), 1024);

console.log("\nAll icons regenerated from the single brand-mark source.");
