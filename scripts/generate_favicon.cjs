const fs = require("fs");
const path = require("path");

// 1. Create the high-definition SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>

    <!-- Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#818cf8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.35"/>
    </linearGradient>

    <!-- Cap Glow -->
    <filter id="capGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#818cf8" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Rounded Squircle Base -->
  <rect x="2.5" y="2.5" width="59" height="59" rx="16" ry="16" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="2"/>

  <!-- Subtle Radial Light at Top Left -->
  <circle cx="20" cy="20" r="16" fill="#6366f1" opacity="0.15"/>

  <!-- Centered Graduation Cap Icon -->
  <g transform="translate(13.5, 13.5) scale(1.54)" stroke="#93c5fd" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#capGlow)">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
    <path d="M22 10v6"/>
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
  </g>
</svg>
`;

// Save SVGs
const appIconPath = path.join(__dirname, "../src/app/icon.svg");
const appAppleIconPath = path.join(__dirname, "../src/app/apple-icon.svg");
const publicIconPath = path.join(__dirname, "../public/icon.svg");
const publicFaviconSvgPath = path.join(__dirname, "../public/favicon.svg");

fs.writeFileSync(appIconPath, svgContent, "utf8");
fs.writeFileSync(appAppleIconPath, svgContent, "utf8");
fs.writeFileSync(publicIconPath, svgContent, "utf8");
fs.writeFileSync(publicFaviconSvgPath, svgContent, "utf8");

console.log("✅ SVG icons created successfully.");

// 2. Generate a valid 32x32 32-bit ICO file
function generateIco32() {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4); // RGBA

  // Line segment distance helper
  function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // Draw pixels
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Squircle check (rounded rectangle with radius ~7px on 32x32)
      const r = 7;
      const margin = 1;
      const minX = margin + r, maxX = size - 1 - margin - r;
      const minY = margin + r, maxY = size - 1 - margin - r;

      let dx = 0, dy = 0;
      if (x < minX) dx = minX - x;
      else if (x > maxX) dx = x - maxX;
      if (y < minY) dy = minY - y;
      else if (y > maxY) dy = y - maxY;

      const dCorner = Math.hypot(dx, dy);
      const isInside = (dx === 0 || dy === 0) ? (x >= margin && x <= size - 1 - margin && y >= margin && y <= size - 1 - margin) : (dCorner <= r);

      if (!isInside) {
        pixels[idx + 0] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0; // transparent
        continue;
      }

      // Base gradient: from (26, 38, 59) to (24, 20, 60)
      const tGrad = (x + y) / (2 * size);
      let red = Math.round(24 + (1 - tGrad) * 10);
      let green = Math.round(28 + (1 - tGrad) * 12);
      let blue = Math.round(62 + tGrad * 15);
      let alpha = 255;

      // Soft border
      const isBorder = (dx === 0 && dy === 0) 
        ? (x === margin || x === size - 1 - margin || y === margin || y === size - 1 - margin)
        : (dCorner >= r - 1.2 && dCorner <= r);
      if (isBorder) {
        red = Math.round(red * 0.4 + 99 * 0.6);
        green = Math.round(green * 0.4 + 130 * 0.6);
        blue = Math.round(blue * 0.4 + 246 * 0.6);
      }

      // Check distance to cap lines
      // Diamond: (4.5, 12) -> (16, 7) -> (27.5, 12) -> (16, 17) -> (4.5, 12)
      const d1 = distToSegment(x, y, 4.5, 12, 16, 7);
      const d2 = distToSegment(x, y, 16, 7, 27.5, 12);
      const d3 = distToSegment(x, y, 27.5, 12, 16, 17);
      const d4 = distToSegment(x, y, 16, 17, 4.5, 12);

      // Tassel: (27.5, 13) -> (27.5, 21)
      const d5 = distToSegment(x, y, 27.5, 13, 27.5, 21);

      // Lower cap curve: (9, 15) -> (9, 20) -> (16, 24) -> (23, 20) -> (23, 15)
      const d6 = distToSegment(x, y, 9, 15, 9, 20);
      const d7 = distToSegment(x, y, 9, 20, 16, 24);
      const d8 = distToSegment(x, y, 16, 24, 23, 20);
      const d9 = distToSegment(x, y, 23, 20, 23, 15);

      const minDist = Math.min(d1, d2, d3, d4, d5, d6, d7, d8, d9);

      if (minDist <= 1.3) {
        const factor = Math.max(0, 1 - minDist / 1.3);
        // Blend with cap color (#93c5fd = 147, 197, 253)
        red = Math.round(red * (1 - factor) + 147 * factor);
        green = Math.round(green * (1 - factor) + 197 * factor);
        blue = Math.round(blue * (1 - factor) + 253 * factor);
      }

      pixels[idx + 0] = red;
      pixels[idx + 1] = green;
      pixels[idx + 2] = blue;
      pixels[idx + 3] = alpha;
    }
  }

  // Encode to ICO (BMP format)
  // Header (6 bytes)
  // Dir Entry (16 bytes)
  // BITMAPINFOHEADER (40 bytes)
  // Color data: 32 * 32 * 4 bytes (BGRA, bottom-to-top)
  // Mask data: 32 * 4 bytes
  const colorDataSize = size * size * 4;
  const maskDataSize = size * 4;
  const dibSize = 40 + colorDataSize + maskDataSize;
  const totalFileSize = 6 + 16 + dibSize;

  const icoBuf = Buffer.alloc(totalFileSize);

  // ICO Header
  icoBuf.writeUInt16LE(0, 0); // reserved
  icoBuf.writeUInt16LE(1, 2); // type 1 = icon
  icoBuf.writeUInt16LE(1, 4); // 1 image

  // Dir Entry
  icoBuf.writeUInt8(size, 6); // width
  icoBuf.writeUInt8(size, 7); // height
  icoBuf.writeUInt8(0, 8);    // color count (0 = >=256)
  icoBuf.writeUInt8(0, 9);    // reserved
  icoBuf.writeUInt16LE(1, 10); // color planes
  icoBuf.writeUInt16LE(32, 12); // bits per pixel
  icoBuf.writeUInt32LE(dibSize, 14); // resource size
  icoBuf.writeUInt32LE(22, 18); // offset of DIB data (6 + 16 = 22)

  // BITMAPINFOHEADER
  let offset = 22;
  icoBuf.writeUInt32LE(40, offset); // header size
  icoBuf.writeInt32LE(size, offset + 4); // width
  icoBuf.writeInt32LE(size * 2, offset + 8); // height * 2 (for icon)
  icoBuf.writeUInt16LE(1, offset + 12); // planes
  icoBuf.writeUInt16LE(32, offset + 14); // bit count
  icoBuf.writeUInt32LE(0, offset + 16); // compression = BI_RGB
  icoBuf.writeUInt32LE(colorDataSize + maskDataSize, offset + 20); // image size
  icoBuf.writeInt32LE(0, offset + 24); // XPelsPerMeter
  icoBuf.writeInt32LE(0, offset + 28); // YPelsPerMeter
  icoBuf.writeUInt32LE(0, offset + 32); // ClrUsed
  icoBuf.writeUInt32LE(0, offset + 36); // ClrImportant
  offset += 40;

  // Pixel data (BGRA, bottom to top)
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4;
      const r = pixels[srcIdx + 0];
      const g = pixels[srcIdx + 1];
      const b = pixels[srcIdx + 2];
      const a = pixels[srcIdx + 3];

      icoBuf.writeUInt8(b, offset + 0);
      icoBuf.writeUInt8(g, offset + 1);
      icoBuf.writeUInt8(r, offset + 2);
      icoBuf.writeUInt8(a, offset + 3);
      offset += 4;
    }
  }

  // Mask data (1 bit per pixel: 0 = visible, 1 = transparent, 4 bytes per row)
  for (let y = size - 1; y >= 0; y--) {
    const rowBytes = [0, 0, 0, 0];
    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4;
      const a = pixels[srcIdx + 3];
      if (a === 0) {
        const byteIdx = Math.floor(x / 8);
        const bitIdx = 7 - (x % 8);
        rowBytes[byteIdx] |= (1 << bitIdx);
      }
    }
    icoBuf.writeUInt8(rowBytes[0], offset + 0);
    icoBuf.writeUInt8(rowBytes[1], offset + 1);
    icoBuf.writeUInt8(rowBytes[2], offset + 2);
    icoBuf.writeUInt8(rowBytes[3], offset + 3);
    offset += 4;
  }

  return icoBuf;
}

const icoBuffer = generateIco32();
fs.writeFileSync(path.join(__dirname, "../src/app/favicon.ico"), icoBuffer);
fs.writeFileSync(path.join(__dirname, "../public/favicon.ico"), icoBuffer);

console.log("✅ favicon.ico (32x32 valid RGBA ICO) written to src/app/favicon.ico & public/favicon.ico!");
