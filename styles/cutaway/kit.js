// =====================================================================
//  styles/cutaway/kit.js — "World in the Making" engineering cutaway
//  Deep navy ground, glowing airflow, transparent hulls, clean vector parts with soft depth.
//  Built on kit/core.js. Helpers carry the `cw` prefix. Needs from the piece head: W, H, CX.
//  Palette meaning: cyan = fresh air, teal = filtered / recirculated, amber = compressed hot air,
//  red = warning only, white = labels.
// =====================================================================
const CW = {
  bg: '#08111f', bg2: '#0d2038', panel: '#112b47', line: '#2f6a9a', cyan: '#3fd8ff', teal: '#22c4a8', amber: '#ffb02e',
  red: '#ff4d5a', white: '#f4f8fb', hull: '#dbe7f2', metal: '#6f8ba6', metal2: '#3c5873', dark: '#050b14', dust: '#9fb3c6',
  skin: ['#e7c3a0', '#c08a62', '#8f5f40', '#f1d3b8'],
};
const CWF = '"Inter","DejaVu Sans",Arial,sans-serif';

const cwRGBA = (h, a) => { if (h[0] === 'r') { const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(h); return `rgba(${m[1]},${m[2]},${m[3]},${a})`; } const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const cwMix = (a, b, u) => mixHex(a, b, clamp(u));
const cwTrace = (P, closed) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (closed) ctx.closePath(); };
const cwFmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Catmull-Rom spline through pts
function cwSpline(pts, steps = 10) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
// a measured path: at(f) gives the point, tan(f) the direction
function cwPath(P) {
  const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + dist(P[i - 1], P[i]));
  const L = cum[cum.length - 1] || 1;
  const find = (f) => { const d = clamp(f) * L; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; return [i, (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1])]; };
  return {
    P, L,
    at(f) { const [i, s] = find(f), a = P[i - 1], b = P[i]; return [lerp(a[0], b[0], s), lerp(a[1], b[1], s)]; },
    tan(f) { const [i] = find(f), a = P[i - 1], b = P[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; },
    sub(f) { return subPath(P, f); },
  };
}

// ---------------------------------------------------------------------
//  ground: navy gradient, faint blueprint grid, parallax dust
// ---------------------------------------------------------------------
let CW_DUST = null;
function cwBG(o = {}) {
  const m = ctx.getTransform();
  ctx.save(); screen();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, o.top ?? '#0d2038'); g.addColorStop(1, o.bot ?? '#060d19');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.glow) {
    const gx = o.gx ?? W / 2, gy = o.gy ?? H * 0.45, r = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 1.0);
    r.addColorStop(0, cwRGBA(o.glow, o.glowA ?? 0.2)); r.addColorStop(1, cwRGBA(o.glow, 0));
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
  if (o.grid !== false) {   // blueprint grid in world space
    ctx.save(); ctx.lineWidth = 1 / m.a; ctx.strokeStyle = cwRGBA(CW.line, 0.13);
    const sp = 120, x0 = Math.floor((-m.e / m.a) / sp) * sp, x1 = (W - m.e) / m.a, y0 = Math.floor((-m.f / m.d) / sp) * sp, y1 = (H - m.f) / m.d;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += sp) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
    for (let y = y0; y <= y1; y += sp) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
    ctx.stroke(); ctx.restore();
  }
  if (!CW_DUST) { const R = RNG('cwdust'); CW_DUST = Array.from({ length: 54 }, () => ({ x: R.f(), y: R.f(), d: 0.15 + 0.6 * R.f(), r: 1 + 2 * R.f(), p: R.f() * TAU })); }
  ctx.save(); screen();
  for (const p of CW_DUST) {
    const sx = mod(p.x * (W + 200) + m.e * p.d * 0.6 - TT * 10 * p.d * (o.drift ?? 1), W + 200) - 100;
    const sy = mod(p.y * (H + 200) + m.f * p.d * 0.6 + Math.sin(TT * 0.7 + p.p) * 12, H + 200) - 100;
    ctx.fillStyle = cwRGBA(CW.dust, 0.06 + 0.22 * p.d * (0.6 + 0.4 * Math.sin(TT * 1.3 + p.p)));
    ctx.beginPath(); ctx.arc(sx, sy, p.r * (0.6 + p.d), 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------
//  glow strokes, particles, flows
// ---------------------------------------------------------------------
function cwGlow(P, c, w, o = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  cwTrace(P, o.closed); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = cwRGBA(c, 0.07 * (o.a ?? 1)); ctx.lineWidth = w * 4.2; ctx.stroke();
  ctx.strokeStyle = cwRGBA(c, 0.16 * (o.a ?? 1)); ctx.lineWidth = w * 2.2; ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = cwRGBA(c, 0.95 * (o.a ?? 1)); ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
function cwDot(x, y, r, c, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = cwRGBA(c, 0.16 * a); ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
  ctx.fillStyle = cwRGBA(c, 0.34 * a); ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = cwRGBA(c, 0.95 * a); ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.fill();
  ctx.restore();
}
// particles riding a measured path. o: n, speed, c (hex or f => hex), r, spread, seed, t0, f0, f1, a, trail
function cwFlow(path, o = {}) {
  const n = o.n ?? 24, sp = o.speed ?? 0.15, r = o.r ?? 4, spread = o.spread ?? 0, seed = o.seed ?? 0, t0 = o.t0 ?? 0, f0 = o.f0 ?? 0, f1 = o.f1 ?? 1;
  const fade = ev(t0, 0.35) * (o.a ?? 1); if (fade <= 0) return;
  for (let i = 0; i < n; i++) {
    const h = hash('fl', seed, i) / 4294967296, f = mod(i / n + (TT - t0) * sp + h * 0.07 + seed * 0.13, 1);
    const pf = lerp(f0, f1, f), [x, y] = path.at(pf), [tx, ty] = path.tan(pf);
    const off = (hash('fo', seed, i) / 4294967296 - 0.5) * 2 * spread;
    const px = x - ty * off, py = y + tx * off;
    const a = Math.min(f / 0.07, (1 - f) / 0.07, 1) * fade;
    const c = typeof o.c === 'function' ? o.c(pf) : (o.c ?? CW.cyan);
    if (o.trail) {
      const [qx, qy] = path.at(Math.max(f0, pf - o.trail)); ctx.save(); ctx.strokeStyle = cwRGBA(c, 0.35 * a); ctx.lineWidth = r * 0.9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(qx - ty * off, qy + tx * off); ctx.lineTo(px, py); ctx.stroke(); ctx.restore();
    }
    cwDot(px, py, r * (0.75 + 0.5 * h), c, a);
  }
}
// a heat colour along a path fraction: amber -> cyan
const cwHeat = (u) => cwMix(CW.amber, CW.cyan, u);
const cwHex = (u) => { const m = /(\d+),(\d+),(\d+)/.exec(cwHeat(u)); return '#' + [1, 2, 3].map((i) => (+m[i]).toString(16).padStart(2, '0')).join(''); };

// ---------------------------------------------------------------------
//  type and labels
// ---------------------------------------------------------------------
function cwText(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${CWF}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha *= o.a ?? 1;
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; }
  ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
// a pill label: popS(t0) scale-in. o: c (accent), size, align
function cwTag(str, x, y, t0, o = {}) {
  const k = o.k ?? popS(t0); if (k <= 0) return 0;
  const size = o.size ?? 38, c = o.c ?? CW.white;
  ctx.save(); ctx.font = `800 ${size}px ${CWF}`;
  const tw = ctx.measureText(str).width, w = tw + size * 1.2, h = size * 1.6;
  const ax = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
  ctx.translate(ax + w / 2, y); ctx.scale(k, k); ctx.globalAlpha *= clamp(k * 1.4) * (o.a ?? 1);
  ctx.fillStyle = cwRGBA(CW.dark, 0.78); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = cwRGBA(c, 0.9); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = CW.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 0, size * 0.04);
  ctx.restore(); return w;
}
// a big number / word with a soft glow
function cwBig(str, x, y, size, c, t0, o = {}) {
  const k = o.k ?? popS(t0); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.globalAlpha *= clamp(k * 1.5);
  ctx.font = `900 ${size}px ${CWF}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = cwRGBA(CW.dark, 0.85); ctx.strokeText(str, 0, 0);
  ctx.shadowColor = cwRGBA(c, 0.8); ctx.shadowBlur = size * 0.35; ctx.fillStyle = c; ctx.fillText(str, 0, 0);
  ctx.restore();
}
// leader line from a point to a label corner
function cwLeader(x0, y0, x1, y1, t0, c = CW.white) {
  const u = EZ.o3(ev(t0, 0.4)); if (u <= 0) return;
  ctx.save(); ctx.strokeStyle = cwRGBA(c, 0.8); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, u), lerp(y0, y1, u)); ctx.stroke();
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x0, y0, 6, 0, TAU); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------------
//  parts: aircraft, people, gauge, engine, pack, filter, valve
// ---------------------------------------------------------------------
function cwHullGrad(y0, y1, a = 1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(240,247,252,${a})`); g.addColorStop(0.55, `rgba(176,198,218,${a})`); g.addColorStop(1, `rgba(98,126,152,${a})`); return g;
}
// side-view airliner facing right, 1000 units long, centred on (x, y). o: cut (transparent hull), tag (e.g. '787')
function cwPlane(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // soft ground shadow for depth
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(10, 230, 420, 20, 0, 0, TAU); ctx.fill();
  const fus = () => { ctx.beginPath(); ctx.moveTo(-500, -8); ctx.bezierCurveTo(-500, -46, -440, -58, -340, -60); ctx.lineTo(350, -60); ctx.bezierCurveTo(445, -60, 508, -26, 518, 4); ctx.bezierCurveTo(508, 32, 450, 52, 360, 54); ctx.lineTo(-290, 54); ctx.bezierCurveTo(-420, 50, -500, 24, -500, -8); ctx.closePath(); };
  // far wing + stab
  ctx.fillStyle = cwHullGrad(40, 160); ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(70, 34); ctx.lineTo(-90, 120); ctx.lineTo(-150, 120); ctx.lineTo(-40, 34); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  // tail fin
  ctx.fillStyle = cwHullGrad(-190, -30); ctx.beginPath(); ctx.moveTo(-330, -52); ctx.lineTo(-455, -200); ctx.lineTo(-395, -200); ctx.lineTo(-250, -52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = CW.cyan; ctx.beginPath(); ctx.moveTo(-416, -160); ctx.lineTo(-455, -200); ctx.lineTo(-395, -200); ctx.lineTo(-380, -178); ctx.closePath(); ctx.fill();
  // stabiliser
  ctx.fillStyle = cwHullGrad(-20, 40); ctx.beginPath(); ctx.moveTo(-370, -2); ctx.lineTo(-500, 34); ctx.lineTo(-455, 34); ctx.lineTo(-300, 6); ctx.closePath(); ctx.fill();
  // fuselage
  fus();
  if (o.cut) {
    ctx.fillStyle = cwRGBA(CW.bg2, 0.72); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = cwRGBA(CW.white, 0.9); ctx.stroke();
  } else {
    ctx.fillStyle = cwHullGrad(-60, 54); ctx.fill();
    ctx.save(); fus(); ctx.clip(); ctx.fillStyle = CW.cyan; ctx.fillRect(-520, 14, 1060, 8); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-520, -52, 1060, 6); ctx.restore();
    ctx.fillStyle = CW.metal2; for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.ellipse(-300 + i * 24, -26, 6.5, 8.5, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = CW.metal2; ctx.beginPath(); ctx.moveTo(420, -34); ctx.quadraticCurveTo(470, -34, 488, -12); ctx.lineTo(430, -12); ctx.closePath(); ctx.fill();
  }
  // near wing and engine
  ctx.fillStyle = cwHullGrad(30, 170, o.cut ? 0.9 : 1); ctx.beginPath(); ctx.moveTo(90, 38); ctx.lineTo(-130, 170); ctx.lineTo(-215, 170); ctx.lineTo(-30, 38); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = cwRGBA(CW.white, 0.5); ctx.lineWidth = 2; ctx.stroke();
  const ex = o.engX ?? -10, ey = 118;
  ctx.fillStyle = cwHullGrad(ey - 36, ey + 36); ctx.beginPath(); ctx.roundRect(ex - 78, ey - 34, 168, 68, 30); ctx.fill();
  ctx.fillStyle = CW.dark; ctx.beginPath(); ctx.ellipse(ex + 88, ey, 12, 28, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = CW.metal2; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(ex - 78, ey - 34, 168, 68, 30); ctx.stroke();
  ctx.restore();
}
// a stylised seated passenger, front view. (x, y) = seat base. o: shirt, skin, s
function cwPerson(x, y, s, o = {}) {
  const sk = o.skin ?? CW.skin[0], sh = o.shirt ?? CW.metal;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = CW.metal2; ctx.beginPath(); ctx.roundRect(-26, -78, 52, 84, 12); ctx.fill();       // seat back
  ctx.fillStyle = sh; ctx.beginPath(); ctx.roundRect(-19, -52, 38, 50, 14); ctx.fill();               // torso
  ctx.fillStyle = sk; ctx.beginPath(); ctx.arc(0, -66, 13, 0, TAU); ctx.fill();                        // head
  if (o.sleeve) { ctx.fillStyle = sk; ctx.fillRect(-27, -44, 9, 26); ctx.fillRect(18, -44, 9, 26); ctx.fillStyle = sh; ctx.fillRect(-27, -50, 10, 12); ctx.fillRect(17, -50, 10, 12); }
  ctx.restore();
}
// dial gauge. val in [lo, hi]; zones [[a, b, colour]]; o: lo, hi, ticks, label, unit, readout
function cwGauge(cx, cy, r, val, o = {}) {
  const lo = o.lo ?? 0, hi = o.hi ?? 16, a0 = 135 * DEG, a1 = 405 * DEG, ang = (v) => lerp(a0, a1, clamp((v - lo) / (hi - lo)));
  ctx.save(); ctx.translate(cx, cy);
  const bg = ctx.createRadialGradient(0, -r * 0.3, r * 0.1, 0, 0, r * 1.1); bg.addColorStop(0, '#16385a'); bg.addColorStop(1, '#0a1626');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 0, r * 1.08, 0, TAU); ctx.fill();
  ctx.strokeStyle = CW.metal; ctx.lineWidth = r * 0.06; ctx.stroke();
  ctx.lineCap = 'butt';
  for (const [a, b, c] of o.zones ?? [[lo, hi, CW.cyan]]) { ctx.strokeStyle = cwRGBA(c, 0.95); ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(0, 0, r * 0.86, ang(a), ang(b)); ctx.stroke(); }
  const step = o.step ?? 2;
  ctx.fillStyle = CW.white; ctx.strokeStyle = CW.white; ctx.font = `800 ${r * 0.15}px ${CWF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let v = lo; v <= hi + 1e-6; v += step) { const a = ang(v), ca = Math.cos(a), sa = Math.sin(a); ctx.lineWidth = r * 0.025; ctx.beginPath(); ctx.moveTo(ca * r * 0.74, sa * r * 0.74); ctx.lineTo(ca * r * 0.66, sa * r * 0.66); ctx.stroke(); ctx.fillText(String(v), ca * r * 0.52, sa * r * 0.52); }
  const a = ang(val), ca = Math.cos(a), sa = Math.sin(a), nc = o.needle ?? CW.white;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.strokeStyle = nc; ctx.lineWidth = r * 0.05; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-ca * r * 0.12, -sa * r * 0.12); ctx.lineTo(ca * r * 0.8, sa * r * 0.8); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = CW.metal; ctx.beginPath(); ctx.arc(0, 0, r * 0.09, 0, TAU); ctx.fill();
  if (o.label) { ctx.fillStyle = cwRGBA(CW.white, 0.85); ctx.font = `800 ${r * 0.13}px ${CWF}`; ctx.fillText(o.label, 0, r * 0.58); }
  if (o.readout) { ctx.fillStyle = o.readoutC ?? CW.white; ctx.font = `900 ${r * 0.2}px ${CWF}`; ctx.fillText(o.readout, 0, r * 0.82); }
  ctx.restore();
}
// turbofan cutaway, nose to the left, centred on (x, y), 760 units long. Returns anchor points.
function cwEngine(x, y, s, o = {}) {
  const spin = TT * (o.spin ?? 9);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // nacelle shell (transparent)
  ctx.fillStyle = cwRGBA(CW.bg2, 0.75); ctx.strokeStyle = cwRGBA(CW.white, 0.9); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-380, -110); ctx.bezierCurveTo(-400, -110, -410, -60, -410, 0); ctx.bezierCurveTo(-410, 60, -400, 110, -380, 110); ctx.lineTo(260, 84); ctx.lineTo(380, 40); ctx.lineTo(380, -40); ctx.lineTo(260, -84); ctx.closePath(); ctx.fill(); ctx.stroke();
  // core duct walls
  const topWall = [[-300, -70], [-120, -62], [20, -50], [120, -34], [190, -28], [340, -22]], botWall = topWall.map(([a, b]) => [a, -b]);
  // fan blades (edge-on): vertical bars with spin shimmer
  for (let i = 0; i < 9; i++) { const k = Math.sin(spin + i * 0.7), h = 96 * (0.55 + 0.45 * Math.abs(k)); ctx.fillStyle = cwRGBA(CW.hull, 0.35 + 0.4 * Math.abs(k)); ctx.fillRect(-330 - 3, -h + (i % 2 ? 0 : 0), 6, h * 2); break; }
  ctx.fillStyle = cwRGBA(CW.hull, 0.8); ctx.beginPath(); ctx.roundRect(-336, -100, 14, 200, 5); ctx.fill();
  for (let i = 0; i < 5; i++) { const yy = -90 + i * 45 + ((spin * 40) % 45); if (yy > -95 && yy < 95) { ctx.fillStyle = cwRGBA(CW.white, 0.35); ctx.fillRect(-336, yy, 14, 4); } }
  // compressor stages: rows of blades that shrink toward the back
  const stages = 8, cStart = -250, cEnd = 70;
  for (let i = 0; i < stages; i++) {
    const u = i / (stages - 1), sx = lerp(cStart, cEnd, u), hh = lerp(64, 22, u);
    const sh = 0.5 + 0.5 * Math.sin(spin * (1 + u * 0.4) + i);
    for (const sg of [-1, 1]) { ctx.fillStyle = cwRGBA(cwHex(1 - u * (o.heat ?? 1)), 0.55 + 0.35 * sh); ctx.fillRect(sx - 4, sg > 0 ? -hh - 2 : 2 - 0, 8, hh); }
    ctx.fillStyle = cwRGBA(CW.metal, 0.9); ctx.fillRect(sx - 3, -4, 6, 8);
  }
  // shaft
  ctx.fillStyle = CW.metal; ctx.fillRect(-330, -5, 650, 10);
  // combustor glow, turbine
  const gl = ctx.createRadialGradient(130, 0, 6, 130, 0, 80); gl.addColorStop(0, cwRGBA(CW.amber, 0.9)); gl.addColorStop(1, cwRGBA(CW.amber, 0));
  ctx.fillStyle = gl; ctx.fillRect(50, -80, 160, 160);
  for (let i = 0; i < 3; i++) { const sx = 230 + i * 36, hh = 30 + i * 4, sh = 0.5 + 0.5 * Math.sin(spin * 1.3 + i * 2); ctx.fillStyle = cwRGBA(CW.amber, 0.45 + 0.4 * sh); ctx.fillRect(sx - 3, -hh, 6, hh * 2 - 8); }
  // duct outlines
  ctx.strokeStyle = cwRGBA(CW.hull, 0.45); ctx.lineWidth = 3; cwTrace(topWall, false); ctx.stroke(); cwTrace(botWall, false); ctx.stroke();
  ctx.restore();
  const T = (px, py) => [x + px * s, y + py * s];
  return { inlet: T(-430, 0), bleed: T(-40, -62), exhaust: T(380, 0), top: T(0, -110) };
}
// pleated filter slab centred on (x, y), width w. Returns the filter line y.
function cwFilter(x, y, w, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = cwRGBA(CW.metal2, 0.9); ctx.beginPath(); ctx.roundRect(-w / 2 - 18, -26, w + 36, 52, 12); ctx.fill();
  ctx.strokeStyle = CW.hull; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.beginPath();
  const n = o.pleats ?? 14, pw = w / n;
  for (let i = 0; i <= n; i++) { const px = -w / 2 + i * pw, py = i % 2 ? 20 : -20; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
  ctx.strokeStyle = cwRGBA(CW.teal, 0.55); ctx.lineWidth = 1.6; for (let i = 0; i <= n; i++) { const px = -w / 2 + i * pw; ctx.beginPath(); ctx.moveTo(px, -18); ctx.lineTo(px, 18); ctx.stroke(); }
  ctx.restore();
}
// spinning disc (compressor / turbine / fan seen face-on). o: spin, c
function cwDisc(x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#6c8eac'); g.addColorStop(1, '#2a4560');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.strokeStyle = o.c ?? CW.white; ctx.lineWidth = 4; ctx.stroke();
  ctx.rotate(TT * (o.spin ?? 6)); const n = o.blades ?? 12;
  for (let i = 0; i < n; i++) { ctx.rotate(TAU / n); ctx.fillStyle = cwRGBA(o.c ?? CW.white, 0.75); ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.05); ctx.lineTo(r * 0.92, -r * 0.2); ctx.lineTo(r * 0.92, -r * 0.08); ctx.lineTo(r * 0.2, r * 0.08); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = CW.metal; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, TAU); ctx.fill();
  ctx.restore();
}
// heat exchanger block: fins; o.flow draws cross-flow ticks
function cwExchanger(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = cwRGBA(CW.metal2, 0.95); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = cwRGBA(o.c ?? CW.hull, 0.75); ctx.lineWidth = 2.5;
  for (let i = 1; i < 10; i++) { const yy = -h / 2 + (h / 10) * i; ctx.beginPath(); ctx.moveTo(-w / 2 + 8, yy); ctx.lineTo(w / 2 - 8, yy); ctx.stroke(); }
  ctx.lineWidth = 4; ctx.strokeStyle = CW.hull; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 12); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------
//  captions: phrase by phrase from the voice, drawn after everything (post)
// ---------------------------------------------------------------------
function cwCaptions() {
  if (typeof CARD0 !== "undefined" && TT >= CARD0) return;
  if (typeof VOICE === 'undefined' || !VOICE.lines) return;
  const t = TT; let words = null;
  for (const L of VOICE.lines) if (t >= L.t0 - 0.05 && t <= L.t1 + 0.35) { words = L.words; break; }
  if (!words || !words.length) return;
  const chunks = []; let cur = [];
  for (const w of words) { cur.push(w); if (/[.?!,]$/.test(w.w) || cur.length >= 6) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let ch = chunks.find((c) => t >= c[0].t0 - 0.05 && t <= c[c.length - 1].t1 + 0.12);
  if (!ch) return;
  const KEY = /^(minus|fifty-four|thirty-five|thousand|quarter|eight|six|sealed|bleed|hot|cool|cyan|amber|HEPA|filters|recirculates|outflow|valve|pressure|horn|masks|fourteen|ten|seven|electric|stale|squeeze|expand|chills)/i;
  const txt = ch.map((w) => w.w);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `800 54px ${CWF}`; ctx.textBaseline = 'alphabetic';
  const sp = 54 * 0.3, ws = txt.map((s) => ctx.measureText(s).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (txt.length - 1);
  const k = Math.min(1, 840 / tot), u = ev(ch[0].t0 - 0.05, 0.14);
  ctx.translate(CX, 1432 + (1 - EZ.o3(u)) * 14); ctx.scale(k, k); ctx.globalAlpha = u;
  let x = -tot / 2;
  const bw = tot + 56, bh = 84; ctx.fillStyle = cwRGBA(CW.dark, 0.55); ctx.beginPath(); ctx.roundRect(-bw / 2, -58, bw, bh, 22); ctx.fill();
  ctx.textAlign = 'left';
  txt.forEach((s, i) => {
    const hot = KEY.test(s.replace(/[^\w-]/g, ''));
    ctx.fillStyle = hot ? CW.amber : CW.white; ctx.fillText(s, x, 0); x += ws[i] + sp;
  });
  ctx.restore();
}

// =====================================================================
//  STYLE hooks (the renderer's contract). Eras are hard cuts joined by dives in post().
// =====================================================================
const STYLE = {
  name: 'cutaway',
  paper: CW.bg,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); cwTrace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); cwTrace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero(x, y, r) { cwDot(x, y, r * 0.5, CW.cyan, 1); },
  heroColor: CW.cyan,
  post() {
    if (typeof cwPost === 'function') cwPost();
    cwCaptions();
  },
  ones: true,
};
