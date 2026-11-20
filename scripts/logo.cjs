// Détoure le logo INPUT (fond clair -> transparent) et produit les variantes.
const sharp = require('/opt/npm-tools/node_modules/sharp');
const src = process.argv[2];
const NAVY = [10, 42, 94], GOLD = [201, 153, 63];
(async () => {
  const meta = await sharp(src).metadata();
  const { data, info } = await sharp(src).flatten({ background: '#fefefd' }).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const bg = [data[0], data[1], data[2]];
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const r = data[i*3], g = data[i*3+1], b = data[i*3+2];
    // encre la plus proche : or si r-b grand, sinon marine
    const ink = (r - b) > 25 ? GOLD : NAVY;
    let a = 0, n = 0;
    for (let k = 0; k < 3; k++) { const d = bg[k] - ink[k]; if (Math.abs(d) > 30) { a += (bg[k] - [r,g,b][k]) / d; n++; } }
    a = n ? a / n : 0; a = Math.max(0, Math.min(1, (a - 0.04) / 0.92));
    out[i*4] = ink[0]; out[i*4+1] = ink[1]; out[i*4+2] = ink[2]; out[i*4+3] = Math.round(a * 255);
  }
  const full = sharp(out, { raw: { width: W, height: H, channels: 4 } });
  const buf = await full.png().toBuffer();
  const trimmed = await sharp(buf).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  await sharp(trimmed.data).toFile('public/brand/input-logo.png');
  console.log('logo', trimmed.info.width, trimmed.info.height, 'bg', bg, meta.width, meta.height);
  // ligne du haut seule (INPUT | EXPERTISE avec filets) : environ 38 % de la hauteur
  const t = trimmed.info;
  const top = await sharp(trimmed.data).extract({ left: 0, top: 0, width: t.width, height: Math.round(t.height * 0.30) }).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  await sharp(top.data).toFile('public/brand/input-wordmark.png');
  console.log('wordmark', top.info.width, top.info.height);
  // variante claire pour fonds marine : marine -> ivoire
  const recolor = async (inBuf, file) => {
    const { data: d, info: ii } = await sharp(inBuf).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < ii.width * ii.height; i++) {
      if (d[i*4] < 100 && d[i*4+2] > 60) { d[i*4] = 247; d[i*4+1] = 242; d[i*4+2] = 232; }
    }
    await sharp(d, { raw: { width: ii.width, height: ii.height, channels: 4 } }).png().toFile(file);
  };
  await recolor(trimmed.data, 'public/brand/input-logo-clair.png');
  await recolor(top.data, 'public/brand/input-wordmark-clair.png');
})();
