/**
 * Genera íconos PWA (PNG) sin dependencias externas.
 * Dibuja: fondo oscuro redondeado, círculo esmeralda con gradiente y check blanco.
 * Uso: node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");

// ---------- PNG encoder ----------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
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

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // 10-12: 0

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- Drawing ----------
function roundedRectInside(x, y, size, radius) {
  const r = Math.min(radius, size / 2);
  const cx = Math.max(r, Math.min(size - r, x));
  const cy = Math.max(r, Math.min(size - r, y));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function makeIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const corner = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let r, g, b, a = 255;

      if (!roundedRectInside(x + 0.5, y + 0.5, size, corner)) {
        a = 0;
      } else {
        // Fondo oscuro con leve tinte
        r = 0x08;
        g = 0x0c;
        b = 0x0b;

        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          // Gradiente esmeralda
          const t = Math.min(1, dist / radius);
          r = Math.round(0x34 - (0x34 - 0x10) * t);
          g = Math.round(0xd3 - (0xd3 - 0xb9) * t);
          b = Math.round(0x99 - (0x99 - 0x81) * t);
        }

        // Check blanco (dos segmentos)
        const checkPoints = [
          { x: cx - size * 0.26, y: cy + size * 0.02 },
          { x: cx - size * 0.09, y: cy + size * 0.18 },
          { x: cx + size * 0.28, y: cy - size * 0.2 },
        ];
        const thickness = size * 0.06;
        for (let s = 0; s < checkPoints.length - 1; s++) {
          const p1 = checkPoints[s];
          const p2 = checkPoints[s + 1];
          const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const proj = ((x - p1.x) * (p2.x - p1.x) + (y - p1.y) * (p2.y - p1.y)) / (segLen * segLen);
          const clamped = Math.max(0, Math.min(1, proj));
          const px = p1.x + (p2.x - p1.x) * clamped;
          const py = p1.y + (p2.y - p1.y) * clamped;
          const d = Math.hypot(x - px, y - py);
          if (d <= thickness) {
            r = 0xff;
            g = 0xff;
            b = 0xff;
            break;
          }
        }
      }

      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = a;
    }
  }
  return encodePNG(size, size, buf);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [180, 192, 512, 1024]) {
  const png = makeIcon(size);
  const file = join(OUT_DIR, `icon-${size}.png`);
  writeFileSync(file, png);
  console.log(`✓ ${file} (${png.length} bytes)`);
}
