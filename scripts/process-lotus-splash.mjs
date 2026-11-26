#!/usr/bin/env node
// Converts the generated lotus splash artwork into web- and app-ready WebP.
//
//   node scripts/process-lotus-splash.mjs "<folder with the splash-*.png files>"
//
// The water is a full background. Every other piece was painted on flat
// magenta (#FF00FF): the magenta is keyed out (with the colour that bled
// into soft edges taken back out), and each piece is cropped to what's
// painted. The lily pads come as one picture and are split into three, so
// each can drift on its own. Output: public/splash/lotus/ (website) and
// native/assets/splash/ (Android app), the same files in both.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/process-lotus-splash.mjs "<source folder>"');
  process.exit(1);
}
const OUT = ["public/splash/lotus", "native/assets/splash"];

/** Cut-outs: the longest side they're stored at. */
const PIECES = [
  { name: "bud", size: 520 },
  { name: "petal-outer", size: 560 },
  { name: "petal-inner", size: 420 },
  { name: "centre", size: 460 },
  { name: "wheel", size: 760 },
];

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Removes the magenta: returns raw RGBA pixels. */
async function key(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = 1 - smooth(0.3, 0.7, (Math.min(r, b) - g) / 255);
    // Take the magenta back out of half-transparent edge pixels.
    const un = (v, m) => (a > 0.02 ? Math.min(255, Math.max(0, (v - (1 - a) * m) / a)) : 0);
    out[j] = a < 1 ? un(r, 255) : r;
    out[j + 1] = g;
    out[j + 2] = a < 1 ? un(b, 255) : b;
    out[j + 3] = Math.round(a * 255);
  }
  return { data: out, width, height };
}

/** Bounding box of pixels with real opacity, within an optional region. */
function bbox({ data, width }, x0, y0, x1, y1) {
  let minX = x1, minY = y1, maxX = x0, maxY = y0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++)
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Separate blobs (the lily pads), found on a coarse grid. */
function blobs(img) {
  const { data, width, height } = img;
  const cell = 8, gw = Math.ceil(width / cell), gh = Math.ceil(height / cell);
  const on = new Uint8Array(gw * gh);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > 128) on[Math.floor(y / cell) * gw + Math.floor(x / cell)] = 1;
  const seen = new Uint8Array(gw * gh);
  const found = [];
  for (let s = 0; s < on.length; s++) {
    if (!on[s] || seen[s]) continue;
    const stack = [s];
    seen[s] = 1;
    let x0 = gw, y0 = gh, x1 = 0, y1 = 0, n = 0;
    while (stack.length) {
      const c = stack.pop();
      const cx = c % gw, cy = Math.floor(c / gw);
      n++;
      x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const k = ny * gw + nx;
        if (on[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
      }
    }
    if (n > 40) found.push({ x0: x0 * cell, y0: y0 * cell, x1: Math.min(width, (x1 + 1) * cell), y1: Math.min(height, (y1 + 1) * cell), n });
  }
  return found.sort((a, b) => b.n - a.n);
}

async function save(name, pipeline) {
  const buf = await pipeline.webp({ quality: 78, alphaQuality: 90, effort: 6 }).toBuffer();
  for (const dir of OUT) await writeFile(path.join(dir, `${name}.webp`), buf);
  console.log(`${name}.webp  ${(buf.length / 1024).toFixed(0)} KB`);
}

const raw = (img) => sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } });

for (const dir of OUT) await mkdir(dir, { recursive: true });

// Water: the full background.
await save("water", sharp(path.join(src, "splash-water.png")).resize(1024, 1536, { fit: "cover" }));

for (const p of PIECES) {
  const img = await key(path.join(src, `splash-${p.name}.png`));
  const box = bbox(img, 0, 0, img.width, img.height);
  const cut = await raw(img).extract(box).png().toBuffer();
  await save(p.name, sharp(cut).resize(p.size, p.size, { fit: "inside" }));
}

const pads = await key(path.join(src, "splash-lilypads.png"));
const found = blobs(pads).slice(0, 3);
for (const [i, b] of found.entries()) {
  const box = bbox(pads, b.x0, b.y0, b.x1, b.y1);
  const cut = await raw(pads).extract(box).png().toBuffer();
  await save(`pad-${i + 1}`, sharp(cut).resize(360, 360, { fit: "inside" }));
}
