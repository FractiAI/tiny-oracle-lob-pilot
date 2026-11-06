/**
 * Lightweight raster helpers (no native deps).
 * Synthetic UI/dashboard frames with a shared organizational layout.
 */

export function makeImage({ w, h, channels = 3, fill = 0 }) {
  const data = new Uint8Array(w * h * channels);
  if (fill) data.fill(fill);
  return { w, h, channels, data };
}

export function paintRect(img, { x, y, w, h, rgb }) {
  const { channels, data } = img;
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      if (i < 0 || j < 0 || i >= img.w || j >= img.h) continue;
      const p = (j * img.w + i) * channels;
      data[p] = rgb[0];
      if (channels > 1) data[p + 1] = rgb[1];
      if (channels > 2) data[p + 2] = rgb[2];
    }
  }
}

export function paintNoise(img, { x, y, w, h, seed = 1, amp = 40 }) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const { channels, data } = img;
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      if (i < 0 || j < 0 || i >= img.w || j >= img.h) continue;
      const p = (j * img.w + i) * channels;
      const n = Math.floor(rand() * amp);
      data[p] = Math.min(255, data[p] + n);
      if (channels > 1) data[p + 1] = Math.min(255, data[p + 1] + n);
      if (channels > 2) data[p + 2] = Math.min(255, data[p + 2] + Math.floor(n / 2));
    }
  }
}

export function uiLayoutRegions(w = 320, h = 180) {
  return {
    chrome: { x: 0, y: 0, w, h: 24 },
    sidebar: { x: 0, y: 24, w: 64, h: h - 24 },
    content: { x: 64, y: 24, w: w - 64, h: h - 48 },
    footer: { x: 0, y: h - 24, w, h: 24 },
  };
}

export function buildUiFrame(variant, seed) {
  const w = 320;
  const h = 180;
  const img = makeImage({ w, h, channels: 3, fill: 20 });
  const regions = uiLayoutRegions(w, h);
  paintRect(img, { ...regions.chrome, rgb: [30, 30, 40] });
  paintRect(img, { ...regions.sidebar, rgb: [40, 45, 55] });
  paintRect(img, { ...regions.footer, rgb: [25, 25, 30] });
  const tones = [
    [180, 60, 60],
    [60, 160, 80],
    [60, 100, 200],
    [200, 160, 40],
  ];
  paintRect(img, { ...regions.content, rgb: tones[variant % tones.length] });
  paintNoise(img, { ...regions.content, seed, amp: 25 });
  paintRect(img, { x: 80, y: 40, w: 40, h: 20, rgb: [220, 220, 220] });
  paintRect(img, { x: 140, y: 40, w: 60, h: 20, rgb: [200, 200, 210] });
  return { img, regions, kind: 'ui_dashboard' };
}

export function buildVideoFrames(n = 48) {
  const frames = [];
  for (let t = 0; t < n; t++) frames.push(buildUiFrame(t % 4, 1000 + t));
  return frames;
}

export function extractRegion(img, region) {
  const { x, y, w, h } = region;
  const out = new Uint8Array(w * h * img.channels);
  let o = 0;
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      const p = (j * img.w + i) * img.channels;
      for (let c = 0; c < img.channels; c++) out[o++] = img.data[p + c];
    }
  }
  return out;
}

export function imageRawBuffer(img) {
  return Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength);
}

export function packFramesRaw(frames) {
  return Buffer.concat(frames.map((f) => imageRawBuffer(f.img)));
}

/** Shared chrome/sidebar/footer once; per-frame content region only. */
export function packFramesTinyStructural(frames) {
  const template = frames[0];
  const staticNames = ['chrome', 'sidebar', 'footer'];
  const chunks = [];
  const meta = {
    w: template.img.w,
    h: template.img.h,
    channels: template.img.channels,
    regions: template.regions,
    staticNames,
    n: frames.length,
  };
  const metaBuf = Buffer.from(JSON.stringify(meta), 'utf8');
  const metaLen = Buffer.alloc(4);
  metaLen.writeUInt32LE(metaBuf.length);
  chunks.push(metaLen, metaBuf);
  for (const name of staticNames) {
    const b = Buffer.from(extractRegion(template.img, template.regions[name]));
    const len = Buffer.alloc(4);
    len.writeUInt32LE(b.length);
    chunks.push(len, b);
  }
  for (let i = 0; i < frames.length; i++) {
    const b = Buffer.from(extractRegion(frames[i].img, frames[i].regions.content));
    const len = Buffer.alloc(4);
    len.writeUInt32LE(b.length);
    chunks.push(len, b);
  }
  return Buffer.concat(chunks);
}

/** Keyframe + XOR residual (naive temporal baseline). */
export function packFramesDiffClean(frames) {
  const key = imageRawBuffer(frames[0].img);
  const header = Buffer.alloc(8);
  header.writeUInt32LE(frames.length, 0);
  header.writeUInt32LE(key.length, 4);
  const parts = [header, key];
  let prev = frames[0].img.data;
  for (let i = 1; i < frames.length; i++) {
    const cur = frames[i].img.data;
    const residual = Buffer.alloc(cur.length);
    for (let k = 0; k < cur.length; k++) residual[k] = cur[k] ^ prev[k];
    parts.push(residual);
    prev = cur;
  }
  return Buffer.concat(parts);
}
