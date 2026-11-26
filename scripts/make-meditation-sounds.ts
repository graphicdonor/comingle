// Writes the meditation timer's sounds for the Android app
// (native/assets/sounds), from the same synthesis the website uses
// (src/lib/practice/meditation-sounds.ts), so both sound the same.
//
//   npx tsx scripts/make-meditation-sounds.ts
//
// Encodes 64 kbps mono AAC with macOS's afconvert.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderBell, renderBreath, renderChime, renderEndBell } from "../src/lib/practice/meditation-sounds";

const RATE = 44100;
const OUT = join(__dirname, "..", "native/assets/sounds");

function wav(samples: Float32Array): Buffer {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

const tmp = mkdtempSync(join(tmpdir(), "sounds-"));
for (const [name, render] of [
  ["bell", renderBell],
  ["bell-end", renderEndBell],
  ["chime", renderChime],
  ["breath", renderBreath],
] as const) {
  const w = join(tmp, `${name}.wav`);
  writeFileSync(w, wav(render(RATE)));
  const out = join(OUT, `${name}.m4a`);
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "64000", w, out]);
  console.log(`${name}.m4a  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}
rmSync(tmp, { recursive: true });
