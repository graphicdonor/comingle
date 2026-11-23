#!/usr/bin/env node
// Converts the generated splash-screen layers into web-ready WebP files.
//
//   node scripts/process-splash.mjs "<folder with the splash-*.png layers>"
//
// All layers share one 1024×1536 canvas, so they stay aligned when stacked.
// Soft layers (skies, sun glow, rays, mist) are stored smaller because they
// have no fine detail; the near hill with the meditating figure keeps full
// resolution. Hills are snapped to fully opaque so the rising sun can never
// glimmer through them. Output: public/splash/<name>.webp.

import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/process-splash.mjs "<source folder>"');
  process.exit(1);
}
const OUT_DIR = "public/splash";

const LAYERS = [
  { name: "splash-sky-predawn", width: 640, quality: 80 },
  { name: "splash-sky-dawn", width: 640, quality: 80 },
  // Soft glows: full-quality transparency (lower settings band visibly in
  // smooth gradients) but stored small, since blurs enlarge invisibly.
  { name: "splash-rays", width: 384, quality: 80, alphaQuality: 100 },
  { name: "splash-sun", width: 512, quality: 85, alphaQuality: 100 },
  { name: "splash-hills-far", width: 768, quality: 80, solid: true },
  { name: "splash-mist", width: 384, quality: 80, alphaQuality: 100 },
  { name: "splash-hill-near", width: 1024, quality: 84, solid: true },
];

await mkdir(OUT_DIR, { recursive: true });
let total = 0;
for (const layer of LAYERS) {
  let image = sharp(path.join(src, `${layer.name}.png`)).ensureAlpha();
  if (layer.solid) {
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) if (data[i] >= 245) data[i] = 255;
    image = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  }
  const out = path.join(OUT_DIR, `${layer.name}.webp`);
  await image
    .resize({ width: layer.width })
    .webp({ quality: layer.quality, alphaQuality: layer.alphaQuality ?? 90, effort: 6, smartSubsample: true })
    .toFile(out);
  const { size } = await stat(out);
  total += size;
  console.log(`${layer.name.padEnd(20)} ${layer.width}px  ${(size / 1024).toFixed(0)} KB`);
}
console.log(`total ${(total / 1024).toFixed(0)} KB`);
