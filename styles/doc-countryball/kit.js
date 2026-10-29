// =====================================================================
//  styles/doc-countryball/kit.js — a satellite documentary, then countryball comedy.
//  Satellite: the Netherlands is drawn in code (no imagery): sea, land, polder fields, canals, towns, rivers.
//  Countryball: round nations with flag fills, faces, stick arms and legs, props (windmill, dike, houses).
//  Subtitles: the narration's own lines and word times (VOICE), drawn in STYLE.post.
//  Built on kit/core.js. Prefix: dc. Needs from the piece head: W, H (1920 x 1080), MONO, VOICE (optional).
// =====================================================================
const DC = {
  sea: '#0c2a39', seaLine: '#2f6b82', euLand: '#56633f', nlA: '#78874f', nlB: '#5f6f3f', nlC: '#8a8f5a',
  canal: '#2b5a66', water: '#1f5d74', dike: '#e3d59b', city: '#d3cdbf', red: '#e5483d', ink: '#131313',
  paper: '#f3ecdb', sky: '#9fd6ec', grass: '#7fb35d', night: '#0b1520', rain: '#9fb6c9', jer: '#f3c98b',
  cap: '#2d3c57', ns: '#2c6ca3', nl: ['#ae1c28', '#ffffff', '#21468b'], soil: '#8c6d4a', sand: '#e6d9a7',
};
const DC_SANS = '"Helvetica Neue", Arial, "Liberation Sans", "DejaVu Sans", sans-serif';
// satellite scale: pixels per degree of latitude; the map is centred on lon 5.3, lat 52.3
const DC_S = 340;
const dcXY = (lo, la) => [W / 2 + (lo - 5.3) * 0.616 * DC_S, H / 2 + (52.3 - la) * DC_S];
const dcPts = (ll) => ll.map(([lo, la]) => dcXY(lo, la));
// outlines in [lon, lat]: the Netherlands, its neighbours (Belgium and Germany, east), the IJsselmeer, rivers, towns
const DC_NL = [[7.1, 53.45], [6.6, 53.5], [6.0, 53.45], [5.5, 53.4], [5.0, 53.25], [4.8, 53.05], [4.72, 52.95], [4.65, 52.75], [4.6, 52.55], [4.62, 52.42], [4.45, 52.2], [4.25, 52.06], [4.12, 51.98], [3.9, 51.85], [3.7, 51.75], [3.55, 51.5], [3.4, 51.37], [3.6, 51.3], [4.25, 51.38], [5.0, 51.45], [5.6, 51.1], [5.85, 50.85], [6.0, 50.75], [6.15, 50.85], [6.2, 51.4], [6.0, 51.85], [6.05, 52.0], [6.9, 52.2], [7.05, 52.5], [7.1, 52.9], [7.2, 53.2]];
const DC_EU = [[3.4, 51.37], [3.6, 51.3], [4.25, 51.38], [5.0, 51.45], [5.6, 51.1], [5.85, 50.85], [6.0, 50.75], [6.15, 50.85], [6.2, 51.4], [6.0, 51.85], [6.05, 52.0], [6.9, 52.2], [7.05, 52.5], [7.1, 52.9], [7.2, 53.2], [7.1, 53.45], [9.5, 53.5], [9.5, 48.5], [2.5, 48.5], [2.5, 51.0], [3.2, 51.2]];
const DC_IJM = [[4.9, 52.95], [5.1, 53.0], [5.4, 52.98], [5.6, 52.8], [5.7, 52.55], [5.5, 52.4], [5.2, 52.45], [5.0, 52.6], [4.85, 52.8]];
const DC_RIV = [[[6.1, 51.85], [5.5, 51.95], [5.0, 51.97], [4.6, 51.95], [4.15, 51.98]], [[5.6, 51.5], [5.1, 51.7], [4.7, 51.85], [4.4, 51.95]]];
const DC_CITY = [[4.9, 52.37, 9], [4.48, 51.92, 8], [4.3, 52.08, 7], [5.12, 52.09, 7], [5.47, 51.44, 6], [6.57, 53.22, 6], [4.6, 51.95, 4], [4.76, 52.31, 5]];
const DC_LOW = [4.6, 51.95];          // the lowest point, in the Zuidplaspolder near Nieuwerkerk aan den IJssel
const DC_DAM = [[4.86, 52.93], [5.0, 52.92], [5.2, 52.96], [5.36, 52.94]];   // the Afsluitdijk, approximate
const DC_SCHIPHOL = [4.76, 52.31];

// point in polygon (lon/lat or screen points)
function dcIn(P, x, y) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
// a polder field grid, computed once (static, seeded)
let DC_CELLS = null;
function dcCells() {
  if (DC_CELLS) return DC_CELLS;
  DC_CELLS = [];
  const R = RNG('dc-cells');
  for (let la = 50.7; la < 53.6; la += 0.028) for (let lo = 3.3; lo < 7.3; lo += 0.042) {
    if (!dcIn(DC_NL, lo + 0.021, la + 0.014)) continue;
    const [x0, y0] = dcXY(lo, la + 0.028), [x1, y1] = dcXY(lo + 0.042, la);
    DC_CELLS.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, c: [DC.nlA, DC.nlB, DC.nlC][Math.floor(R.f() * 3)] });
  }
  return DC_CELLS;
}
// defer a drawing to after the camera (screen coords), or run it now when no camera is set
function dcDefer(f) { if (DEFER) DEFER.push(f); else f(); }

// ---------------------------------------------------------------------
//  satellite view (world coords: draw under the era's camera)
// ---------------------------------------------------------------------
function dcSea() {
  const z = ctx.getTransform().a;
  ctx.fillStyle = DC.sea; ctx.fillRect(-W, -H, W * 3, H * 3);
  const R = RNG('dc-sea');
  ctx.strokeStyle = DC.seaLine; ctx.lineCap = 'round';
  for (let i = 0; i < 220; i++) {
    const x0 = R.r(0, W), y = R.r(0, H), L = R.r(30, 150), a = R.r(0.12, 0.4);
    const x = ((x0 + TT * 9) % W + W) % W;
    ctx.globalAlpha = a; ctx.lineWidth = 2 / z;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L / 2, y + R.n(6), x + L, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function dcLandShape(P, base) {
  ctx.fillStyle = base; trace(P, true); ctx.fill();
}
function dcSatellite() {
  ctx.save();
  dcSea();
  const z = ctx.getTransform().a, euP = dcPts(DC_EU), nlP = dcPts(DC_NL);
  dcLandShape(euP, DC.euLand);
  // a few darker fields on the neighbouring land, clipped to it
  ctx.save(); trace(euP, true); ctx.clip();
  const RE = RNG('dc-eu');
  for (let i = 0; i < 260; i++) { ctx.fillStyle = RE.f() < 0.5 ? '#4a5736' : '#68764a'; ctx.fillRect(RE.r(-200, W + 200), RE.r(-200, H + 200), RE.r(30, 120), RE.r(20, 90)); }
  ctx.restore();
  dcLandShape(nlP, DC.nlB);
  // polder fields with canals between them
  for (const c of dcCells()) { ctx.fillStyle = c.c; ctx.fillRect(c.x, c.y, c.w, c.h); }
  ctx.strokeStyle = DC.canal; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.2 / z;
  for (const c of dcCells()) { ctx.strokeRect(c.x, c.y, c.w, c.h); }
  ctx.globalAlpha = 1;
  // the IJsselmeer, the rivers and the towns
  dcLandShape(dcPts(DC_IJM), DC.water);
  ctx.strokeStyle = DC.water; ctx.lineWidth = 4 / z; ctx.lineJoin = 'round';
  for (const r of DC_RIV) { ctx.beginPath(); dcPts(r).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
  DC_CITY.forEach(([lo, la, n], i) => {
    const [cx, cy] = dcXY(lo, la), RC = RNG('dc-city', i);
    ctx.fillStyle = DC.city;
    for (let j = 0; j < n * 3; j++) { const s = RC.r(2.5, 5) / Math.max(1, z * 0.6); ctx.fillRect(cx + RC.n(9 / Math.max(1, z * 0.4)) - s / 2, cy + RC.n(9 / Math.max(1, z * 0.4)) - s / 2, s, s); }
  });
  // the coast, drawn as a dike line
  ctx.strokeStyle = DC.dike; ctx.lineWidth = 2.2 / z; ctx.lineJoin = 'round';
  trace(nlP, true); ctx.stroke();
  ctx.restore();
}
// a pin with a pulse ring, in world coords
function dcPin(lo, la, t0, color = DC.red) {
  const [x, y] = dcXY(lo, la), k = popS(t0), z = Math.max(1, ctx.getTransform().a);
  if (k <= 0) return;
  const pulse = (TT * 1.4) % 1;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3 / z; ctx.globalAlpha = (1 - pulse) * k;
  ctx.beginPath(); ctx.arc(x, y, (8 + pulse * 40) / z, 0, TAU); ctx.stroke();
  ctx.globalAlpha = k; ctx.fillStyle = color; ctx.strokeStyle = DC.ink; ctx.lineWidth = 2 / z;
  ctx.beginPath(); ctx.arc(x, y, 7 / z, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// the satellite's frame furniture, in screen coords
function dcHud(lines) {
  dcDefer(() => {
    ctx.save();
    ctx.font = `600 24px ${MONO}`; ctx.fillStyle = 'rgba(214,238,246,0.85)'; ctx.textAlign = 'left';
    lines.forEach((s, i) => ctx.fillText(s, 60, 70 + i * 34));
    ctx.strokeStyle = 'rgba(214,238,246,0.6)'; ctx.lineWidth = 2;
    const cx = W - 110, cy = 110;
    ctx.beginPath(); ctx.moveTo(cx - 26, cy); ctx.lineTo(cx - 8, cy); ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 26, cy);
    ctx.moveTo(cx, cy - 26); ctx.lineTo(cx, cy - 8); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 26); ctx.stroke();
    ctx.restore();
  });
}
// a big sans title or label, in screen coords, with a pop-in at t0
function dcTitle(str, x, y, size, color, t0, o = {}) {
  const k = popS(t0);
  if (k <= 0) return;
  dcDefer(() => {
    ctx.save(); ctx.font = `${o.weight ?? 900} ${size}px ${DC_SANS}`; ctx.textAlign = o.align ?? 'left';
    ctx.globalAlpha = Math.min(1, k); ctx.fillStyle = color;
    if (o.box) {
      const w = ctx.measureText(str).width + 48;
      const bx = o.align === 'center' ? x - w / 2 : x - 24;
      ctx.fillStyle = o.box; ctx.beginPath(); ctx.roundRect(bx, y - size * 1.05, w, size * 1.45, 16); ctx.fill();
      ctx.fillStyle = color;
    }
    ctx.fillText(str, x, y);
    ctx.restore();
  });
}
// a stat card: a big number and a small line under it
function dcStat(big, small, t0, x, y) {
  const k = popS(t0);
  if (k <= 0) return;
  dcDefer(() => {
    ctx.save(); ctx.globalAlpha = Math.min(1, k);
    ctx.translate(x, y); ctx.scale(Math.max(0.01, k), Math.max(0.01, k));
    ctx.fillStyle = DC.paper; ctx.strokeStyle = DC.ink; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-300, -120, 600, 200, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = DC.red; ctx.textAlign = 'center';
    ctx.font = `900 96px ${DC_SANS}`; ctx.fillText(big, 0, 0);
    ctx.fillStyle = DC.ink; ctx.font = `600 36px ${DC_SANS}`; ctx.fillText(small, 0, 56);
    ctx.restore();
  });
}

// ---------------------------------------------------------------------
//  countryball: a round nation with a flag fill, a face, stick arms and legs
//  o: { flag: 'nl' | fill colour, face: 'happy'|'calm'|'worried'|'angry'|'shock', look: -1..1,
//       hat: true (a cap), arms: [[angle, len], ...], legs: true, key, bob: false }
// ---------------------------------------------------------------------
function dcBall(x, y, r, o = {}) {
  const k = o.key ?? 'ball';
  if (o.bob !== false) y += Math.sin(TT * 2.2 + k.length * 1.7) * r * 0.03;
  const lw = Math.max(5, r * 0.05);
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = DC.ink; ctx.lineWidth = lw;
  // limbs behind the body
  const legs = o.legs !== false;
  if (legs) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * r * 0.35, y + r * 0.85); ctx.lineTo(x + s * r * 0.42, y + r * 1.4); ctx.stroke(); }
  for (const [a, len] of o.arms ?? []) {
    const sx = x + Math.cos(a) * r * 0.9, sy = y + Math.sin(a) * r * 0.9;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len); ctx.stroke();
  }
  // the body
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  if (o.flag === 'nl') {
    ctx.fillStyle = DC.nl[0]; ctx.fillRect(x - r, y - r, r * 2, r * 0.67);
    ctx.fillStyle = DC.nl[1]; ctx.fillRect(x - r, y - r * 0.33, r * 2, r * 0.67);
    ctx.fillStyle = DC.nl[2]; ctx.fillRect(x - r, y + r * 0.33, r * 2, r * 0.7);
  } else if (o.flag === 'waves') {
    ctx.fillStyle = o.fill ?? DC.ns; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 3; i++) { const yy = y - r * 0.4 + i * r * 0.4 + Math.sin(TT * 3 + i) * r * 0.05; ctx.beginPath(); ctx.moveTo(x - r, yy); for (let u = -1; u <= 1; u += 0.1) ctx.lineTo(x + u * r, yy + Math.sin(u * 6 + TT * 4 + i) * r * 0.06); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r, y + r); ctx.fill(); }
  } else {
    ctx.fillStyle = o.fill ?? DC.jer; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  // a cap: a dome over the top with a brim
  if (o.hat) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    ctx.fillStyle = DC.cap; ctx.beginPath(); ctx.ellipse(x, y - r * 0.2, r * 1.02, r * 0.78, 0, Math.PI, TAU); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 1.02, Math.PI * 1.98); ctx.lineWidth = lw; ctx.stroke();
    ctx.fillStyle = DC.cap; ctx.beginPath(); ctx.ellipse(x - r * 0.5, y - r * 0.5, r * 0.44, r * 0.14, -0.6, 0, TAU); ctx.fill(); ctx.stroke();
  }
  // face
  const bl = (B + k.length * 5) % 31 < 1, ex = r * 0.32, ey = y - r * 0.08, er = r * 0.16, look = o.look ?? 0;
  for (const s of [-1, 1]) {
    if (bl) { ctx.beginPath(); ctx.moveTo(x + s * ex - er, ey); ctx.lineTo(x + s * ex + er, ey); ctx.lineWidth = lw * 0.8; ctx.stroke(); continue; }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x + s * ex, ey, er, er * 1.2, 0, 0, TAU); ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.stroke();
    ctx.fillStyle = DC.ink; ctx.beginPath(); ctx.arc(x + s * ex + look * er * 0.4, ey + er * 0.1, er * 0.45, 0, TAU); ctx.fill();
  }
  ctx.lineWidth = lw * 0.9;
  const face = o.face ?? 'happy', my = y + r * 0.3;
  if (face === 'angry') {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * ex - er * 1.3, ey - er * 1.5); ctx.lineTo(x + s * ex + er * 1.1, ey - er * 0.9 - (s < 0 ? 0 : 0)); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - r * 0.25, my + r * 0.06); ctx.lineTo(x + r * 0.25, my - r * 0.02); ctx.stroke();
  } else if (face === 'worried') {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * ex - er * 1.2, ey - er * 1.2 - s * er * 0.2); ctx.lineTo(x + s * ex + er * 1.2, ey - er * 1.5 + s * er * 0.2); ctx.stroke(); }
    ctx.beginPath(); for (let u = -1; u <= 1; u += 0.25) ctx.lineTo(x + u * r * 0.25, my + Math.sin(u * 9 + TT * 6) * r * 0.03 - r * 0.02); ctx.stroke();
  } else if (face === 'shock') {
    ctx.beginPath(); ctx.ellipse(x, my + r * 0.04, r * 0.11, r * 0.14, 0, 0, TAU); ctx.fillStyle = DC.ink; ctx.fill();
  } else if (face === 'calm') {
    ctx.beginPath(); ctx.moveTo(x - r * 0.18, my); ctx.lineTo(x + r * 0.18, my); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(x, my - r * 0.12, r * 0.3, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}
// props
function dcWindmill(x, base, h, ang) {
  ctx.save(); ctx.strokeStyle = DC.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.fillStyle = '#efe3c8'; ctx.beginPath(); ctx.moveTo(x - h * 0.13, base); ctx.lineTo(x + h * 0.13, base); ctx.lineTo(x + h * 0.06, base - h); ctx.lineTo(x - h * 0.06, base - h); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = DC.cap; ctx.beginPath(); ctx.moveTo(x - h * 0.08, base - h); ctx.lineTo(x, base - h * 1.12); ctx.lineTo(x + h * 0.08, base - h); ctx.closePath(); ctx.fill(); ctx.stroke();
  const hx = x, hy = base - h;
  for (let i = 0; i < 4; i++) {
    const a = ang + i * Math.PI / 2;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
    ctx.fillStyle = '#f7f2e4'; ctx.fillRect(-h * 0.05, 0, h * 0.1, h * 0.8); ctx.strokeRect(-h * 0.05, 0, h * 0.1, h * 0.8);
    ctx.restore();
  }
  ctx.restore();
}
// a dike: a band along the ground, with its crest at y - height
function dcDike(x0, x1, ground, height, k = 1) {
  const top = ground - height * k;
  ctx.save(); ctx.fillStyle = DC.soil; ctx.strokeStyle = DC.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, ground); ctx.lineTo(x0 + (x1 - x0) * 0.3, top); ctx.lineTo(x0 + (x1 - x0) * 0.7, top); ctx.lineTo(x1, ground); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// a two-storey house on a base line: walls from base up to ridge, a roof above
function dcHouse(x, base, w, h, o = {}) {
  ctx.save(); ctx.strokeStyle = DC.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.fillStyle = o.wall ?? '#e8dcc2'; ctx.fillRect(x, base - h, w, h); ctx.strokeRect(x, base - h, w, h);
  ctx.fillStyle = o.roof ?? '#b5483b'; ctx.beginPath(); ctx.moveTo(x - w * 0.08, base - h); ctx.lineTo(x + w / 2, base - h - w * 0.45); ctx.lineTo(x + w * 1.08, base - h); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = DC.sky; for (let i = 0; i < 2; i++) { ctx.fillRect(x + w * (0.18 + i * 0.5), base - h * 0.78, w * 0.26, h * 0.22); ctx.strokeRect(x + w * (0.18 + i * 0.5), base - h * 0.78, w * 0.26, h * 0.22); }
  ctx.restore();
}
// a rain sheet over the frame (screen coords), seeded
function dcRain(n, speed) {
  const R = RNG('dc-rain');
  ctx.save(); ctx.strokeStyle = DC.rain; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const x = R.r(0, W), y0 = R.r(0, H), L = R.r(20, 46), y = ((y0 + TT * speed) % (H + 80)) - 40;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - L * 0.2, y + L); ctx.stroke();
  }
  ctx.restore();
}
// a stick-figure-free cloud, drifting
function dcCloud(x, y, s, sp = 14) {
  const xx = ((x + TT * sp) % (W + 400)) - 200;
  ctx.save(); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = DC.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(xx, y, 90 * s, 36 * s, 0, 0, TAU); ctx.ellipse(xx - 60 * s, y + 8 * s, 52 * s, 28 * s, 0, 0, TAU); ctx.ellipse(xx + 60 * s, y + 10 * s, 56 * s, 30 * s, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------
//  subtitles: the narration line on screen, with each word lit as it is spoken (VOICE from voice.json)
// ---------------------------------------------------------------------
function dcSubtitles() {
  if (typeof VOICE === 'undefined') return;
  const L = VOICE.lines.find((l) => TT >= l.t0 - 0.05 && TT < l.t1 + 0.4);
  if (!L) return;
  ctx.save();
  ctx.font = `700 46px ${DC_SANS}`; ctx.textAlign = 'left';
  const maxW = 1560, rows = []; let cur = [], cw = 0;
  for (const wd of L.words) {
    const ww = ctx.measureText(wd.w + ' ').width;
    if (cw + ww > maxW && cur.length) { rows.push(cur); cur = []; cw = 0; }
    cur.push({ w: wd.w, t0: wd.t0, width: ww }); cw += ww;
  }
  if (cur.length) rows.push(cur);
  const lh = 62, boxH = rows.length * lh + 30, y0 = H - 46 - boxH;
  ctx.fillStyle = 'rgba(8,14,20,0.66)'; ctx.beginPath(); ctx.roundRect(W / 2 - maxW / 2 - 30, y0, maxW + 60, boxH, 18); ctx.fill();
  rows.forEach((row, i) => {
    const rw = row.reduce((a, b) => a + b.width, 0);
    let x = (W - rw) / 2; const y = y0 + 16 + (i + 1) * lh - 16;
    for (const wd of row) { ctx.fillStyle = TT >= wd.t0 - 0.02 ? '#ffffff' : 'rgba(255,255,255,0.45)'; ctx.fillText(wd.w, x, y); x += wd.width; }
  });
  ctx.restore();
}

// =====================================================================
//  STYLE — the renderer's hooks. The piece has no bridges (every era is a hard cut), so window / blob / hero
//  only matter if a bridge is added later.
// =====================================================================
const STYLE = {
  name: 'doc-countryball',
  paper: DC.night,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { dcBall(x, y, r, { flag: 'nl', key: 'morph' }); },
  heroColor: DC.nl[0],
  post() {
    ctx.save();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    dcSubtitles();
  },
  ones: true,
};
