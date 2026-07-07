// Generates all required PWA icons as PNG files using only built-in Node.js modules
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// Brand colours
const BG = [139, 26, 107];    // #8B1A6B purple
const FG = [255, 255, 255];   // white

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const crc = uint32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([uint32BE(data.length), t, data, crc]);
}

function makePng(w, h, drawFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk(
    "IHDR",
    Buffer.concat([uint32BE(w), uint32BE(h), Buffer.from([8, 2, 0, 0, 0])])
  );

  const rows = [];
  for (let y = 0; y < h; y++) {
    rows.push(0); // filter: None
    for (let x = 0; x < w; x++) {
      const [r, g, b] = drawFn(x, y, w, h);
      rows.push(r, g, b);
    }
  }

  const idat = chunk("IDAT", zlib.deflateSync(Buffer.from(rows)));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Draw a solid rounded-rect background + a white "C" lettermark
function drawIcon(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const r = w * 0.18; // corner radius factor
  const px = x - cx, py = y - cy;

  // Rounded square background check (simple approximation)
  const hw = w * 0.5 - 2, hh = h * 0.5 - 2;
  const qx = Math.abs(px) - hw + r, qy = Math.abs(py) - hh + r;
  const dist = Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) - r;
  if (dist > 0) return [255, 255, 255]; // outside → white

  // "C" arc lettermark
  const fr = w * 0.28; // outer arc radius
  const ir = w * 0.16; // inner arc radius
  const d = Math.sqrt(px * px + py * py);
  const inRing = d >= ir && d <= fr;

  if (inRing) {
    // Angle: cut out the right-facing opening (roughly 45°–315°)
    const angle = Math.atan2(py, px) * (180 / Math.PI);
    const openStart = -50, openEnd = 50; // degrees of opening
    if (angle >= openStart && angle <= openEnd) return BG; // opening gap
    return FG; // white arc
  }

  return BG; // solid brand purple
}

// Maskable variant: smaller lettermark, more padding
function drawMaskable(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const px = x - cx, py = y - cy;
  const fr = w * 0.20;
  const ir = w * 0.11;
  const d = Math.sqrt(px * px + py * py);
  const inRing = d >= ir && d <= fr;

  if (inRing) {
    const angle = Math.atan2(py, px) * (180 / Math.PI);
    if (angle >= -50 && angle <= 50) return BG;
    return FG;
  }
  return BG;
}

const SIZES = [
  { name: "icon-72.png",   w: 72,  h: 72,  fn: drawIcon },
  { name: "icon-96.png",   w: 96,  h: 96,  fn: drawIcon },
  { name: "icon-128.png",  w: 128, h: 128, fn: drawIcon },
  { name: "icon-144.png",  w: 144, h: 144, fn: drawIcon },
  { name: "icon-152.png",  w: 152, h: 152, fn: drawIcon },
  { name: "icon-180.png",  w: 180, h: 180, fn: drawIcon },
  { name: "icon-192.png",  w: 192, h: 192, fn: drawIcon },
  { name: "icon-384.png",  w: 384, h: 384, fn: drawIcon },
  { name: "icon-512.png",  w: 512, h: 512, fn: drawIcon },
  { name: "icon-maskable-192.png", w: 192, h: 192, fn: drawMaskable },
  { name: "icon-maskable-512.png", w: 512, h: 512, fn: drawMaskable },
];

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const { name, w, h, fn } of SIZES) {
  const buf = makePng(w, h, fn);
  const out = path.join(outDir, name);
  fs.writeFileSync(out, buf);
  console.log(`✓ ${name} (${w}×${h}) — ${buf.length} bytes`);
}

// Also write apple-touch-icon to public root (convention)
fs.copyFileSync(
  path.join(outDir, "icon-180.png"),
  path.join(__dirname, "..", "public", "apple-touch-icon.png")
);
console.log("✓ apple-touch-icon.png");
console.log("\nAll icons generated successfully!");
