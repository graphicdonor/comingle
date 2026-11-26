#!/usr/bin/env node
// Makes every app icon from one square artwork (scripts/data/logo/wepray-icon-source.png):
// the website's favicon, home-screen and maskable icons, and the Android
// launcher icon (adaptive: the art slightly smaller on a soft blur of itself,
// so the halo and lotus stay inside the circle launchers cut out).
//
//   node scripts/make-icons.mjs

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SRC = "scripts/data/logo/wepray-icon-source.png";
const art = (size) => sharp(SRC).resize(size, size, { kernel: "lanczos3" }).png();

/** The art at `scale` of the canvas, centred, its edge fading into a blur of itself. */
async function inset(size, scale) {
  const inner = Math.round(size * scale);
  const pad = Math.round((size - inner) / 2);
  const blurred = await sharp(SRC).resize(size, size).blur(size / 40).png().toBuffer();
  // A soft-edged mask so the sharp art melts into the blurred surround.
  const feather = Math.round(inner * 0.06);
  const mask = Buffer.from(
    `<svg width="${inner}" height="${inner}"><defs><filter id="f"><feGaussianBlur stdDeviation="${feather / 2}"/></filter></defs><rect x="${feather}" y="${feather}" width="${inner - 2 * feather}" height="${inner - 2 * feather}" rx="${feather}" fill="#fff" filter="url(#f)"/></svg>`,
  );
  const sharpArt = await sharp(SRC).resize(inner, inner, { kernel: "lanczos3" }).composite([{ input: await sharp(mask).png().toBuffer(), blend: "dest-in" }]).png().toBuffer();
  return sharp(blurred).composite([{ input: sharpArt, left: pad, top: pad }]).png();
}

await mkdir("public/icons", { recursive: true });

// Website
for (const s of [32, 72, 96, 128, 144, 152, 180, 192, 384, 512]) await art(s).toFile(`public/icons/icon-${s}.png`);
await art(180).toFile("public/apple-touch-icon.png");
// Maskable icons are cut to a circle of 80%: keep the figure and lotus inside it.
for (const s of [192, 512]) await (await inset(s, 0.86)).toFile(`public/icons/icon-maskable-${s}.png`);
// Favicon: the art itself, rounded, inside an SVG (browsers pick the SVG first).
const fav = (await sharp(SRC).resize(64, 64).png().toBuffer()).toString("base64");
await writeFile(
  "public/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64"><clipPath id="r"><rect width="64" height="64" rx="14"/></clipPath><image width="64" height="64" clip-path="url(#r)" href="data:image/png;base64,${fav}" xlink:href="data:image/png;base64,${fav}"/></svg>\n`,
);

// Android app
await art(1024).toFile("native/assets/images/icon.png");
// Adaptive icon: launchers show the middle two-thirds, in a circle or rounded square.
await sharp(SRC).resize(1024, 1024).blur(26).png().toFile("native/assets/images/android-icon-background.png");
// Foreground: the art at 77%, so the halo and lotus sit inside the part
// launchers show; its edge lies outside that part, over the blurred background.
const fg = await sharp(SRC).resize(790, 790, { kernel: "lanczos3" }).png().toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: fg, left: 117, top: 117 }])
  .png()
  .toFile("native/assets/images/android-icon-foreground.png");

console.log("Icons written.");
