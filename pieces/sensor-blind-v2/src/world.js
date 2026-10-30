// =====================================================================
//  WORLD — shared geometry, weather curves, the three tracked things, and the top panel (what you see).
//  Both panels use one projection: pj(X, Y, Z) -> panel pixels. X right (m), Y up (m), Z ahead (m).
// =====================================================================
const PX = 40, PW = 1000, PH = 610, TOPY = 250, BOTY = 890;
const F0 = 820, Y0 = 244, CH = 1.3;
let CAMX = 0, CAMY = 0;
// panel layout: after the payoff the top panel shrinks to a strip and the bottom panel grows (tl 0..1)
let CF0 = F0, CY0 = Y0, SPH = PH, TOPH = PH, BOTYv = BOTY;
const LAYOUT = { tl: 0 };
function setLayout(tl) { LAYOUT.tl = tl; TOPH = lerp(PH, 190, tl); SPH = lerp(PH, 940, tl); BOTYv = TOPY + TOPH + 30; }
const pj = (X, Y, Z) => [PW / 2 + CF0 * (X - CAMX) / Z, CY0 + CAMY + CF0 * (CH - Y) / Z];
// integer hash -> 0..1, no state: the only randomness in the piece
const hh = (i, s = 0) => { let x = Math.imul(i + 1, 374761393) ^ Math.imul(s + 7, 668265263); x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };

function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], smooth(keys[i - 1][0], keys[i][0], t));
  return keys[keys.length - 1][1];
}
// weather the human sees (rain, fog) and the one number every sensor derives from (D)
const RAIN_K = [[0, 0], [T.rain - 0.3, 0], [T.rain + 1.2, 0.45], [T.cam + 2, 0.6], [T.lidar + 6, 0.78], [T.fog, 0.85], [T.blind, 1], [T.callback, 1], [DURATION, 0.6]];
const FOG_K = [[0, 0], [T.cam - 0.3, 0], [T.cam + 3, 0.2], [T.lidar + 6, 0.3], [T.fog, 0.42], [T.quiet, 0.97], [T.blind, 1], [T.callback, 1], [DURATION, 0.85]];
const D_K = [[0, 0], [T.rain, 0.02], [T.cam, 0.2], [T.cam + 2.6, 0.6], [T.lidar + 2, 0.62], [T.lidar + 8, 0.85], [T.fog, 0.88], [T.fog + 4, 0.93], [T.quiet, 0.97], [T.blind, 1]];
const rainAt = (t) => keyed(RAIN_K, t), fogAt = (t) => keyed(FOG_K, t), Dat = (t) => (t >= T.blind ? 1 : keyed(D_K, t));
const killAt = (t) => (t < T.blind ? 0 : 1);
const betaOf = (rain, fog) => 0.003 + 0.09 * fog + 0.012 * rain;   // how fast the human view loses an object with distance

// the three tracked things: two cars and a cyclist
const OBJ = [
  { id: '01', kind: 'car', name: 'CAR', X: 0.0, Z0: 17, sens: 0.9, ph: 0.0 },
  { id: '02', kind: 'car', name: 'CAR', X: -3.6, Z0: 30, sens: 1.2, ph: 1.7 },
  { id: '03', kind: 'cyc', name: 'CYCLIST', X: 4.5, Z0: 11, sens: 1.0, ph: 0.6 },
];
const objZ = (o, t) => o.Z0 + 2.4 * Math.sin(t * 0.45 + o.ph);
const objConf = (o, t, D = Dat(t)) => clamp(1.15 - 1.25 * D * o.sens * (0.4 + objZ(o, t) / 60)) * (1 - killAt(t));

// ---- car, cyclist, street light (human view)
function carRear(X, Z, vis, w, brake) {
  const [xl, yt] = pj(X - 0.93, 1.45, Z), [xr, yb] = pj(X + 0.93, 0.18, Z), wp = xr - xl, hp = yb - yt;
  ctx.save(); ctx.globalAlpha = vis;
  ctx.fillStyle = '#1a2027'; ctx.beginPath(); ctx.roundRect(xl, yt + hp * 0.3, wp, hp * 0.7, wp * 0.07); ctx.fill();
  ctx.fillStyle = '#10151a'; ctx.beginPath(); ctx.moveTo(xl + wp * 0.16, yt); ctx.lineTo(xr - wp * 0.16, yt); ctx.lineTo(xr - wp * 0.04, yt + hp * 0.36); ctx.lineTo(xl + wp * 0.04, yt + hp * 0.36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120,150,180,0.12)'; ctx.fillRect(xl + wp * 0.2, yt + hp * 0.05, wp * 0.6, hp * 0.04);
  ctx.fillStyle = '#e8edf0'; ctx.fillRect(X * 0 + (xl + xr) / 2 - wp * 0.09, yt + hp * 0.7, wp * 0.18, hp * 0.09);
  ctx.restore();
  const la = Math.max(vis, 0.9 * Math.exp(-betaOf(w.rain, w.fog) * 0.3 * Z)), sz = Math.max(2, wp * 0.12);
  for (const s of [-1, 1]) {
    const [lx, ly] = pj(X + s * 0.7, 0.9, Z);
    svGlow(lx, ly, sz * (2.6 + 6 * w.fog + (brake ? 2 : 0)), '255,40,30', (brake ? 0.8 : 0.5) * la);
    ctx.save(); ctx.globalAlpha = la; ctx.fillStyle = brake ? '#ff5a4a' : '#d3261c'; ctx.fillRect(lx - sz * 0.9, ly - sz * 0.35, sz * 1.8, sz * 0.7); ctx.restore();
  }
  if (w.rain > 0.2) { const [cx0, cy0] = pj(X, 0, Z); const g = ctx.createLinearGradient(0, cy0, 0, cy0 + hp * 0.9); g.addColorStop(0, `rgba(255,60,40,${0.22 * la * w.rain})`); g.addColorStop(1, 'rgba(255,60,40,0)'); ctx.fillStyle = g; ctx.fillRect(cx0 - wp * 0.35, cy0, wp * 0.7, hp * 0.9); }
}
function cyclistRear(X, Z, vis, w, t) {
  const k = F0 / Z, [bx, by] = pj(X, 0, Z);
  ctx.save(); ctx.globalAlpha = vis;
  ctx.strokeStyle = '#2a323a'; ctx.lineWidth = Math.max(1.5, 0.05 * k);
  ctx.beginPath(); ctx.ellipse(bx, by - 0.35 * k, 0.05 * k, 0.35 * k, 0, 0, TAU); ctx.stroke();
  const sw = Math.sin(t * 9);
  ctx.fillStyle = '#12171c'; ctx.beginPath(); ctx.roundRect(bx - 0.2 * k, by - 1.55 * k, 0.4 * k, 0.8 * k, 0.1 * k); ctx.fill();
  ctx.fillStyle = '#0e1318'; ctx.fillRect(bx - 0.17 * k + sw * 0.05 * k, by - 0.8 * k, 0.12 * k, 0.55 * k); ctx.fillRect(bx + 0.05 * k - sw * 0.05 * k, by - 0.8 * k, 0.12 * k, 0.55 * k);
  ctx.beginPath(); ctx.arc(bx, by - 1.75 * k, 0.13 * k, 0, TAU); ctx.fillStyle = '#1c232a'; ctx.fill();
  ctx.fillStyle = 'rgba(200,255,90,0.55)'; ctx.fillRect(bx - 0.2 * k, by - 1.4 * k, 0.4 * k, 0.07 * k); ctx.fillRect(bx - 0.2 * k, by - 1.2 * k, 0.4 * k, 0.07 * k);
  ctx.restore();
  const la = Math.max(vis, 0.8 * Math.exp(-betaOf(w.rain, w.fog) * 0.3 * Z)), on = Math.floor(t * 4) % 2 === 0;
  if (on) svGlow(bx, by - 0.7 * k, Math.max(4, 0.35 * k) * (1 + 4 * w.fog), '255,50,40', 0.7 * la);
}
function streetLight(X, Z, w) {
  const [bx, by] = pj(X, 0, Z), [tx, ty] = pj(X, 7, Z), a = Math.exp(-betaOf(w.rain, w.fog) * 0.4 * Z);
  ctx.save(); ctx.globalAlpha = 0.5 * Math.exp(-betaOf(w.rain, w.fog) * Z); ctx.strokeStyle = '#1a222a'; ctx.lineWidth = Math.max(1, 0.12 * F0 / Z); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke(); ctx.restore();
  svGlow(tx, ty, clamp(F0 * 1.3 / Z, 5, 80) * (1 + 2.4 * w.fog), '255,214,150', 0.75 * a);
  if (w.rain > 0.15) { const g = ctx.createLinearGradient(0, by, 0, by + 70); g.addColorStop(0, `rgba(255,214,150,${0.25 * a * w.rain})`); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(bx - 4, by, 8, 70); }
}

// ---- the top panel: what you see
function topView(t) {
  const w = { rain: rainAt(t), fog: fogAt(t) }, beta = betaOf(w.rain, w.fog);
  CAMX = 0.1 * Math.sin(t * 0.6); CAMY = 3 * Math.sin(t * 1.3) + (w.rain > 0.3 ? 1.5 * Math.sin(t * 11) : 0);
  const hy = Y0 + CAMY;
  CF0 = F0; CY0 = Y0;
  ctx.save(); ctx.translate(PX, TOPY); ctx.beginPath(); ctx.roundRect(0, 0, PW, TOPH, 18); ctx.clip();
  ctx.save(); ctx.translate(0, -LAYOUT.tl * 170);
  let g = ctx.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, '#020409'); g.addColorStop(1, '#0f1823'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, hy + 2);
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, hy, PW, PH - hy);
  svGlow(PW / 2, hy, 430, '255,170,90', 0.17);
  // road
  const rp = [pj(-5.25, 0, 400), pj(5.25, 0, 400), pj(5.25, 0, 1.7), pj(-5.25, 0, 1.7)];
  g = ctx.createLinearGradient(0, hy, 0, PH); g.addColorStop(0, '#0a0e13'); g.addColorStop(1, '#1d252d'); ctx.fillStyle = g;
  ctx.beginPath(); rp.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
  ctx.save(); const [hx, hyy] = pj(0, 0, 9); ctx.translate(hx, hyy); ctx.scale(1.7, 0.5); svGlow(0, 0, 330, '255,244,214', 0.2 + 0.1 * w.rain); ctx.restore();
  // lane dashes and edge lines
  const sp = mod(t * 24, 14);
  ctx.fillStyle = '#d9e2e8';
  for (let j = 0; j < 16; j++) for (const X of [-1.75, 1.75]) {
    const za = Math.max(1.8, j * 14 + 2 - sp), zb = j * 14 + 6 - sp; if (zb < 1.8) continue;
    const a = pj(X - 0.07, 0, za), b = pj(X + 0.07, 0, za), c = pj(X + 0.07, 0, zb), d = pj(X - 0.07, 0, zb);
    ctx.globalAlpha = 0.8 * Math.exp(-beta * za); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.lineTo(...d); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const X of [-5.25, 5.25]) { const a = pj(X, 0, 400), b = pj(X, 0, 1.7); ctx.strokeStyle = '#8a97a1'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // street lights, far to near, with the objects sorted among them
  const lights = [];
  for (let k = 0; k < 6; k++) { const Z = mod(k * 30 + 12 - t * 24, 180) + 2.5; if (Z > 2.6) for (const X of [-7.2, 7.2]) lights.push({ Z, X }); }
  const things = OBJ.map((o) => ({ o, Z: objZ(o, t) })).concat(lights.map((l) => ({ l, Z: l.Z }))).sort((a, b) => b.Z - a.Z);
  for (const it of things) {
    if (it.l) { streetLight(it.l.X, it.Z, w); continue; }
    const vis = Math.exp(-beta * it.Z);
    if (it.o.kind === 'car') carRear(it.o.X, it.Z, vis, w, Dat(t) > 0.8 && it.o.id === '01'); else cyclistRear(it.o.X, it.Z, Math.min(1, vis * 1.1), w, t);
  }
  // fog: a flat veil, a bright core from the headlights, thicker at the horizon
  if (w.fog > 0.001) {
    const a = Math.min(0.93, 0.95 * Math.pow(w.fog, 1.15));
    ctx.fillStyle = `rgba(190,200,208,${a})`; ctx.fillRect(0, 0, PW, PH);
    svGlow(PW / 2, hy + 60, 520, '236,241,246', 0.6 * w.fog);
    g = ctx.createLinearGradient(0, hy - 150, 0, hy + 150); g.addColorStop(0, 'rgba(210,218,225,0)'); g.addColorStop(0.5, `rgba(214,222,229,${0.5 * w.fog})`); g.addColorStop(1, 'rgba(210,218,225,0)'); ctx.fillStyle = g; ctx.fillRect(0, hy - 150, PW, 300);
  }
  // rain streaks
  if (w.rain > 0.01) {
    const n = Math.floor(420 * w.rain);
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = w.fog > 0.5 ? 'rgba(90,105,120,0.4)' : (pass ? 'rgba(210,225,240,0.32)' : 'rgba(210,225,240,0.14)'); ctx.lineWidth = pass ? 1.8 : 1.1; ctx.beginPath();
      for (let i = pass; i < n; i += 2) {
        const sp2 = 700 + 500 * hh(i, 2), len = 24 + 44 * hh(i, 3), x = hh(i, 1) * (PW + 200) - 100, y = mod(hh(i, 4) * (PH + 200) + t * sp2, PH + 200) - 100;
        ctx.moveTo(x, y); ctx.lineTo(x - len * 0.18, y + len);
      }
      ctx.stroke();
    }
  }
  // windshield drops and the wiper
  const P = 2.0, pvx = PW * 0.62, pvy = PH + 60, L = 700, wipe = w.rain > 0.12;
  const sweepS = (ph) => (ph < 0.5 ? ph / 0.5 : 1 - (ph - 0.5) / 0.5);
  if (w.rain > 0.02) {
    const nD = 150;
    for (let i = 0; i < nD; i++) {
      if (i / nD > w.rain) break;
      const x = 30 + hh(i, 11) * (PW - 60), y = 30 + hh(i, 12) * (PH - 80), r0 = 3 + 8 * hh(i, 13) * hh(i, 13);
      let age = 99;
      if (wipe) {
        const th = Math.atan2(y - pvy, x - pvx), s = clamp(((th < 0 ? th + TAU : th) - Math.PI) / Math.PI);
        const c = Math.floor(t / P); let last = -1e9;
        for (const cand of [c * P + P * 0.5 * s, c * P + P * (1 - 0.5 * s), (c - 1) * P + P * (1 - 0.5 * s)]) if (cand <= t && cand > last) last = cand;
        if (Math.hypot(x - pvx, y - pvy) < L) age = t - last; else age = 99;
        age = Math.min(age, 99);
      }
      const delay = 0.15 + 1.4 * hh(i, 14); if (age < delay) continue;
      const r = r0 * Math.min(1, (age - delay) / 0.9 + 0.35), yy = y + Math.min(40, Math.max(0, age - 1.4) * 14 * hh(i, 15));
      ctx.fillStyle = 'rgba(190,210,230,0.10)'; ctx.beginPath(); ctx.ellipse(x, yy, r, r * 1.25, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x - r * 0.3, yy - r * 0.45, Math.max(0.8, r * 0.18), 0, TAU); ctx.fill();
    }
  }
  if (wipe) {
    const ph = mod(t, P) / P, th = Math.PI + sweepS(ph) * Math.PI;
    ctx.strokeStyle = '#07090b'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pvx, pvy); ctx.lineTo(pvx + L * Math.cos(th), pvy + L * Math.sin(th)); ctx.stroke();
    ctx.strokeStyle = 'rgba(160,175,190,0.25)'; ctx.lineWidth = 3; ctx.stroke(); ctx.lineCap = 'butt';
  }
  ctx.restore();
  // dashcam vignette and chips
  g = ctx.createRadialGradient(PW / 2, TOPH / 2, TOPH * 0.35, PW / 2, TOPH / 2, PW * 0.65); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, TOPH);
  svPill('YOU SEE', 22, 40, 26, '#ffffff', 'rgba(0,0,0,0.6)');
  if (Math.floor(t * 1.5) % 2 === 0) { ctx.fillStyle = SV.red; ctx.beginPath(); ctx.arc(PW - 170, 40, 8, 0, TAU); ctx.fill(); }
  svText('REC', PW - 152, 49, 24, '#ffffff', { weight: 700, alpha: 0.85 });
  ctx.restore();
  ctx.save(); ctx.strokeStyle = SV.edge; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(PX, TOPY, PW, TOPH, 18); ctx.stroke(); ctx.restore();
}
