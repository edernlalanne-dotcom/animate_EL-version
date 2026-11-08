// =====================================================================
//  styles/offshore/kit.js — 2.5D cinematic industrial documentary. Clean vector shapes with gradients and
//  rim light, layered parallax, side-view engineering (turbines, jack-up vessel, crane, seabed cutaway),
//  cyan infographic dimension lines. Motion on 1s with spring settles. Built on kit/core.js.
//  Palette: deep ocean navy, steel gray, turbine white, construction yellow, electric cyan, amber light.
//  Needs from the piece head: W, H, FPS, CX. Names are prefixed `of` / `OF`.
// =====================================================================
const OF = {
  navy: '#07182f', navy2: '#0d2a4d', sea0: '#17679c', sea1: '#0a3560', steel: '#7d8b99', steelD: '#4a5663', steelL: '#a9b6c3',
  white: '#f3f6f9', whiteS: '#c4cfda', yellow: '#f5b81c', yellowD: '#c78d08', cyan: '#2fe3ff', amber: '#ffb15c',
  red: '#ff4d4d', ink: '#0a1220', sand: '#6b5a45', sandD: '#4d4132', rock: '#3b4350',
};
const OFONT = '"Segoe UI", "Helvetica Neue", "DejaVu Sans", Arial, sans-serif';
let OFX0 = -400, OFX1 = 2320;
function ofBounds(x0, x1) { OFX0 = x0; OFX1 = x1; }
const ofRand = (...k) => RNG(...k).f();
const ofEase = (u) => EZ.io(clamp(u));

// ---- background: sky gradient, sun glow, drifting clouds
function ofSky(y0, y1, o = {}) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, o.top ?? '#081a36'); g.addColorStop(0.55, o.mid ?? '#27527e'); g.addColorStop(1, o.bot ?? '#f2a65a');
  ctx.fillStyle = g; ctx.fillRect(OFX0, y0 - 400, OFX1 - OFX0, y1 - y0 + 400);
  if (o.sun !== false) {
    const sx = o.sunX ?? W * 0.78, sy = y1 - 14, r = 520;
    const rg = ctx.createRadialGradient(sx, sy, 10, sx, sy, r);
    rg.addColorStop(0, 'rgba(255,205,130,0.85)'); rg.addColorStop(0.35, 'rgba(255,170,90,0.28)'); rg.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = rg; ctx.fillRect(sx - r, sy - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < (o.clouds ?? 4); i++) {   // flat layered clouds, slow parallax
    const sp = 6 + i * 3, cx = mod(ofRand('cl', i) * (W + 600) + TT * sp, W + 600) - 300, cy = y0 + (y1 - y0) * (0.12 + 0.55 * ofRand('cly', i)), w = 220 + 200 * ofRand('clw', i);
    ctx.fillStyle = `rgba(255,236,214,${0.10 + 0.05 * (i % 3)})`;
    ctx.beginPath(); ctx.ellipse(cx, cy, w, 18 + 10 * (i % 2), 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + w * 0.3, cy - 14, w * 0.5, 16, 0, 0, TAU); ctx.fill();
  }
}
// ---- sea: a body of water from horizon yh down to yb, with parallax wave layers. amp scales the swell.
function ofWaveY(x, yh, k, amp, ph = 0) { return yh + k * 26 + Math.sin(x * 0.006 / (0.6 + k * 0.5) + TT * (0.7 + k * 0.35) + ph) * amp * (0.35 + k * 0.5) + Math.sin(x * 0.017 + TT * (1.3 + k * 0.4) + k) * amp * 0.18; }
function ofSeaBack(yh, yb, o = {}) {
  const g = ctx.createLinearGradient(0, yh, 0, yb);
  g.addColorStop(0, o.c0 ?? OF.sea0); g.addColorStop(1, o.c1 ?? OF.sea1);
  ctx.fillStyle = g; ctx.fillRect(OFX0, yh, OFX1 - OFX0, yb - yh);
  // sun glitter on the water
  if (o.glitter !== false) for (let i = 0; i < 38; i++) {
    const gx = W * 0.78 + (ofRand('gl', i) - 0.5) * 380 * (0.4 + (i % 7) / 7), gy = yh + 6 + ofRand('gly', i) * 90, on = 0.5 + 0.5 * Math.sin(TT * 3 + i * 1.7);
    ctx.fillStyle = `rgba(255,214,150,${0.45 * on})`; ctx.fillRect(gx, gy, 18 + 26 * ofRand('glw', i), 2);
  }
}
// front wave layers drawn after the objects that stand in the water (so waves lap the hulls)
function ofSeaFront(yh, o = {}) {
  const amp = o.amp ?? 14, n = o.layers ?? 3;
  for (let k = 1; k <= n; k++) {
    const P = []; for (let x = OFX0; x <= OFX1; x += 24) P.push([x, ofWaveY(x, yh, k * 0.5, amp, k * 1.9)]);
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.lineTo(OFX1, o.bottom ?? H + 600); ctx.lineTo(OFX0, o.bottom ?? H + 600); ctx.closePath();
    const a = 0.34 + 0.12 * k;
    ctx.fillStyle = `rgba(${[10, 48, 84].map((v, j) => Math.round(v * (1 - 0.18 * k) + [0, 0, 0][j])).join(',')},${a})`; ctx.fill();
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.strokeStyle = `rgba(150,215,255,${0.18 + 0.05 * k})`; ctx.lineWidth = 2; ctx.stroke();
  }
}
// ---- seabed cutaway: strata, pebbles. x0..x1 across, top surface at y
function ofSeabed(y, x0, x1, depth = 260) {
  const top = (x) => y + Math.sin(x * 0.01) * 6 + Math.sin(x * 0.031) * 3;
  const layers = [[0, '#6d5c46'], [60, '#54483a'], [130, '#3f372e'], [200, '#2d2823']];
  for (let i = layers.length - 1; i >= 0; i--) {
    ctx.beginPath(); ctx.moveTo(x0, top(x0) + layers[i][0]);
    for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, top(x) + layers[i][0] + Math.sin(x * 0.02 + i) * 4);
    ctx.lineTo(x1, y + depth + 400); ctx.lineTo(x0, y + depth + 400); ctx.closePath(); ctx.fillStyle = layers[i][1]; ctx.fill();
  }
  for (let i = 0; i < 90; i++) { const px = x0 + ofRand('pb', i) * (x1 - x0), py = top(px) + 8 + ofRand('pby', i) * (depth - 20); ctx.fillStyle = `rgba(0,0,0,${0.12 + 0.12 * ofRand('pbo', i)})`; ctx.beginPath(); ctx.ellipse(px, py, 3 + 6 * ofRand('pbs', i), 2 + 3 * ofRand('pbs', i), 0, 0, TAU); ctx.fill(); }
  return top;
}
// ---- metal helpers: a vertical-shaded part (light left, dark right) and a rim line
function ofShade(P, c0, c1, o = {}) {
  const bb = bbox(P); const g = ctx.createLinearGradient(bb.x0 ?? bb[0], 0, bb.x1 ?? bb[2], 0);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  if (o.line) { ctx.strokeStyle = o.line; ctx.lineWidth = o.w ?? 1.5; ctx.stroke(); }
}
function ofRect(x, y, w, h, c0, c1, o = {}) { ofShade([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], c0, c1 ?? c0, o); }
// ---- turbine parts
// a tower section: bottom centre (x, yb), height h, bottom width wb, top width wt. Returns its top centre y.
function ofTowerSection(x, yb, h, wb, wt, o = {}) {
  ofShade([[x - wb / 2, yb], [x - wt / 2, yb - h], [x + wt / 2, yb - h], [x + wb / 2, yb]], o.c0 ?? OF.white, o.c1 ?? '#9fb0c0', { line: 'rgba(40,60,80,0.25)' });
  // flanges (rings) at both ends, with bolt dots
  for (const [yy, ww] of [[yb, wb], [yb - h, wt]]) { ofRect(x - ww / 2 - 3, yy - 3, ww + 6, 6, '#dfe6ec', '#8798a8'); }
  return yb - h;
}
function ofBlade(hx, hy, len, ang, wmax = 1, o = {}) {   // blade from hub centre outward at angle ang (rad, 0 = right)
  const c = Math.cos(ang), s = Math.sin(ang), px = -s, py = c, P = [];
  const prof = [[0, 0.5], [0.04, 0.9], [0.22, 1.0], [0.55, 0.62], [0.85, 0.3], [1.0, 0.1]];
  const wm = len * 0.062 * wmax;
  for (const [q, k] of prof) P.push([hx + c * len * q + px * wm * k, hy + s * len * q + py * wm * k]);
  for (let i = prof.length - 1; i >= 0; i--) { const [q, k] = prof[i]; P.push([hx + c * len * q - px * wm * k * 0.45, hy + s * len * q - py * wm * k * 0.45]); }
  const g = ctx.createLinearGradient(hx + px * wm, hy + py * wm, hx - px * wm, hy - py * wm);
  g.addColorStop(0, o.c0 ?? '#ffffff'); g.addColorStop(1, o.c1 ?? '#b9c6d3');
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(40,60,80,0.3)'; ctx.lineWidth = 1.2; ctx.stroke();
}
function ofNacelle(x, y, s, o = {}) {   // x,y = centre of the nacelle's bottom edge on the tower top
  const w = 150 * s, h = 62 * s;
  ofShade(rrectPts(x - w * 0.62, y - h, w, h, 14 * s, 5), '#ffffff', '#9fb0c0', { line: 'rgba(40,60,80,0.3)' });
  ofRect(x - w * 0.62 + 10 * s, y - h + 8 * s, w * 0.28, 5 * s, '#e8eef3', '#c4cfda');   // vent
  return { hubX: x - w * 0.62 - 6 * s, hubY: y - h * 0.5 };
}
function ofHub(x, y, r) { const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#8da0b2'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(40,60,80,0.3)'; ctx.stroke(); }
// a complete turbine on foundation top (x, by). s: scale (1 = tower 560 tall). o: { sections 0..3, nacelle 0..1, blades 0..3, rot, hubOnly }
function ofTurbine(x, by, s, o = {}) {
  const Ht = 560 * s, secs = o.sections ?? 3, wb = 36 * s, wt = 22 * s, hs = Ht / 3;
  let y = by;
  for (let i = 0; i < Math.min(3, Math.ceil(secs)); i++) {
    const w0 = lerp(wb, wt, i / 3), w1 = lerp(wb, wt, (i + 1) / 3);
    y = ofTowerSection(x, y, hs, w0, w1);
  }
  const done = secs >= 3;
  let hub = null;
  if (done && (o.nacelle ?? 1) > 0) {
    hub = ofNacelle(x, by - Ht, s);
    ofHub(hub.hubX, hub.hubY, 17 * s);
    const L = (o.bladeLen ?? 250) * s, n = o.blades ?? 3;
    for (let i = 0; i < n; i++) ofBlade(hub.hubX, hub.hubY, L, (o.rot ?? 0) + i * TAU / 3 - Math.PI / 2 + 0.0, 1);
    ofHub(hub.hubX, hub.hubY, 12 * s);
  }
  return { top: by - Ht, hub };
}
// ---- the monopile + transition piece, side view. Pile from y0 (top) to y1 (bottom), centre x.
function ofMonopile(x, y0, y1, w = 38) {
  ofShade([[x - w / 2, y0], [x + w / 2, y0], [x + w / 2, y1], [x - w / 2, y1]], '#b7c3cf', '#566472', { line: 'rgba(0,0,0,0.35)' });
  for (let yy = y0 + 40; yy < y1; yy += 60) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x - w / 2, yy, w, 3); }
}
function ofTransition(x, yb, w = 38, o = {}) {   // yellow transition piece with platform and ladder
  const h = 120;
  ofShade([[x - w * 0.62, yb], [x - w * 0.5, yb - h], [x + w * 0.5, yb - h], [x + w * 0.62, yb]], '#ffd24d', '#c78d08', { line: 'rgba(0,0,0,0.3)' });
  ofRect(x - w * 1.5, yb - h * 0.55, w * 3, 8, '#ffd24d', '#9a6c05');   // platform deck
  ofRect(x - w * 1.5, yb - h * 0.55 - 26, 3, 26, '#d8dde2'); ofRect(x + w * 1.5 - 3, yb - h * 0.55 - 26, 3, 26, '#d8dde2'); ofRect(x - w * 1.5, yb - h * 0.55 - 26, w * 3, 2, '#d8dde2');   // rail
  ofRect(x + w * 0.5, yb - h * 0.55, 4, h * 0.55 + 70, '#3a4350');   // boat landing ladder
  return yb - h;
}
// ---- crane: base on deck (x, yDeck), boom pivots at height h above the deck, angle a (deg above horizontal), length L, dir +1 = boom reaches right.
function ofCraneTip(x, yDeck, a, L, o = {}) { const ph = o.h ?? 190, dir = o.dir ?? 1, A = a * DEG; return [x + dir * Math.cos(A) * L, yDeck - ph - Math.sin(A) * L]; }
function ofCrane(x, yDeck, a, L, o = {}) {
  const ph = o.h ?? 190, dir = o.dir ?? 1, pv = [x, yDeck - ph], A = a * DEG, tip = ofCraneTip(x, yDeck, a, L, o);
  ofShade([[x - 36, yDeck], [x - 24, yDeck - ph], [x + 24, yDeck - ph], [x + 36, yDeck]], '#ffd24d', '#c78d08', { line: 'rgba(0,0,0,0.3)' });   // pedestal
  ofRect(x - 30 - (dir > 0 ? 30 : -30) - (dir > 0 ? 0 : 0), yDeck - ph - 38, 90, 38, '#ffe27a', '#c78d08', { line: 'rgba(0,0,0,0.3)' });   // machinery house
  const ux = Math.cos(A) * dir, uy = -Math.sin(A), nx = -uy, ny = ux, wd = 18;   // boom direction and its normal
  const q = (f, s) => [lerp(pv[0], tip[0], f) + nx * lerp(wd, 4, f) * s, lerp(pv[1], tip[1], f) + ny * lerp(wd, 4, f) * s];
  ctx.beginPath(); ctx.moveTo(...q(0, 1)); ctx.lineTo(...q(1, 1)); ctx.lineTo(...q(1, -1)); ctx.lineTo(...q(0, -1)); ctx.closePath(); ctx.fillStyle = 'rgba(255,210,77,0.30)'; ctx.fill();
  ctx.strokeStyle = '#ffd24d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...q(0, 1)); ctx.lineTo(...q(1, 1)); ctx.moveTo(...q(0, -1)); ctx.lineTo(...q(1, -1)); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < 16; i++) { const sg = i % 2 ? 1 : -1; ctx.moveTo(...q(i / 16, sg)); ctx.lineTo(...q((i + 1) / 16, -sg)); } ctx.stroke();
  ctx.strokeStyle = '#c9d2db'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pv[0] - dir * 46, pv[1] - 50); ctx.lineTo(...tip); ctx.stroke();   // pendant
  ctx.fillStyle = '#8795a3'; ctx.beginPath(); ctx.arc(tip[0], tip[1], 7, 0, TAU); ctx.fill();
  return { tip, pivot: pv };
}
function ofHook(x, yTop, yHook, o = {}) {   // cable from (x, yTop) to the hook, hook block and hook at yHook
  ctx.strokeStyle = '#d9dfe5'; ctx.lineWidth = o.w ?? 2.2; ctx.beginPath(); ctx.moveTo(x - 3, yTop); ctx.lineTo(x - 3, yHook - 26); ctx.moveTo(x + 3, yTop); ctx.lineTo(x + 3, yHook - 26); ctx.stroke();
  ofRect(x - 11, yHook - 30, 22, 22, '#ffd24d', '#c78d08', { line: 'rgba(0,0,0,0.4)' });
  ctx.strokeStyle = '#c9d2db'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, yHook + 2, 9, -0.3, Math.PI * 1.25); ctx.stroke();
}
function ofSling(x0, y0, x1, y1, x2, y2) { ctx.strokeStyle = '#ffb15c'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.moveTo(x0, y0); ctx.lineTo(x2, y2); ctx.stroke(); }
// ---- jack-up vessel. deckY = top of the hull's deck; x = centre. o.leg = how far the legs reach below the hull bottom
function ofJackup(x, deckY, o = {}) {
  const hw = o.w ?? 560, hh = 70, hx = x - hw / 2, legs = [-hw * 0.34, -hw * 0.12, hw * 0.16, hw * 0.38], leg = o.leg ?? 80, top = o.legTop ?? (deckY - 300);
  const bot = deckY + hh;
  // legs first (behind the hull front): lattice legs from legTop down to bot + leg, spud can at the end
  legs.forEach((lx, i) => {
    const lxx = x + lx, w = 22, y0 = Math.min(top, deckY - 60), y1 = bot + leg, dim = i < 2 ? 1 : 0.86;
    ctx.fillStyle = `rgba(${Math.round(188 * dim)},${Math.round(198 * dim)},${Math.round(208 * dim)},1)`;
    ctx.fillRect(lxx - w / 2, y0, 4, y1 - y0); ctx.fillRect(lxx + w / 2 - 4, y0, 4, y1 - y0);
    ctx.strokeStyle = `rgba(${Math.round(190 * dim)},${Math.round(200 * dim)},${Math.round(210 * dim)},0.85)`; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let yy = y0, k = 0; yy < y1 - 20; yy += 26, k++) { ctx.moveTo(lxx - w / 2, yy + (k % 2 ? 26 : 0)); ctx.lineTo(lxx + w / 2, yy + (k % 2 ? 0 : 26)); }
    ctx.stroke();
    ofShade([[lxx - 20, y1 - 16], [lxx + 20, y1 - 16], [lxx + 28, y1 + 4], [lxx - 28, y1 + 4]], '#9aa7b4', '#56626f');
  });
  // hull: a long barge, steel gray below deck, yellow top rail, white accommodation block at the bow (left)
  ofShade([[hx, deckY], [hx + hw, deckY], [hx + hw - 16, bot], [hx + 24, bot]], '#8a97a4', '#46515d', { line: 'rgba(0,0,0,0.35)' });
  ofRect(hx, deckY - 10, hw, 12, '#ffd24d', '#c78d08');
  ofRect(hx + 18, deckY - 118, 126, 108, '#f3f6f9', '#b5c2cf', { line: 'rgba(0,0,0,0.25)' });   // accommodation
  for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(40,150,200,0.9)'; ctx.fillRect(hx + 30 + i * 28, deckY - 98, 18, 12); ctx.fillRect(hx + 30 + i * 28, deckY - 70, 18, 12); }
  ofRect(hx + 60, deckY - 150, 44, 32, '#f3f6f9', '#b5c2cf');   // bridge
  ctx.fillStyle = 'rgba(40,150,200,0.9)'; ctx.fillRect(hx + 66, deckY - 142, 32, 10);
  ctx.fillStyle = 'rgba(255,177,92,0.9)'; ctx.fillRect(hx + hw - 40, deckY - 14, 6, 4);
  return { bot, deckY, hx, hw, legs: legs.map((l) => x + l) };
}
// ---- people-scale objects
function ofShip(x, y, s = 1, flip = 1) {   // a small service boat, for scale
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  ofShade([[-60, 0], [64, 0], [48, 20], [-46, 20]], '#e9eef2', '#8b99a6', { line: 'rgba(0,0,0,0.3)' });
  ofRect(-20, -22, 38, 22, '#f5b81c', '#c78d08'); ofRect(-14, -16, 10, 8, 'rgba(40,150,200,0.9)'); ofRect(2, -16, 10, 8, 'rgba(40,150,200,0.9)');
  ctx.restore();
}
function ofAtlas(x, y, r, o = {}) {   // the mascot: a round engineer in a yellow hard hat. Sets SPARK_AT for the anchor check.
  y += Math.sin(TT * TAU * 0.8) * r * 0.05; SPARK_AT = toScreen(x, y);
  ctx.save(); ctx.translate(x, y);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#9fb9d0'); g.addColorStop(1, '#4f6d88');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd24d'; ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 1.02, Math.PI, TAU); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c78d08'; ctx.fillRect(-r * 1.15, -r * 0.22, r * 2.3, r * 0.14);
  ctx.fillStyle = '#ffd24d'; ctx.fillRect(-r * 0.12, -r * 1.2, r * 0.24, r * 0.5);
  const blink = (B + 5) % 43 < 2, ex = (o.look ?? 0) * r * 0.06;
  for (const s of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s * r * 0.34, r * 0.18, r * 0.17, blink ? r * 0.02 : r * 0.21, 0, 0, TAU); ctx.fill(); ctx.fillStyle = OF.ink; ctx.beginPath(); ctx.arc(s * r * 0.34 + ex, r * 0.2, r * 0.07, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = OF.ink; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, r * 0.42, r * 0.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
}
// ---- infographic: a cyan dimension line between two points with a label chip. o.p = progress 0..1
function ofDim(x1, y1, x2, y2, label, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang), ny = Math.cos(ang);
  ctx.save(); ctx.strokeStyle = OF.cyan; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(47,227,255,0.7)'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.moveTo(x1 + nx * 12, y1 + ny * 12); ctx.lineTo(x1 - nx * 12, y1 - ny * 12);
  if (p > 0.99) { ctx.moveTo(x2 + nx * 12, y2 + ny * 12); ctx.lineTo(x2 - nx * 12, y2 - ny * 12); } ctx.stroke(); ctx.restore();
  if (label && p > 0.6) ofChip(label, (x1 + x2) / 2 + (o.dx ?? 0), (y1 + y2) / 2 + (o.dy ?? 0), { size: o.size ?? 30, a: clamp((p - 0.6) / 0.4) });
}
function ofChip(str, x, y, o = {}) {   // a dark rounded label chip with cyan text, centred on (x, y)
  const sz = o.size ?? 30; ctx.save(); ctx.font = `700 ${sz}px ${OFONT}`; const w = ctx.measureText(str).width + sz * 1.1, h = sz * 1.55;
  ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = 'rgba(6,18,36,0.86)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h * 0.3); ctx.fill();
  ctx.strokeStyle = o.line ?? OF.cyan; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = o.color ?? OF.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y + 1); ctx.restore();
  return w;
}
// ---- lower-third caption through DEFER (screen space). frac = typed fraction.
function ofCaption(str, o = {}) {
  const f = () => {
    const fr = ev(E0 + (o.at ?? 0.35), 0.5); if (fr <= 0) return;
    ctx.save(); ctx.font = `700 ${o.size ?? 54}px ${OFONT}`; const w = ctx.measureText(str).width, x = 90, y = H - 110;
    ctx.globalAlpha = clamp(fr * 2); ctx.fillStyle = 'rgba(6,18,36,0.72)'; ctx.beginPath(); ctx.roundRect(x - 26, y - 62, w + 64, 92, 14); ctx.fill();
    ctx.fillStyle = OF.yellow; ctx.fillRect(x - 26, y - 62, 8, 92);
    ctx.beginPath(); ctx.rect(x, y - 70, w * fr + 4, 110); ctx.clip(); ctx.fillStyle = OF.white; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, x, y); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}
// the scene tag top-left: number + name, cyan
function ofTag(num, str) {
  const f = () => { const a = ev(E0 + 0.1, 0.35); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `800 30px ${OFONT}`; ctx.fillStyle = OF.cyan; ctx.fillText(num, 90, 96); ctx.fillStyle = OF.white; ctx.font = `700 30px ${OFONT}`; ctx.fillText(str.toUpperCase(), 140, 96); ctx.fillRect(90, 112, 90 + 20 * str.length * 0.9, 3); ctx.restore(); };
  if (DEFER) DEFER.push(f); else f();
}
// =====================================================================
//  STYLE hooks
// =====================================================================
const STYLE = {
  name: 'offshore',
  paper: OF.navy,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r, o) { ofAtlas(x, y, r * 0.7, o); },
  heroColor: OF.yellow,
  post() {   // cinematic vignette and a faint warm grade
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, Math.hypot(W, H) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,8,18,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  ones: true,
};
