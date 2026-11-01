// =====================================================================
//  styles/iso3d/kit.js — shaded 2.5D isometric: a navy and teal warehouse, solids with lit tops and
//  split side faces, soft contact shadows, rim light, amber glow, red risk marks. Projection and
//  painter's-order rules come from styles/isometric (same 2:1 dimetric). Built on kit/core.js.
//  Needs from the piece head: W, H, FPS, CX. Motion on 1s with spring settles.
//  Draw back to front (smaller x + y first, lower z first in a stack).
// =====================================================================
const PAL = {
  paper: '#0a1f3d', paper2: '#06132a', floor: '#15456c', floorL: '#1d5d8a', grid: 'rgba(120,220,230,0.16)',
  steel: '#d3e3ec', steelD: '#6d879b', joint: '#1a2a40', visor: '#0b1626',
  teal: '#2dd4c4', tealD: '#17818a', amber: '#ffb43a', amberD: '#c47a10', red: '#ff4a55', redD: '#a3202c',
  blue: '#2f86e0', cash: '#48d6a0', shelf: '#1a5878', text: '#eaf6fb', textD: '#8fb4c8', rim: 'rgba(190,240,255,0.34)',
};
const SANS = '"Segoe UI", "Helvetica Neue", Arial, "DejaVu Sans", sans-serif';
const HAND = SANS;   // the storyboard sheet's title font
const ISOMONO = 'Consolas, Menlo, "DejaVu Sans Mono", monospace';
const HAIR = 1.6;

// ---- colour helpers
const hexRGB = (h) => (h[0] === '#' ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : (h.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number));
const shade = (c, k) => { const v = hexRGB(c).map((x) => clamp(Math.round(k > 1 ? x + (255 - x) * (k - 1) : x * k), 0, 255)); return `rgb(${v[0]},${v[1]},${v[2]})`; };
const mixC = (a, b, u) => { const x = hexRGB(a), y = hexRGB(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], u))).join(",")})`; };
const withA = (c, a) => { const v = hexRGB(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; };

// ---- projection: 2:1 dimetric. x runs right-down, y runs left-down, z up.
const ZK = 1.2247;
const ISO_VIEW = [0.6124, 0.6124, 0.5];
let ISO = { ox: 540, oy: 960, u: 1 };
function setIso(o) { ISO = { ox: o.ox ?? 540, oy: o.oy ?? 960, u: o.u ?? 1 }; return ISO; }
function iso(x, y, z = 0) { return [ISO.ox + (x - y) * ISO.u, ISO.oy + ((x + y) * 0.5 - z * ZK) * ISO.u]; }
const isoP = (p) => iso(p[0], p[1], p[2]);
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vsc = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function zoomNow() { const m = ctx.getTransform(); return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1; }
function hair(color, w = HAIR) { ctx.strokeStyle = color; ctx.lineWidth = w / zoomNow(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
function polyPath(P, closed) {
  ctx.beginPath(); if (!P.length) return;
  ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
  if (closed) ctx.closePath();
}
function line3(P3, color = PAL.rim, w = HAIR) { polyPath(P3.map(isoP), false); hair(color, w); ctx.stroke(); }
function hull2(P) {
  const S = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of S) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = S.length - 1; i >= 0; i--) { const p = S[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// glow: run fn with a coloured shadow blur around everything it draws (screen px)
function glow(color, blur, fn) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; fn(); ctx.restore(); }

// ---------------------------------------------------------------------
//  the solid: a rounded rectangle w x d in the plane (a, b) from corner o, extruded h along n.
//  Lit top (or lit big face), a split between the two side faces at the nearest vertical edge, rim light.
//  opt: { r, seg, col, edge, crease, glow, l, rr (side shades), cap (cap shade) }
// ---------------------------------------------------------------------
function isoSlab(o, a, b, n, w, d, h, opt = {}) {
  const r = Math.max(0, Math.min(opt.r ?? 0, w / 2, d / 2));
  const R2 = r > 0.01 ? rrectPts(0, 0, w, d, r, opt.seg ?? 5) : [[0, 0], [w, 0], [w, d], [0, d]];
  const at = (u, v, s = 0) => [o[0] + a[0] * u + b[0] * v + n[0] * h * s, o[1] + a[1] * u + b[1] * v + n[1] * h * s, o[2] + a[2] * u + b[2] * v + n[2] * h * s];
  const front = vdot(n, ISO_VIEW) >= 0 ? 1 : 0;
  const S0 = R2.map(([u, v]) => isoP(at(u, v, 0))), S1 = h > 0 ? R2.map(([u, v]) => isoP(at(u, v, 1))) : S0;
  const col = opt.col ?? PAL.shelf, vertical = Math.abs(n[2]) > 0.7;
  const H = hull2(S0.concat(S1)), xs = H.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  // nearest vertical edge (screen x of the corner nearest the viewer)
  let cx = (x0 + x1) / 2;
  if (vertical) {
    const k = r * 0.2929, mids = [[w - k, k], [w - k, d - k], [k, d - k], [k, k]];
    let bd = -1e9; for (const m of mids) { const q = vdot(at(m[0], m[1], front), ISO_VIEW); if (q > bd) { bd = q; cx = isoP(at(m[0], m[1], front))[0]; } }
  }
  ctx.save();
  if (opt.glow) { ctx.shadowColor = opt.glow; ctx.shadowBlur = opt.glowB ?? 24; }
  polyPath(H, true); ctx.fillStyle = shade(col, 0.7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save(); polyPath(H, true); ctx.clip();
  const sl = opt.l ?? 0.92, sr = opt.rr ?? 0.58, bw = Math.max(1.5, (x1 - x0) * (r > 4 ? 0.05 : 0.004));
  const gx = ctx.createLinearGradient(vertical ? cx - bw : x0, 0, vertical ? cx + bw : x1, 0);
  gx.addColorStop(0, shade(col, vertical ? sl : 0.95)); gx.addColorStop(1, shade(col, vertical ? sr : 0.7));
  ctx.fillStyle = gx; ctx.fillRect(x0 - 2, -10000, cx - x0 + 2 - (vertical ? bw : 0), 20000);
  ctx.fillStyle = vertical ? shade(col, sr) : shade(col, 0.7); ctx.fillRect(cx + (vertical ? bw : 0), -10000, x1 - cx + 2, 20000);
  if (vertical) { ctx.fillStyle = gx; ctx.fillRect(cx - bw, -10000, 2 * bw, 20000); }
  ctx.restore();
  // the cap facing the viewer: the top is the lit face
  const capK = opt.cap ?? (vertical ? 1.22 : 1.0);
  const capP = front ? S1 : S0;
  polyPath(capP, true);
  if (!vertical && h > 0) { const cb = hull2(capP), cy0 = Math.min(...cb.map((p) => p[1])), cy1 = Math.max(...cb.map((p) => p[1])); const gy = ctx.createLinearGradient(0, cy0, 0, cy1); gy.addColorStop(0, shade(col, capK + 0.08)); gy.addColorStop(1, shade(col, capK - 0.08)); ctx.fillStyle = gy; }
  else ctx.fillStyle = shade(col, capK);
  ctx.fill();
  hair(opt.edge ?? PAL.rim, opt.ew ?? 1.4); ctx.stroke();
  polyPath(H, true); hair(withA('#02101f', 0.55), 1.2); ctx.stroke();
  if (vertical && opt.crease !== false && h > 0) {   // a bright edge line at the nearest corner
    const k = r * 0.2929, mids = [[w - k, k], [w - k, d - k], [k, d - k], [k, k]];
    let best = mids[0], bd = -1e9;
    for (const m of mids) { const q = vdot(at(m[0], m[1], front), ISO_VIEW); if (q > bd) { bd = q; best = m; } }
    polyPath([isoP(at(best[0], best[1], front)), isoP(at(best[0], best[1], 1 - front))], false);
    hair(withA('#ffffff', 0.22), 1.3); ctx.stroke();
  }
  ctx.restore();
  return { front, at, w, d, h, cap: capP };
}
function isoBox(x, y, z, w, d, h, o = {}) { return isoSlab([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], w, d, h, o); }
function isoPanelY(x, y, z, w, ht, t, o = {}) { return isoSlab([x, y, z], [1, 0, 0], [0, 0, 1], [0, 1, 0], w, ht, t, o); }
function isoPanelX(x, y, z, d, ht, t, o = {}) { return isoSlab([x, y, z], [0, 1, 0], [0, 0, 1], [1, 0, 0], d, ht, t, o); }
function isoCyl(x, y, z, r, h, o = {}) { return isoSlab([x - r, y - r, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], 2 * r, 2 * r, h, { seg: 10, ...o, r, crease: false }); }
function isoGrid(nx, ny, fn) { for (let s = 0; s <= nx + ny - 2; s++) for (let i = Math.max(0, s - ny + 1); i <= Math.min(nx - 1, s); i++) fn(i, s - i); }

// a soft contact shadow on the ground (a flat dark ellipse): x, y centre, z height of the ground, rx/ry half sizes in world units
function shadowEll(x, y, z, rx, ry, a = 0.38) {
  const P = ellipsePts(x, y, rx, ry, 0, 28).map(([px, py]) => isoP([px, py, z]));
  const c = isoP([x, y, z]); ctx.save();
  const g = ctx.createRadialGradient(c[0], c[1], 1, c[0], c[1], Math.max(rx, ry) * ISO.u);
  g.addColorStop(0, withA('#010a14', a)); g.addColorStop(1, withA('#010a14', 0));
  polyPath(P, true); ctx.fillStyle = g; ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------------
//  faces: flat things on a plane. fp(u, v) -> world point, u right, v DOWN. faceOf(origin top-left, a right, b down)
// ---------------------------------------------------------------------
const faceOf = (o, a, b) => (u, v) => [o[0] + a[0] * u + b[0] * v, o[1] + a[1] * u + b[1] * v, o[2] + a[2] * u + b[2] * v];
function facePath(fp, P2, closed = true) { polyPath(P2.map(([u, v]) => isoP(fp(u, v))), closed); }
function faceRR(fp, x, y, w, h, r, o = {}) {
  facePath(fp, r > 0.01 ? rrectPts(x, y, w, h, Math.min(r, w / 2, h / 2), o.seg ?? 4) : [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.stroke !== false && o.stroke !== undefined) { hair(o.stroke, o.w ?? HAIR); ctx.stroke(); }
}
function faceEll(fp, u, v, rx, ry, o = {}) {
  facePath(fp, ellipsePts(u, v, rx, ry, 0, o.n ?? 24), true);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.stroke) { hair(o.stroke, o.w ?? HAIR); ctx.stroke(); }
}
function faceLine(fp, P2, color = PAL.rim, w = HAIR) { facePath(fp, P2, false); hair(color, w); ctx.stroke(); }
const facePts = (fp, P2) => P2.map(([u, v]) => isoP(fp(u, v)));
// the big face of a standing panel from isoPanelY (front +y): u along x, v down from the top
const panelFaceY = (x, y, z, w, ht, t) => faceOf([x, y + t, z + ht], [1, 0, 0], [0, 0, -1]);
const panelFaceX = (x, y, z, d, ht, t) => faceOf([x + t, y + d, z + ht], [0, -1, 0], [0, 0, -1]);   // the +x face: u runs up-right on screen
const groundFace = (x, y, z) => faceOf([x, y, z], [1, 0, 0], [0, 1, 0]);
// text outside the phone-safe window fades out so it is never cut by the frame edge or hidden under the phone UI
const SAFEBOX = { x0: 50, x1: 945, y0: 250, y1: 1480, ramp: 70 };
function edgeFade(pts) {
  let d = 1e9;
  for (const [x, y] of pts) d = Math.min(d, x - SAFEBOX.x0, SAFEBOX.x1 - x, y - SAFEBOX.y0, SAFEBOX.y1 - y);
  return clamp(d / SAFEBOX.ramp);
}
function isoText(fp, str, u, v, size, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 700} ${size}px ${o.font ?? SANS}`;
  const tw = ctx.measureText(o.count != null ? str.slice(0, Math.max(0, o.count)) : str).width; ctx.restore();
  const ul = o.align === 'center' ? u - tw / 2 : o.align === 'right' ? u - tw : u, ur = ul + tw;
  const fade = edgeFade([[ul, v], [ur, v], [ul, v - size * 0.75], [ur, v - size * 0.75]].map(([a, b]) => toScreen(...isoP(fp(a, b)))));
  if (fade <= 0.02) return;
  const p0 = isoP(fp(0, 0)), pu = isoP(fp(1, 0)), pv = isoP(fp(0, 1));
  ctx.save(); ctx.transform(pu[0] - p0[0], pu[1] - p0[1], pv[0] - p0[0], pv[1] - p0[1], p0[0], p0[1]);
  ctx.font = `${o.weight ?? 700} ${size}px ${o.font ?? SANS}`; ctx.fillStyle = o.color ?? PAL.text;
  ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = (o.al ?? 1) * fade;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 14; }
  ctx.fillText(o.count != null ? str.slice(0, Math.max(0, o.count)) : str, u, v);
  ctx.restore();
}

// ---------------------------------------------------------------------
//  springs (closed form) and small helpers
// ---------------------------------------------------------------------
function spring(t, t0, o = {}) {
  if (t <= t0) return 0;
  const w0 = Math.sqrt(o.k ?? 170), z = Math.min(0.98, o.damp ?? 0.55), wd = w0 * Math.sqrt(1 - z * z), s = t - t0;
  return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + (z * w0 / wd) * Math.sin(wd * s));
}
function kick(t, t0, o = {}) {
  if (t <= t0) return 0;
  const w0 = Math.sqrt(o.k ?? 260), z = Math.min(0.98, o.damp ?? 0.3), wd = w0 * Math.sqrt(1 - z * z), s = t - t0;
  return Math.exp(-z * w0 * s) * Math.sin(wd * s);
}
const blinkOn = (t, period = 1.0, phase = 0) => mod(t + phase, period) < period / 2;
const smoothstep = (t, a, b) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
// a value that follows keys [[t, v], ...] with a smooth ease of length dur starting at each key time
function keyTrack(keys, dur = 0.9) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * smoothstep(TT, keys[i][0], keys[i][0] + dur);
  return v;
}
// a stroked limb through 3D points: dark outline, body colour, a thin highlight offset up-left
function limb(P3, w, col, o = {}) {
  const Q = P3.map(isoP), ww = w * ISO.u;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  polyPath(Q, false); ctx.strokeStyle = withA('#010a14', 0.9); ctx.lineWidth = ww + 3; ctx.stroke();
  polyPath(Q, false); ctx.strokeStyle = shade(col, 0.82); ctx.lineWidth = ww; ctx.stroke();
  polyPath(Q.map(([x, y]) => [x - ww * 0.14, y - ww * 0.12]), false); ctx.strokeStyle = shade(col, o.hi ?? 1.28); ctx.lineWidth = Math.max(1.5, ww * 0.34); ctx.stroke();
  ctx.restore();
}
function ball(P3, r, col) {
  const c = isoP(P3), rr = r * ISO.u; ctx.save();
  const g = ctx.createRadialGradient(c[0] - rr * 0.35, c[1] - rr * 0.4, rr * 0.1, c[0], c[1], rr);
  g.addColorStop(0, shade(col, 1.45)); g.addColorStop(1, shade(col, 0.6));
  ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, TAU); ctx.fillStyle = g; ctx.fill(); hair('rgba(1,10,20,0.8)', 1.3); ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------------
//  an open blue tote (x, y, z = back-bottom corner)
// ---------------------------------------------------------------------
function tote(x, y, z, w = 40, d = 30, h = 20, o = {}) {
  const c = o.col ?? PAL.blue;
  const S = isoBox(x, y, z, w, d, h, { r: 3, col: c });
  faceRR(groundFace(x, y, z + h), 3, 3, w - 6, d - 6, 2, { fill: shade(c, 0.4), stroke: withA('#ffffff', 0.15) });
  if (o.full) isoBox(x + 5, y + 5, z + h - 6, w - 10, d - 10, 8, { r: 2, col: o.full });
  return S;
}

// ---------------------------------------------------------------------
//  the hero: one industrial humanoid, faceless (a visor with a scan light), walking along +x.
//  (x, y, z) = between its feet on the floor; s = scale (1 = about 190 world units tall).
//  o: { phase (walk cycle radians), moving 0..1, col, acc, carry (draw a tote in its arms), wave 0..1 (near arm up),
//       point 0..1 (near arm forward), seed, dim 0..1 (dusty, dulled) }
// ---------------------------------------------------------------------
function robot(x, y, z, s, o = {}) {
  const t = TT, mv = o.moving ?? 0, ph = o.phase ?? 0, sd = o.seed ?? 0;
  let body = o.col ?? PAL.steel, acc = o.acc ?? PAL.amber;
  if (o.dim) { body = mixC(body, '#6d7f8c', o.dim); acc = mixC(acc, '#7a6a52', o.dim); }
  const dark = PAL.joint, mid = PAL.steelD;
  const bob = Math.sin(t * TAU * 0.7 + sd) * 1.1 * s * (1 - mv) + Math.abs(Math.sin(ph)) * 2.4 * s * mv;
  const hipZ = z + 70 * s + bob;
  shadowEll(x + 2 * s, y, z, 40 * s, 30 * s, 0.42);
  const leg = (side) => {
    const a = ph + (side > 0 ? 0 : Math.PI), fx = x + Math.sin(a) * 27 * s * mv, fl = Math.max(0, Math.cos(a)) * 13 * s * mv;
    const fy = y + side * 17 * s, hip = [x, fy, hipZ], foot = [fx, fy, z + 9 * s + fl];
    const knee = [lerp(hip[0], foot[0], 0.5) + 9 * s * (0.4 + 0.6 * mv), fy, lerp(hip[2], foot[2], 0.5)];
    limb([hip, knee, foot], 12 * s, mid);
    ball(knee, 7 * s, dark);
    isoBox(fx - 11 * s, fy - 9 * s, z + fl, 30 * s, 18 * s, 10 * s, { col: dark, r: 5 * s, ew: 1 });
  };
  const sh = (side) => [x, y + side * 31 * s, hipZ + 52 * s];
  const arm = (side) => {
    const S0 = sh(side); let el, ha;
    if (o.carry) { el = [x + 8 * s, y + side * 29 * s, hipZ + 28 * s]; ha = [x + 30 * s, y + side * 21 * s, hipZ + 33 * s]; }
    else if (side > 0 && o.wave) {
      const w = o.wave, sw = Math.sin(t * 9) * 0.35 * w;
      el = [x + 12 * s * w, y + 40 * s, hipZ + (52 - 4 + 30 * w) * s]; ha = [x + 14 * s * w + sw * 14 * s, y + 38 * s, hipZ + (52 + 6 + 50 * w) * s];
    } else if (side > 0 && o.point) {
      const pt = o.point; el = [x + 16 * s * pt, y + 34 * s, hipZ + 36 * s]; ha = [x + (16 + 26) * s * pt + 2 * s, y + 30 * s, hipZ + 38 * s + 6 * s * pt];
    } else {
      const sw = Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.5 * mv, rest = 0.06;
      el = [S0[0] + Math.sin(sw) * 22 * s, S0[1] + side * 5 * s, S0[2] - Math.cos(sw) * 22 * s];
      ha = [el[0] + Math.sin(sw + 0.5 * mv + rest) * 21 * s, el[1] + side * 1 * s, el[2] - Math.cos(sw + 0.5 * mv + rest) * 21 * s];
    }
    limb([S0, el, ha], 10 * s, body);
    ball(el, 6 * s, dark); ball(ha, 7 * s, dark);
  };
  leg(-1); arm(-1);
  isoBox(x - 12 * s, y - 22 * s, hipZ - 6 * s, 24 * s, 44 * s, 16 * s, { col: dark, r: 6 * s, ew: 1 });
  leg(1);
  // torso with a chest plate on the +x face and a lit core
  const tz = hipZ + 8 * s, th = 52 * s;
  isoBox(x - 17 * s, y - 28 * s, tz, 34 * s, 56 * s, th, { col: body, r: 12 * s });
  const fc = panelFaceX(x - 17 * s, y - 28 * s, tz, 56 * s, th, 34 * s);
  faceRR(fc, 8 * s, 8 * s, 40 * s, 30 * s, 6 * s, { fill: withA(dark, 0.55), stroke: withA('#ffffff', 0.14) });
  for (let i = 0; i < 3; i++) faceLine(fc, [[14 * s, (15 + i * 6) * s], [42 * s, (15 + i * 6) * s]], withA('#ffffff', 0.12));
  glow(acc, 16, () => faceEll(fc, 28 * s, 44 * s, 5.5 * s, 5.5 * s, { fill: acc }));
  for (const side of [-1, 1]) ball(sh(side), 9 * s, mid);
  isoCyl(x, y, tz + th, 6 * s, 8 * s, { col: dark });
  // head: a visor and a scan light, no face
  const hz = tz + th + 8 * s;
  isoBox(x - 14 * s, y - 18 * s, hz, 28 * s, 36 * s, 27 * s, { col: body, r: 10 * s });
  const fh = panelFaceX(x - 14 * s, y - 18 * s, hz, 36 * s, 27 * s, 28 * s);
  faceRR(fh, 4 * s, 7 * s, 28 * s, 13 * s, 5 * s, { fill: PAL.visor, stroke: withA(acc, 0.55) });
  const sx = 8 * s + (0.5 + 0.5 * Math.sin(t * 2.2 + sd)) * 14 * s;
  glow(acc, 14, () => faceRR(fh, sx, 11.5 * s, 6 * s, 4 * s, 2 * s, { fill: acc }));
  if (o.carry) {   // the tote rides in the arms, in front of the torso
    tote(x + 20 * s, y - 22 * s, hipZ + 22 * s, 36 * s, 44 * s, 22 * s, { col: o.toteCol });
  }
  arm(1);
  SPARK_AT = toScreen(...isoP([x, y, hipZ + 40 * s]));
}

// a shelving unit along x at y: posts, three shelves, a few totes (x0, y0 back corner, w long along x)
function shelfUnit(x0, y0, w, seed = 0) {
  const d = 52, H = 190;
  isoBox(x0, y0, 0, 8, 8, H, { col: PAL.shelf, r: 2, ew: 1 });
  for (let k = 0; k < 3; k++) {
    const zz = 14 + k * 62;
    isoBox(x0, y0, zz, w, d, 7, { col: shade(PAL.shelf, 1.1), r: 2, ew: 1 });
    const R = RNG('shelf', seed, k);
    for (let i = 0; i < 3; i++) if (R.f() > 0.28) tote(x0 + 12 + i * (w - 24) / 3, y0 + 10, zz + 7, (w - 30) / 3, 32, 14 + R.f() * 18, { col: R.f() > 0.6 ? shade(PAL.blue, 0.8) : shade(PAL.tealD, 1.0) });
  }
  isoBox(x0 + w - 8, y0, 0, 8, 8, H, { col: PAL.shelf, r: 2, ew: 1 });
}

// ---------------------------------------------------------------------
//  captions (DEFER: screen space, after the camera). caption(str, t0, t1, { tag, color, y })
// ---------------------------------------------------------------------
function captionNow(str, t0, t1, o) {
  const a = Math.min(clamp(spring(TT, t0, { k: 160, damp: 0.8 })), 1 - smoothstep(TT, t1 - 0.18, t1));
  if (a <= 0.01 || TT < t0) return;
  const y = o.y ?? 1385, col = o.color ?? PAL.amber;
  ctx.save(); ctx.globalAlpha = clamp(a);
  let sz = o.size ?? 62; ctx.font = `800 ${sz}px ${SANS}`;
  while (ctx.measureText(str).width > 760 && sz > 40) { sz -= 2; ctx.font = `800 ${sz}px ${SANS}`; }
  const w = ctx.measureText(str).width, pw = w + 70, ph = sz * 1.45 + (o.tag ? 40 : 0), x = CX - pw / 2, yy = y + (1 - a) * 22 - ph;
  polyPath(rrectPts(x, yy, pw, ph, 22, 6), true); ctx.fillStyle = 'rgba(5,16,34,0.78)'; ctx.fill(); hair(withA(col, 0.7), 2.2); ctx.stroke();
  ctx.fillStyle = col; polyPath(rrectPts(x + 18, yy + 20, 8, ph - 40, 4, 3), true); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = PAL.text;
  if (o.tag) { ctx.font = `700 28px ${ISOMONO}`; ctx.fillStyle = col; ctx.fillText(o.tag, CX, yy + 44); ctx.fillStyle = PAL.text; ctx.font = `800 ${sz}px ${SANS}`; ctx.fillText(str, CX, yy + ph - sz * 0.38); }
  else ctx.fillText(str, CX, yy + ph * 0.5 + sz * 0.34);
  ctx.restore();
}
const caption = (str, t0, t1, o = {}) => { const f = () => captionNow(str, t0, t1, o); if (DEFER) DEFER.push(f); else f(); };
// a small screen-space tag (e.g. ILLUSTRATIVE) near a world point
function worldTag(P3, str, color = PAL.textD, sz = 26) {
  const p = toScreen(...isoP(P3));
  const f = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `700 ${sz}px ${ISOMONO}`; const w = ctx.measureText(str).width, a = edgeFade([[p[0] - w / 2, p[1]], [p[0] + w / 2, p[1]], [p[0], p[1] - sz]]); if (a > 0.02) { ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.fillText(str, p[0], p[1]); } ctx.restore(); };
  if (DEFER) DEFER.push(f); else f();
}

// =====================================================================
//  STYLE — the renderer's hooks
// =====================================================================
const STYLE = {
  name: 'iso3d',
  paper: PAL.paper,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); polyPath(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); polyPath(P, true); hair(PAL.rim, 2); ctx.stroke(); },
  blob(P, c) { polyPath(P, true); ctx.fillStyle = c; ctx.fill(); },
  hero(x, y, r) { const keep = ISO; setIso({ ox: x, oy: y, u: r / 90 }); robot(0, 0, -95, 1, { key: 'h' }); ISO = keep; },
  heroColor: PAL.steel,
  heroPts(x, y, r, n = 64) { return ellipsePts(x, y, r * 0.5, r, 0, n); },
  post() {   // a soft vignette in screen space
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.28, W / 2, H * 0.5, H * 0.72);
    g.addColorStop(0, 'rgba(2,8,20,0)'); g.addColorStop(1, 'rgba(2,8,20,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  ones: true,
};
