#!/usr/bin/env node
// Converts the generated illustration PNGs into web-ready assets.
//
//   node scripts/process-illustrations.mjs "<folder with the source PNGs>"
//
// Frames that animate together (breathing, hand positions, the bow, sitting
// down) are cropped with ONE shared rectangle per group so they stay aligned
// when cross-faded. Output: public/illustrations/<id>.webp plus a manifest
// (src/components/visuals/illustrations.json) with each image's size.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/process-illustrations.mjs "<source folder>"');
  process.exit(1);
}

const OUT_DIR = "public/illustrations";
const MANIFEST = "src/components/visuals/illustrations.json";
const MAX_SIDE = 760;
const MARGIN = 28;

// id -> source file name (without .png)
const GROUPS = {
  seated: ["burmese", "burmese-inhale", "lap-hands", "anjali", "half-lotus", "full-lotus"],
  bow: [["standing-anjali", "standing-anjali-aligned"], "bow-1", "bow-2"],
  sit: ["sit-1", "sit-2", "sit-3"],
  chair: ["chair"],
  bench: ["bench"],
  "scene-place": ["scene-place"],
  "scene-prepare": ["scene-prepare"],
  "scene-reflect": ["scene-reflect"],
  "scene-dedicate": ["scene-dedicate"],
};

// Known artefacts to erase before cropping: a stray 1px line along the
// bottom edge of the standing frame.
const CLEAN = { "standing-anjali": (x, y) => y >= 1244 };

async function loadRaw(file, id) {
  const { data, info } = await sharp(path.join(src, `${file}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const clean = CLEAN[id];
  if (clean) {
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (clean(x, y)) data[(y * info.width + x) * 4 + 3] = 0;
  }
  return { data, info };
}

function bbox({ data, info }) {
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

await mkdir(OUT_DIR, { recursive: true });
const manifest = {};

for (const [group, entries] of Object.entries(GROUPS)) {
  const items = entries.map((e) => (Array.isArray(e) ? { id: e[0], file: e[1] } : { id: e, file: e }));
  const raws = await Promise.all(items.map((it) => loadRaw(it.file, it.id)));

  // Union of all frames' content, plus a margin, clamped to the canvas.
  const boxes = raws.map(bbox);
  const { width: W, height: H } = raws[0].info;
  const left = Math.max(0, Math.min(...boxes.map((b) => b.minX)) - MARGIN);
  const top = Math.max(0, Math.min(...boxes.map((b) => b.minY)) - MARGIN);
  const right = Math.min(W - 1, Math.max(...boxes.map((b) => b.maxX)) + MARGIN);
  const bottom = Math.min(H - 1, Math.max(...boxes.map((b) => b.maxY)) + MARGIN);
  const region = { left, top, width: right - left + 1, height: bottom - top + 1 };
  const scale = MAX_SIDE / Math.max(region.width, region.height);
  const outW = Math.round(region.width * scale);
  const outH = Math.round(region.height * scale);

  for (let i = 0; i < items.length; i++) {
    const { data, info } = raws[i];
    const out = path.join(OUT_DIR, `${items[i].id}.webp`);
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .extract(region)
      .resize(outW, outH)
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(out);
    manifest[items[i].id] = { src: `/illustrations/${items[i].id}.webp`, width: outW, height: outH, group };
    console.log(`${group.padEnd(15)} ${items[i].id.padEnd(18)} ${outW}×${outH}`);
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nWrote ${Object.keys(manifest).length} images and ${MANIFEST}`);
