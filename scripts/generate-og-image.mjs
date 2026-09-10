/**
 * Generates public/og-image.png — a brand default Open Graph image (1200x630).
 * Pure-Node implementation (zlib + manual PNG chunk encoding), no dependencies.
 * Run: node scripts/generate-og-image.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

// Brand palette (matches favicon gradient used in the app).
const TOP = [33, 75, 77]; // #214b4d
const BOTTOM = [168, 95, 62]; // #a85f3e
const ACCENT = [199, 155, 75]; // #c79b4b
const TEXT_GLOW = [255, 224, 196];

// ---------- CRC32 ----------
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// ---------- Pixel helpers ----------
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
const BLEND_BANDS = [
  { offset: 0.0, color: hexToRgb("#191512") },
  { offset: 0.42, color: hexToRgb("#214b4d") },
  { offset: 0.78, color: hexToRgb("#8c4b2f") },
  { offset: 1.0, color: hexToRgb("#a85f3e") },
];
function bandColor(t) {
  for (let i = 0; i < BLEND_BANDS.length - 1; i++) {
    const a = BLEND_BANDS[i];
    const b = BLEND_BANDS[i + 1];
    if (t >= a.offset && t <= b.offset) {
      const k = (t - a.offset) / (b.offset - a.offset);
      return [lerp(a.color[0], b.color[0], k), lerp(a.color[1], b.color[1], k), lerp(a.color[2], b.color[2], k)];
    }
  }
  return BLEND_BANDS[BLEND_BANDS.length - 1].color;
}

// Sun / glow: soft radial highlight in the upper-right (behind the book).
function sunStrength(x, y) {
  const cx = WIDTH * 0.78;
  const cy = HEIGHT * 0.3;
  const dx = (x - cx) / (WIDTH * 0.55);
  const dy = (y - cy) / (HEIGHT * 0.55);
  const d = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, 1 - d);
}

// Decorative book glyph (rounded rectangle corners + spine), centered lower-left.
function bookMask(x, y) {
  const bw = WIDTH * 0.3;
  const bh = HEIGHT * 0.42;
  const bx = WIDTH * 0.22 - bw / 2;
  const by = HEIGHT * 0.58 - bh / 2;
  const r = 28;
  const dx = Math.min(Math.max(x - bx, 0), bw);
  const dy = Math.min(Math.max(y - by, 0), bh);
  const dist = Math.sqrt((x - bx - dx) ** 2 + (y - by - dy) ** 2);
  return dist <= r ? 1 : 0;
}

function spineStrength(x, y, mask) {
  if (!mask) return 0;
  const bw = WIDTH * 0.3;
  const bx = WIDTH * 0.22 - bw / 2 + 40;
  return Math.max(0, 1 - Math.abs(x - bx) / 22) * 0.55 * mask;
}

const rows = [];
for (let y = 0; y < HEIGHT; y++) {
  const row = Buffer.alloc(1 + WIDTH * 3);
  const t = y / (HEIGHT - 1);
  const base = bandColor(t);
  for (let x = 0; x < WIDTH; x++) {
    let r = base[0];
    let g = base[1];
    let b = base[2];
    const sun = sunStrength(x, y);
    if (sun > 0) {
      r = lerp(r, ACCENT[0], sun * 0.28);
      g = lerp(g, ACCENT[1], sun * 0.28);
      b = lerp(b, ACCENT[2], sun * 0.28);
    }
    const mask = bookMask(x, y);
    if (mask) {
      const glow = Math.max(0, 1 - Math.abs(y - HEIGHT * 0.58) / (HEIGHT * 0.3)) * 0.9;
      r = lerp(r, TEXT_GLOW[0], glow * 0.55);
      g = lerp(g, TEXT_GLOW[1], glow * 0.55);
      b = lerp(b, TEXT_GLOW[2], glow * 0.55);
    }
    const spine = spineStrength(x, y, mask);
    if (spine > 0) {
      r = lerp(r, 240, spine);
      g = lerp(g, 225, spine);
      b = lerp(b, 200, spine);
    }
    const off = 1 + x * 3;
    row[off] = r;
    row[off + 1] = g;
    row[off + 2] = b;
  }
  rows.push(row);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(Buffer.concat(rows))),
  chunk("IEND", Buffer.alloc(0)),
]);

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const outPath = join(outDir, "og-image.png");
writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${WIDTH}x${HEIGHT}, ${png.length} bytes)`);