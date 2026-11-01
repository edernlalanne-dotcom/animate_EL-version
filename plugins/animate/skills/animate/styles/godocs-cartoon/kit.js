// =====================================================================
//  styles/godocs-cartoon/kit.js: Cartoon Style GoDocs style
//  Infographic documentary plus web-cartoon. Cel-shaded vector shapes, bold outlines of one weight,
//  mood palettes (sunny, neutral, disaster), layered backgrounds, a puppet-rig narrator (the Surveyor).
//  Built on kit/core.js. Every helper here starts with gc / GC so it never clashes with core names.
//  Needs from the piece head: HAND, CX, SAFE.
// =====================================================================
const GC_MOODS = {
  sunny:    { ink: '#1B2433', sky0: '#4FB3E8', sky1: '#FFF3D6', sun: '#FFC93C', rock: '#F2853A', land: '#5DB75A', water: '#4FB3E8', concrete: '#FFF3D6', accent: '#FFC93C', cloth: '#3F7FD1', paper: '#FFF3D6' },
  neutral:  { ink: '#1B2433', sky0: '#7FA3BE', sky1: '#F4EBD8', sun: '#E0A93B', rock: '#B5472E', land: '#7A8A3C', water: '#3F5C7A', concrete: '#F4EBD8', accent: '#E0A93B', cloth: '#3F5C7A', paper: '#F4EBD8' },
  disaster: { ink: '#161B22', sky0: '#3A444D', sky1: '#9AA3AB', sun: '#B9C0C5', rock: '#7B6F5E', land: '#6B7060', water: '#6F8794', concrete: '#C3C7CA', accent: '#A9503A', cloth: '#5B6770', paper: '#9AA3AB' },
};
const GC_HERO = { hat: '#E0A93B', skin: '#E8A87C', stake: '#B98A52' };   // the hero's colors never change with the mood
let GC_MOOD = 'sunny';
const gcMood = (m) => { GC_MOOD = m; };
const gcM = () => GC_MOODS[GC_MOOD];
const GC_FONT = '"Arial Rounded MT Bold", "Trebuchet MS", "Verdana", "DejaVu Sans", sans-serif';

function gcMix(a, b, u) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(lerp(v, y[i], u)).toString(16).padStart(2, '0')).join('');
}
// outline weight: one weight for every shape, constant on screen whatever the camera zoom
function gcLW(k = 1) { return k * 8 * UNIT / (ctx.getTransform().a || 1); }
function gcPath(P, round) {
  if (round) { trace(P, true); return; }
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
  ctx.closePath();
}
// the cel-shaded shape: base fill with a soft top gradient, one hard shadow on the lower right (light from the upper left), a bold outline
function gcShape(P, fill, o = {}) {
  const M = gcM(), round = o.round ?? true;
  ctx.save();
  gcPath(P, round); ctx.fillStyle = fill; ctx.fill();
  if (o.cel !== false) {
    const bb = bbox(P), d = Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0) * (o.shade ?? 0.06);
    ctx.save(); gcPath(P, round); ctx.clip();
    ctx.fillStyle = gcMix(fill, M.ink, 0.3); ctx.fillRect(bb.x0 - 2, bb.y0 - 2, bb.x1 - bb.x0 + 4, bb.y1 - bb.y0 + 4);
    const g = ctx.createLinearGradient(0, bb.y0, 0, bb.y1);
    g.addColorStop(0, gcMix(fill, '#ffffff', 0.2)); g.addColorStop(1, fill);
    ctx.translate(-d, -d * 0.8); gcPath(P, round); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }
  if (o.line !== false) { gcPath(P, round); ctx.lineWidth = gcLW(o.w ?? 1); ctx.strokeStyle = o.line || M.ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  ctx.restore();
}
// a plain gradient fill with no outline, for distant layers (atmospheric depth)
function gcFill(P, color, o = {}) {
  const bb = bbox(P); ctx.save(); gcPath(P, o.round ?? false);
  const g = ctx.createLinearGradient(0, bb.y0, 0, bb.y1); g.addColorStop(0, gcMix(color, '#ffffff', o.lift ?? 0.14)); g.addColorStop(1, color);
  ctx.fillStyle = g; ctx.fill(); ctx.restore();
}
function gcStroke(P, color, w = 1, o = {}) {
  ctx.save(); ctx.lineWidth = gcLW(w); ctx.strokeStyle = color || gcM().ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.dash) ctx.setLineDash(o.dash.map((v) => v * UNIT));
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.stroke(); ctx.restore();
}
function gcCapsule(x1, y1, x2, y2, r, n = 10) {
  const a = Math.atan2(y2 - y1, x2 - x1), P = [];
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + Math.PI * i / n; P.push([x2 + Math.cos(t) * r, y2 + Math.sin(t) * r]); }
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + Math.PI * i / n; P.push([x1 + Math.cos(t) * r, y1 + Math.sin(t) * r]); }
  return P;
}
function gcText(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${GC_FONT}`; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || gcM().ink; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
// an infographic label that pops in: a rounded plate with the text. Anchored at its centre (x, y). o.t = pop time
function gcLabel(str, x, y, size, o = {}) {
  const k = o.t == null ? 1 : popS(o.t); if (k <= 0) return;
  const M = gcM(); ctx.save(); ctx.font = `800 ${size}px ${GC_FONT}`;
  const w = ctx.measureText(str).width + size * 0.9, h = size * 1.5; ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  gcShape(rrectPts(-w / 2, -h / 2, w, h, h * 0.35, 6), o.fill || M.paper, { w: 0.8, shade: 0.05 });
  gcText(str, 0, size * 0.36, size, o.color || M.ink, { align: 'center' });
  ctx.restore();
}
// screen-size overlays (drawn after the camera through DEFER)
const gcTag = (str) => { const f = () => gcLabel(str, SAFE.top > 100 ? 190 * UNIT : 160 * UNIT, SAFE.top + 70 * UNIT, 64 * UNIT, { t: E0 + 0.2, fill: gcM().sun }); if (DEFER) DEFER.push(f); else f(); };
const gcCaption = (str) => { const f = () => { const k = ev(E0 + 0.45, 0.5); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; gcText(str, CX, H - SAFE.bottom - 14 * UNIT, 54 * UNIT, '#ffffff', { align: 'center', stroke: 12 * UNIT, strokeColor: gcM().ink }); ctx.restore(); }; if (DEFER) DEFER.push(f); else f(); };

// seeded 1D value noise for ridges and rock edges
function gcNoise(seed, x) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(RNG('gcn', seed, i).f(), RNG('gcn', seed, i + 1).f(), u);
}
// a static grain texture, built once from a seed, drawn on top of every frame
let GC_GRAIN = null;
function gcGrainTex() {
  if (GC_GRAIN) return GC_GRAIN;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), R = RNG('gcgrain');
  for (let i = 0; i < 2600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(20,20,40,0.5)'; const s = R.r(1, 2.6); g.fillRect(R.r(0, 256), R.r(0, 256), s, s); }
  GC_GRAIN = c; return c;
}

// =====================================================================
//  backgrounds: layered matte-style scenes drawn in code
//  sky, sun, clouds, ridges with haze, canyon walls with strata, a dam, a river, icons (pylon, crane)
// =====================================================================
const gcX0 = () => -W * 0.35, gcX1 = () => W * 1.35;
function gcSky(horizon, o = {}) {
  const M = gcM(), y0 = -H * 0.35;
  const g = ctx.createLinearGradient(0, y0, 0, horizon); g.addColorStop(0, M.sky0); g.addColorStop(1, M.sky1);
  ctx.fillStyle = g; ctx.fillRect(gcX0(), y0, gcX1() - gcX0(), horizon - y0 + 4);
  if (o.sun !== false) {
    const sx = o.sunX ?? LX(0.72), sy = o.sunY ?? horizon - H * 0.2, r = (o.sunR ?? 90) * UNIT;
    const rg = ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, r * 3.2); rg.addColorStop(0, gcMix(M.sun, M.sky1, 0.2) + 'cc'); rg.addColorStop(1, M.sun + '00');
    ctx.fillStyle = rg; ctx.fillRect(sx - r * 3.4, sy - r * 3.4, r * 6.8, r * 6.8);
    gcShape(ellipsePts(sx, sy, r, r, 0, 36), M.sun, { line: false, cel: false });
  }
  const nC = o.clouds ?? 3;
  for (let i = 0; i < nC; i++) {
    const R = RNG('gcc', i), cx = LX(R.r(0.05, 0.95)) + Math.sin(TT * 0.25 + i * 2) * 26 * UNIT, cy = horizon - H * R.r(0.22, 0.5), s = R.r(0.8, 1.3) * UNIT;
    const blobs = [[0, 0, 70, 34], [-62, 10, 48, 26], [58, 12, 52, 28], [18, -22, 44, 30]];
    for (const [bx, by, rx, ry] of blobs) gcShape(ellipsePts(cx + bx * s, cy + by * s, rx * s, ry * s, 0, 22), gcMix('#ffffff', M.sky1, o.cloudMix ?? 0.15), { w: 0.55, shade: 0.09, line: o.cloudLine ?? false });
  }
}
// a ridge: noise outline, filled with the layer color pulled toward the horizon color (haze) by depth 0..1
function gcRidge(base, amp, seed, color, depth, o = {}) {
  const M = gcM(), P = [], step = 54 * UNIT, f = o.freq ?? 0.0045 / UNIT;
  for (let x = gcX0(); x <= gcX1() + step; x += step) P.push([x, base - amp * (gcNoise(seed, x * f) * 0.8 + gcNoise(seed + 9, x * f * 3.1) * 0.2)]);
  P.push([gcX1() + step, base + 2000 * UNIT], [gcX0(), base + 2000 * UNIT]);
  gcFill(P, gcMix(color, M.sky1, depth), { lift: 0.1 });
}
// a wall of rock with strata and speckle. P = outline. Light from the upper left
function gcRock(P, seed, o = {}) {
  const M = gcM(), base = o.color || M.rock;
  gcShape(P, base, { shade: o.shade ?? 0.05, w: o.w ?? 1, round: false });
  const bb = bbox(P); ctx.save(); gcPath(P, false); ctx.clip();
  const R = RNG('gcrock', seed), bands = 9;
  for (let i = 0; i < bands; i++) {
    const y = lerp(bb.y0, bb.y1, (i + R.r(0.2, 0.8)) / bands), th = R.r(10, 26) * UNIT, tilt = R.n(0.06);
    ctx.fillStyle = gcMix(base, i % 2 ? M.ink : '#ffffff', i % 2 ? 0.16 : 0.12);
    ctx.beginPath(); ctx.moveTo(bb.x0 - 20, y); ctx.lineTo(bb.x1 + 20, y + tilt * (bb.x1 - bb.x0)); ctx.lineTo(bb.x1 + 20, y + tilt * (bb.x1 - bb.x0) + th); ctx.lineTo(bb.x0 - 20, y + th); ctx.closePath(); ctx.fill();
  }
  for (let i = 0; i < 70; i++) { const px = R.r(bb.x0, bb.x1), py = R.r(bb.y0, bb.y1), s = R.r(3, 9) * UNIT; ctx.fillStyle = gcMix(base, M.ink, 0.22); ctx.beginPath(); ctx.ellipse(px, py, s, s * 0.6, R.r(0, 3), 0, TAU); ctx.fill(); }
  ctx.restore();
  gcPath(P, false); ctx.save(); ctx.lineWidth = gcLW(o.w ?? 1); ctx.strokeStyle = M.ink; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
// a river with moving highlight strokes. y0..y1 band, color from the mood
function gcRiver(y0, y1, o = {}) {
  const M = gcM(), g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, gcMix(M.water, M.sky1, 0.25)); g.addColorStop(1, M.water);
  ctx.fillStyle = g; ctx.fillRect(gcX0(), y0, gcX1() - gcX0(), y1 - y0);
  const R = RNG('gcriver', o.seed ?? 1);
  for (let i = 0; i < 16; i++) {
    const y = lerp(y0, y1, R.r(0.1, 0.95)), x = gcX0() + mod(R.r(0, 1) * (gcX1() - gcX0()) + TT * (o.flow ?? 40) * UNIT * (0.4 + y / y1), gcX1() - gcX0()), len = R.r(40, 120) * UNIT * (0.5 + (y - y0) / (y1 - y0));
    gcStroke([[x, y], [x + len, y]], gcMix(M.water, '#ffffff', 0.45), 0.5);
  }
}
// the dam: a concrete wall between two canyon walls. crest y, base y, left x, right x. o.spill = 0..1 overtopping, o.crack = 0..1
function gcDam(xl, xr, crest, base, o = {}) {
  const M = gcM(), tl = 40 * UNIT, P = [[xl, crest], [xr, crest], [xr + tl * 2.2, base], [xl - tl * 2.2, base]];
  gcShape(P, M.concrete, { round: false, shade: 0.04 });
  ctx.save(); gcPath(P, false); ctx.clip();
  const n = 9;
  for (let i = 1; i < n; i++) { const t = i / n, xt = lerp(xl, xr, t), xb = lerp(xl - tl * 2.2, xr + tl * 2.2, t); gcStroke([[xt, crest], [xb, base]], gcMix(M.concrete, M.ink, 0.35), 0.35); }
  for (let j = 1; j < 4; j++) { const y = lerp(crest, base, j / 4); gcStroke([[xl - tl * 2.2 * (j / 4) - 4, y], [xr + tl * 2.2 * (j / 4) + 4, y]], gcMix(M.concrete, M.ink, 0.25), 0.3); }
  // spillway gates: dark arches on the face
  const gates = 4, gw = (xr - xl) / (gates * 2.2);
  for (let i = 0; i < gates; i++) { const gx = lerp(xl, xr, (i + 0.5) / gates) - gw / 2, gy = crest + (base - crest) * 0.12, gh = (base - crest) * 0.2; gcShape([[gx, gy + gh], [gx, gy + gh * 0.4], ...ellipsePts(gx + gw / 2, gy + gh * 0.4, gw / 2, gh * 0.4, 0, 12, Math.PI, TAU), [gx + gw, gy + gh]], gcMix(M.ink, M.water, 0.35), { w: 0.6, cel: false, round: false }); }
  ctx.restore();
  // crest walkway and rail
  gcShape([[xl - 14 * UNIT, crest - 20 * UNIT], [xr + 14 * UNIT, crest - 20 * UNIT], [xr + 14 * UNIT, crest + 8 * UNIT], [xl - 14 * UNIT, crest + 8 * UNIT]], gcMix(M.concrete, M.ink, 0.12), { round: false, w: 0.8 });
  for (let x = xl; x <= xr; x += 56 * UNIT) gcStroke([[x, crest - 20 * UNIT], [x, crest - 48 * UNIT]], M.ink, 0.5);
  gcStroke([[xl, crest - 48 * UNIT], [xr, crest - 48 * UNIT]], M.ink, 0.5);
  if (o.spill) {   // water over the crest: white streaks falling, foam at the base
    const s = o.spill; ctx.save(); gcPath(P, false); ctx.clip();
    const R = RNG('gcspill');
    for (let i = 0; i < 26; i++) {
      const x = lerp(xl, xr, R.r(0.02, 0.98)), L = (base - crest) * R.r(0.35, 0.9) * s, y0 = crest + mod(R.r(0, 400) * UNIT + TT * 520 * UNIT, base - crest - L * 0.1);
      gcStroke([[x, y0], [x + R.n(14) * UNIT, y0 + L * 0.5]], gcMix(M.water, '#ffffff', 0.55), 1.1);
    }
    ctx.restore();
    for (let i = 0; i < 14; i++) { const fx = lerp(xl - 60 * UNIT, xr + 60 * UNIT, i / 13), fy = base - 10 * UNIT + Math.sin(TT * 3 + i) * 8 * UNIT; gcShape(ellipsePts(fx, fy, 46 * UNIT, 26 * UNIT, 0, 16), '#E7ECEE', { w: 0.5, shade: 0.12 }); }
  }
  if (o.crack) {   // the cause: a rust crack with an ink outline, drawn on
    const k = o.crack, cx = lerp(xl, xr, 0.62), cy = crest + (base - crest) * 0.42, Z = [[0, 0], [14, 40], [-10, 78], [16, 120], [-6, 170], [10, 214]].map(([a, b]) => [cx + a * UNIT * 1.4, cy + b * UNIT * 1.4]);
    const part = subPath(Z, k); gcStroke(part, M.ink, 2.2); gcStroke(part, M.accent, 1.1);
  }
}
// icons: a transmission pylon and a crane, in ink with one fill color
function gcPylon(x, y, h) {
  const M = gcM(), w = h * 0.34, c = gcMix(M.ink, M.sky1, 0.25);
  gcStroke([[x - w / 2, y], [x, y - h], [x + w / 2, y]], c, 0.55);
  gcStroke([[x - w * 0.33, y - h * 0.34], [x + w * 0.33, y - h * 0.34]], c, 0.45); gcStroke([[x - w * 0.2, y - h * 0.62], [x + w * 0.2, y - h * 0.62]], c, 0.45);
  gcStroke([[x - w * 0.6, y - h * 0.82], [x + w * 0.6, y - h * 0.82]], c, 0.5);
}
function gcCrane(x, y, h, o = {}) {
  const M = gcM(), c = M.ink, a = M.accent === '#A9503A' ? gcMix(M.accent, M.ink, 0.2) : '#E0A93B';
  gcStroke([[x, y], [x, y - h]], c, 1.3); gcStroke([[x - h * 0.18, y - h], [x + h * 0.62, y - h]], c, 1.1);
  gcShape(rrectPts(x - h * 0.05, y - h * 1.04, h * 0.1, h * 0.08, 4, 3), a, { w: 0.5, cel: false });
  const sw = Math.sin(TT * 1.4) * 0.04 * h;
  gcStroke([[x + h * 0.5, y - h], [x + h * 0.5 + sw, y - h * 0.7]], c, 0.4);
  gcShape(rrectPts(x + h * 0.5 - h * 0.07 + sw, y - h * 0.7, h * 0.14, h * 0.1, 3, 3), a, { w: 0.5, cel: false });
}
// the haze band: a soft wash of the horizon color over the layers behind it
function gcHaze(y0, y1, alpha = 0.4) {
  const M = gcM(), g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, M.sky1 + '00'); g.addColorStop(1, gcMix(M.sky1, '#ffffff', 0.1) + Math.round(alpha * 255).toString(16).padStart(2, '0'));
  ctx.fillStyle = g; ctx.fillRect(gcX0(), y0, gcX1() - gcX0(), y1 - y0);
}

// =====================================================================
//  the Surveyor: an original narrator, a puppet rig of shapes with spring-free idle motion.
//  head, torso, two arms (upper and lower), two legs. Large eyes. Five face states.
//  gcSurveyor(x, y, h, { face, pose, flip, stake, look, key }): (x, y) = the feet, h = the height
// =====================================================================
const GC_POSES = {
  idle:  { L: [-0.14, -0.06], R: [0.14, 0.06] },
  hold:  { L: [-0.14, -0.06], R: [0.30, 0.04], stake: true },
  point: { L: [-0.16, -0.06], R: [1.95, 1.75] },
  wow:   { L: [-2.35, -2.75], R: [2.35, 2.75] },
  worry: { L: [-1.35, -2.7], R: [1.35, 2.7] },
  shrug: { L: [-0.75, 0.55], R: [0.75, -0.55] },
};
function gcFace(cx, cy, r, state, key, o = {}) {
  const M = gcM(), ink = M.ink, blink = (B + key.length * 7) % 41 < 2;
  const es = state === 'surprise' ? 1.16 : state === 'deadpan' ? 1.0 : 1.04;
  const ex = r * 0.44, ey = cy + r * 0.04, rx = r * 0.33 * es, ry = r * 0.4 * es;
  const lx = (o.look ? o.look[0] : 0) * r * 0.1, ly = (o.look ? o.look[1] : 0) * r * 0.1 + (state === 'worry' ? r * 0.05 : 0);
  for (const s of [-1, 1]) {
    const X = cx + s * ex;
    if (state === 'delight' || blink) {   // closed or happy eyes: an arc
      const happy = state === 'delight';
      gcStroke(arcPts(X, ey + (happy ? r * 0.1 : 0), rx * 0.95, happy ? Math.PI * 1.1 : 0.15 * Math.PI, happy ? Math.PI * 1.9 : 0.85 * Math.PI, 12), ink, 1.0);
    } else {
      gcShape(ellipsePts(X, ey, rx, ry, 0, 20), '#FFFFFF', { w: 0.7, cel: false });
      ctx.save(); ctx.beginPath(); ctx.ellipse(X, ey, rx, ry, 0, 0, TAU); ctx.clip();
      const px = X + lx + s * r * (state === 'worry' ? 0.03 : 0), py = ey + ly + r * 0.03, pr = rx * 0.66;
      ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(px, py, pr, pr * 1.08, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = gcMix(M.water, '#ffffff', 0.15); ctx.beginPath(); ctx.ellipse(px, py + pr * 0.25, pr * 0.62, pr * 0.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(px - pr * 0.3, py - pr * 0.35, pr * 0.28, pr * 0.28, 0, 0, TAU); ctx.fill();
      if (state === 'deadpan') { ctx.fillStyle = GC_HERO.skin; ctx.fillRect(X - rx - 2, ey - ry - 2, rx * 2 + 4, ry * 1.05); ctx.strokeStyle = ink; ctx.lineWidth = gcLW(0.8); ctx.beginPath(); ctx.moveTo(X - rx, ey - ry * 0.05); ctx.lineTo(X + rx, ey - ry * 0.05); ctx.stroke(); }
      ctx.restore();
    }
    // brows
    const by = ey - ry - r * 0.12;
    let b0 = [X - s * rx * 0.9, by], b1 = [X + s * rx * 0.9, by];   // outer, inner ends
    if (state === 'surprise') { b0 = [X - s * rx * 0.9, by - r * 0.16]; b1 = [X + s * rx * 0.8, by - r * 0.22]; }
    if (state === 'worry') { b0 = [X - s * rx * 0.9, by + r * 0.02]; b1 = [X + s * rx * 0.8, by - r * 0.2]; }
    if (state === 'deadpan') { b0 = [X - s * rx * 0.9, by + r * 0.1]; b1 = [X + s * rx * 0.9, by + r * 0.1]; }
    if (state === 'delight') { b0 = [X - s * rx * 0.9, by - r * 0.08]; b1 = [X + s * rx * 0.9, by - r * 0.1]; }
    gcStroke([b0, [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2 - r * 0.04], b1], ink, 1.1);
  }
  const my = cy + r * 0.58;
  if (state === 'surprise') gcShape(ellipsePts(cx, my + r * 0.04, r * 0.15, r * 0.2, 0, 16), ink, { cel: false, w: 0.5, line: ink });
  else if (state === 'delight') { gcShape([...arcPts(cx, my - r * 0.1, r * 0.34, 0, Math.PI, 14), [cx - r * 0.34, my - r * 0.1]], ink, { cel: false, w: 0.5, round: false }); gcShape(ellipsePts(cx, my + r * 0.14, r * 0.17, r * 0.09, 0, 12), '#C9604A', { cel: false, line: false }); }
  else if (state === 'worry') { const W2 = []; for (let i = 0; i <= 12; i++) W2.push([cx - r * 0.22 + i * r * 0.44 / 12, my + Math.sin(i / 12 * TAU * 1.5) * r * 0.045]); gcStroke(W2, ink, 1.0); }
  else if (state === 'deadpan') gcStroke([[cx - r * 0.2, my], [cx + r * 0.2, my]], ink, 1.0);
  else gcStroke(arcPts(cx, my - r * 0.1, r * 0.22, 0.2 * Math.PI, 0.8 * Math.PI, 10), ink, 1.0);
}
function gcSurveyor(x, y, h, o = {}) {
  const M = gcM(), key = o.key || 'sv', P = GC_POSES[o.pose || 'idle'], f = o.flip ? -1 : 1;
  const bob = Math.sin(TT * 3.1 + key.length) * 0.008 * h, sw = (k) => Math.sin(TT * 2.3 + k) * 0.05;
  y += bob;
  ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
  const pants = gcMix(M.ink, M.cloth, 0.55), skin = GC_HERO.skin, r = 0.2 * h;
  // legs and boots
  for (const s of [-1, 1]) {
    gcShape(gcCapsule(s * 0.075 * h, -0.28 * h, s * 0.085 * h, -0.05 * h, 0.05 * h), pants, { w: 0.9 });
    gcShape(ellipsePts(s * 0.1 * h + s * 0.015 * h, -0.02 * h, 0.075 * h, 0.04 * h, 0, 14), M.ink, { cel: false, w: 0.6 });
  }
  // torso
  gcShape(rrectPts(-0.175 * h, -0.66 * h, 0.35 * h, 0.4 * h, 0.1 * h, 6), M.cloth, { w: 1 });
  gcStroke([[-0.175 * h, -0.34 * h], [0.175 * h, -0.34 * h]], M.ink, 0.7);
  gcShape(rrectPts(-0.03 * h, -0.355 * h, 0.06 * h, 0.04 * h, 3, 3), GC_HERO.hat, { w: 0.5, cel: false });
  // arms: shoulder, elbow, hand
  const arm = (s, ang, k) => {
    const sx = s * 0.17 * h, sy = -0.6 * h, L1 = 0.17 * h, L2 = 0.16 * h;
    const a1 = ang[0] + sw(k + s), a2 = ang[1] + sw(k + s + 1);
    const ex = sx + Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1, hx = ex + Math.sin(a2) * L2, hy = ey + Math.cos(a2) * L2;
    gcShape(gcCapsule(sx, sy, ex, ey, 0.045 * h), M.cloth, { w: 0.9 });
    gcShape(gcCapsule(ex, ey, hx, hy, 0.04 * h), skin, { w: 0.9 });
    gcShape(ellipsePts(hx, hy, 0.05 * h, 0.05 * h, 0, 14), skin, { w: 0.9 });
    return [hx, hy];
  };
  arm(-1, P.L, 0);
  const hand = arm(1, P.R, 3);
  if (P.stake || o.stake) {   // the survey stake in the right hand: a wood pole, a flag in the hero color
    const px = hand[0], py = hand[1], top = [px + 0.03 * h, py - 0.62 * h];
    gcShape(gcCapsule(px, py + 0.1 * h, top[0], top[1], 0.014 * h, 6), GC_HERO.stake, { w: 0.7, cel: false });
    gcShape([[top[0], top[1]], [top[0] + 0.15 * h, top[1] + 0.045 * h + Math.sin(TT * 5) * 0.012 * h], [top[0], top[1] + 0.1 * h]], GC_HERO.hat, { w: 0.7, round: false, cel: false });
    gcShape(ellipsePts(px, py, 0.05 * h, 0.05 * h, 0, 14), skin, { w: 0.9 });
  }
  // head: ear, face, hair tuft, hat
  const hy = -0.81 * h;
  gcShape(ellipsePts(0, hy, r * 1.08, r * 1.0, 0, 28), skin, { w: 1.1, shade: 0.05 });
  gcFace(0, hy, r, o.face || 'neutral', key, { look: o.look });
  const dome = [...arcPts(0, hy - r * 0.28, r * 1.18, Math.PI, TAU, 18, 0.95)];
  gcShape(dome, GC_HERO.hat, { w: 1.1, round: false, shade: 0.08 });
  gcShape(rrectPts(-r * 1.38, hy - r * 0.34, r * 2.76, r * 0.2, r * 0.1, 4), GC_HERO.hat, { w: 1.1, shade: 0.12 });
  gcStroke([[0, hy - r * 1.2], [0, hy - r * 0.4]], gcMix(GC_HERO.hat, M.ink, 0.35), 0.6);
  ctx.restore();
  const sp = ctx.getTransform(); SPARK_AT = toScreen(x, y - 0.8 * h);
}

// =====================================================================
//  props for scale gags and maps
// =====================================================================
function gcBus(x, y, w) {   // side view, (x, y) = the ground under the bus centre
  const M = gcM(), h = w * 0.34, col = M.rock, win = gcMix(M.sky0, '#ffffff', 0.35);
  gcShape(rrectPts(x - w / 2, y - h * 1.12, w, h, h * 0.18, 6), col, { w: 1 });
  gcShape(rrectPts(x - w / 2 + w * 0.02, y - h * 0.55, w * 0.96, h * 0.1, 3, 3), gcMix(col, '#ffffff', 0.35), { cel: false, w: 0.4 });
  for (let i = 0; i < 6; i++) gcShape(rrectPts(x - w * 0.43 + i * w * 0.125, y - h * 1.02, w * 0.1, h * 0.36, 5, 3), win, { w: 0.6, cel: false });
  gcShape(rrectPts(x + w * 0.34, y - h * 1.02, w * 0.12, h * 0.46, 5, 3), win, { w: 0.6, cel: false });
  for (const wx of [-0.3, 0.3]) { gcShape(ellipsePts(x + wx * w, y - h * 0.14, h * 0.2, h * 0.2, 0, 18), M.ink, { w: 0.8, cel: false }); gcShape(ellipsePts(x + wx * w, y - h * 0.14, h * 0.09, h * 0.09, 0, 12), gcMix(M.ink, '#ffffff', 0.55), { w: 0.4, cel: false }); }
}
function gcTurbine(x, y, r, rot) {   // a runner seen from the front: ring, 12 curved blades, hub
  const M = gcM(), steel = gcMix(M.cloth, M.concrete, 0.25), n = 12;
  gcShape(ellipsePts(x, y, r, r, 0, 48), gcMix(steel, M.ink, 0.15), { w: 1.3 });
  gcShape(ellipsePts(x, y, r * 0.86, r * 0.86, 0, 48), gcMix(M.water, M.ink, 0.35), { w: 0.8, cel: false });
  for (let i = 0; i < n; i++) {
    const a = rot + i * TAU / n, c = Math.cos(a), s = Math.sin(a), P = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8, rr = lerp(0.18, 0.84, t) * r, aa = a + t * 0.5; P.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr]); }
    for (let k = 8; k >= 0; k--) { const t = k / 8, rr = lerp(0.18, 0.84, t) * r, aa = a + t * 0.5 + 0.16 * (1 - t * 0.4); P.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr]); }
    gcShape(P, steel, { w: 0.6, shade: 0.1 });
  }
  gcShape(ellipsePts(x, y, r * 0.2, r * 0.2, 0, 24), gcMix(steel, M.ink, 0.1), { w: 1 });
  gcShape(ellipsePts(x, y, r * 0.07, r * 0.07, 0, 12), M.ink, { cel: false, line: false });
}
// a map card: sea, a coast from seeded noise, a river, a dashed route that draws on (frac), pins
function gcMapCard(x, y, w, h, frac, seed = 4) {
  const M = gcM(); ctx.save();
  const card = rrectPts(x, y, w, h, 34 * UNIT, 8);
  gcShape(card, gcMix(M.water, M.sky1, 0.18), { w: 1.3, shade: 0.03 });
  ctx.save(); trace(card, true); ctx.clip();
  const R = RNG('gcmap', seed), cx = x + w * 0.5, cy = y + h * 0.52, land = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, rr = (0.34 + 0.16 * gcNoise(seed, i * 0.55 + 3) + 0.05 * Math.sin(a * 3)) ; land.push([cx + Math.cos(a) * rr * w * 0.95, cy + Math.sin(a) * rr * h * 0.85]); }
  gcShape(land, M.land, { w: 0.9, shade: 0.05 });
  for (let i = 0; i < 4; i++) { const a = R.r(0, TAU), rr = R.r(0.1, 0.3); gcShape(ellipsePts(cx + Math.cos(a) * rr * w, cy + Math.sin(a) * rr * h, 54 * UNIT, 36 * UNIT, R.r(0, 3), 14), gcMix(M.land, M.ink, 0.22), { w: 0.4, cel: false, line: false }); }
  const riv = []; for (let i = 0; i <= 14; i++) riv.push([lerp(x + w * 0.2, x + w * 0.85, i / 14), cy - h * 0.18 + Math.sin(i * 0.6) * h * 0.09 + i * 6 * UNIT]);
  gcStroke(riv, gcMix(M.water, '#ffffff', 0.15), 2.4);
  for (let i = 0; i < 9; i++) { const wx = x + w * R.r(0.05, 0.95), wy = y + h * R.r(0.06, 0.94); if (Math.hypot(wx - cx, wy - cy) > Math.min(w, h) * 0.46) gcStroke([[wx, wy], [wx + 40 * UNIT, wy]], gcMix(M.water, '#ffffff', 0.4), 0.5); }
  ctx.restore();
  const A = [x + w * 0.24, y + h * 0.7], Bp = [x + w * 0.5, y + h * 0.38], Cp = [x + w * 0.78, y + h * 0.5];
  const route = [A, [lerp(A[0], Bp[0], 0.5), A[1] - 60 * UNIT], Bp, [lerp(Bp[0], Cp[0], 0.5), Bp[1] + 70 * UNIT], Cp];
  const R2 = resample(route, false, 10 * UNIT);
  gcStroke(subPath(R2, frac), M.ink, 2.6, { dash: [0.1, 28] });
  gcStroke(subPath(R2, frac), M.accent, 1.6, { dash: [30, 18] });
  for (const [p, k] of [[A, 0], [Bp, 0.5], [Cp, 1]]) {
    if (frac < k - 0.02) continue; const s = popS(TT - (k === 0 ? 0 : 0)) * 1;
    gcShape([[p[0], p[1]], [p[0] - 26 * UNIT, p[1] - 62 * UNIT], [p[0] + 26 * UNIT, p[1] - 62 * UNIT]], M.accent === '#A9503A' ? M.accent : '#B5472E', { w: 0.7, round: false, cel: false });
    gcShape(ellipsePts(p[0], p[1] - 70 * UNIT, 30 * UNIT, 30 * UNIT, 0, 18), '#B5472E', { w: 0.8 });
    gcShape(ellipsePts(p[0], p[1] - 70 * UNIT, 11 * UNIT, 11 * UNIT, 0, 12), M.concrete, { w: 0.4, cel: false, line: false });
  }
  ctx.restore();
  return { A, B: Bp, C: Cp };
}

// =====================================================================
//  STYLE: the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'godocs-cartoon',
  paper: '#F4EBD8',
  backdrop(c) { fillAll(c); },
  window(P, key, src, o) {   // an inked circle iris
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 9 * UNIT; ctx.strokeStyle = gcM().ink; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  },
  blob(P, c, key) { gcShape(P, c, { w: 1.1, shade: 0.05 }); },
  hero(x, y, r, o) { gcSurveyor(x, y + r * 1.9, r * 3.8, { face: 'surprise', pose: 'wow', key: o.key || 'morph' }); },
  heroColor: '#E0A93B',
  heroPts: (x, y, r) => ellipsePts(x, y, r, r, 0, 48),
  post() {   // the grain pass: a static seeded texture over the whole frame
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.07;
    ctx.fillStyle = ctx.createPattern(gcGrainTex(), 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  ones: true,
};
