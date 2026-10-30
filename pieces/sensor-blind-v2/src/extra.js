// =====================================================================
//  EXTRA (v2) — cold open and rewind, the big track counter, the droplet-echo demo, the fog-chamber stat,
//  the "fail differently" cards, and the finale. All pure functions of the time passed in.
// =====================================================================
function bigCounter(n, total) {
  const col = n === total ? SV.green : n > 0 ? SV.amber : SV.red, y0 = SPH - 190;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.68)'; ctx.beginPath(); ctx.roundRect(16, y0, 280, 164, 12); ctx.fill(); ctx.restore();
  svText(`${n}/${total}`, 34, y0 + 108, 116, col, { font: MONO, weight: 800 });
  svText('TRACKED', 38, y0 + 148, 26, SV.dim, { font: MONO, weight: 700 });
}

// ---- cold open: the blackout first, then the picture rewinds to the clear road
function coldTime(t) {
  const tb = T.blind + 0.12;
  if (t < T.rewind) return tb + t;
  const u = clamp((t - T.rewind) / (T.story - T.rewind));
  return lerp(tb + T.rewind, 0.8, EZ.io(u));
}
function rewindOverlay(t) {
  const u = clamp((t - T.rewind) / (T.story - T.rewind));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
  for (let i = 0; i < 9; i++) { const y = TOPY + hh(i, F + 70) * (BOTY + PH - TOPY), hgt = 4 + 18 * hh(i, F + 71); ctx.fillStyle = `rgba(255,255,255,${0.10 + 0.14 * hh(i, F + 72)})`; ctx.fillRect(PX, y, PW, hgt); }
  const a = 1 - smooth(0.85, 1, u);
  svPill('◀◀ REWINDING', W / 2, TOPY + PH + 15, 36, '#ffffff', 'rgba(0,0,0,0.78)', { align: 'center', alpha: a, stroke: 'rgba(255,255,255,0.5)' });
  ctx.restore();
}

// ---- the droplet echo: why rain fools LiDAR (side view, slow motion)
function sideCar(x, y, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#1d2832'; ctx.strokeStyle = '#9fb3c3'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x - 62, y - 50, 124, 38, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 36, y - 50); ctx.lineTo(x - 22, y - 78); ctx.lineTo(x + 28, y - 78); ctx.lineTo(x + 46, y - 50); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const dx of [-36, 36]) { ctx.beginPath(); ctx.arc(x + dx, y - 12, 14, 0, TAU); ctx.fillStyle = '#0a0f14'; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function echoDemo(u, t) {
  sensorBase('#03060a');
  const ay = SPH * 0.56, x0 = 110, sc = 18.4, X = (m) => x0 + m * sc;
  // axis and ticks
  ctx.strokeStyle = 'rgba(160,190,210,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(X(46), ay); ctx.stroke();
  for (let m = 0; m <= 40; m += 10) { ctx.beginPath(); ctx.moveTo(X(m), ay - 8); ctx.lineTo(X(m), ay + 8); ctx.stroke(); svText(`${m} m`, X(m), ay + 38, 24, SV.dim, { align: 'center', font: MONO, weight: 700 }); }
  // the sensor
  ctx.fillStyle = '#d7e1e8'; ctx.beginPath(); ctx.roundRect(x0 - 62, ay - 26, 52, 52, 8); ctx.fill(); svGlow(x0 - 36, ay, 40, '255,255,255', 0.35);
  // the real car, fading as the rain closes in
  const ca = u < 6.6 ? 1 : lerp(1, 0.1, clamp((u - 6.6) / 3.4));
  sideCar(X(40), ay + 40, ca);
  svText(ca < 0.5 ? 'REAL CAR 40 m: FADING' : 'REAL CAR 40 m', X(40) - 40, ay + 118, 24, SV.green, { align: 'center', font: MONO, weight: 700, alpha: 0.4 + 0.6 * ca });
  // droplets
  const dk = EZ.o2(clamp((u - 3.0) / 0.8));
  for (let i = 0; i < 70; i++) {
    const x = X(1.0 + 4.6 * hh(i, 1)), y = ay + (hh(i, 2) - 0.5) * 190 + 6 * Math.sin(t * 2 + i), r = 3 + 6 * hh(i, 3);
    ctx.globalAlpha = dk * (0.3 + 0.45 * hh(i, 4)); ctx.fillStyle = 'rgba(150,200,240,0.5)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (dk > 0.2) svText('RAINDROPS', X(3.4), ay - 130, 24, '#9bd0ff', { align: 'center', font: MONO, weight: 700, alpha: dk });
  // pulses
  const PU = [{ t0: 0.4, out: 1.1, back: 1.1, m: 40, k: 'car', att: 1 }, { t0: 3.6, out: 0.35, back: 0.35, m: 3, k: 'ghost' }];
  [2.2, 4.4, 3.6, 5.2, 2.8, 4.9].forEach((m, i) => PU.push({ t0: 5.2 + i * 0.7, out: 0.3, back: 0.3, m, k: 'ghost' }));
  PU.push({ t0: 6.0, out: 1.1, back: 1.1, m: 40, k: 'car', att: 0.45 }, { t0: 8.2, out: 1.1, back: 1.1, m: 40, k: 'car', att: 0.18 });
  const ghosts = [];
  for (const p of PU) {
    const dt = u - p.t0; if (dt < 0) continue;
    const col = p.k === 'ghost' ? SV.red : '#ffffff', att = p.att ?? 1;
    if (dt < p.out) { const x = X(p.m * dt / p.out); svGlow(x, ay, 36, '255,255,255', 0.6 * att); ctx.fillStyle = col; ctx.globalAlpha = att; ctx.beginPath(); ctx.arc(x, ay, 9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    else if (dt < p.out + p.back) { const x = X(p.m * (1 - (dt - p.out) / p.back)); svGlow(x, ay, 30, p.k === 'ghost' ? '255,59,59' : '44,255,122', 0.6 * att); ctx.fillStyle = p.k === 'ghost' ? SV.red : SV.green; ctx.globalAlpha = att; ctx.beginPath(); ctx.arc(x, ay, 8, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    if (dt >= p.out && dt < p.out + 0.18) { const x = X(p.m); ctx.strokeStyle = col; ctx.globalAlpha = att * (1 - (dt - p.out) / 0.18); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, ay, 12 + 40 * (dt - p.out) / 0.18, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    if (dt >= p.out + p.back && p.k === 'ghost') ghosts.push(p);
  }
  ghosts.forEach((p, i) => { const x = X(p.m); ctx.fillStyle = SV.red; ctx.beginPath(); ctx.moveTo(x, ay - 26 - (i % 3) * 14); ctx.lineTo(x + 9, ay - 14 - (i % 3) * 14); ctx.lineTo(x, ay - 2 - (i % 3) * 14); ctx.lineTo(x - 9, ay - 14 - (i % 3) * 14); ctx.closePath(); ctx.fill(); });
  if (u >= 2.7) { ctx.fillStyle = SV.green; ctx.beginPath(); ctx.moveTo(X(40), ay - 22); ctx.lineTo(X(40) + 9, ay - 10); ctx.lineTo(X(40), ay + 2); ctx.lineTo(X(40) - 9, ay - 10); ctx.closePath(); ctx.globalAlpha = ca; ctx.fill(); ctx.globalAlpha = 1; }
  // the stopwatch
  let val = null, res = null, rcol = SV.green;
  if (u >= 0.4 && u < 5.0) {
    if (u < 3.4) { val = 267 * clamp((u - 0.4) / 2.2); if (u >= 2.6) res = '= 40 m'; }
    else { val = u < 3.6 ? 0 : 20 * clamp((u - 3.6) / 0.7); if (u >= 4.3) { res = '= 3 m   GHOST'; rcol = SV.red; } }
  }
  svText('ECHO TIME', PW / 2, 150, 26, SV.dim, { align: 'center', font: MONO, weight: 700 });
  svText(val == null ? '--' : `${Math.round(val)} ns`, PW / 2 - (res ? 140 : 0), 228, 76, val != null && u >= 3.4 ? SV.red : '#ffffff', { align: 'center', font: MONO, weight: 800 });
  if (res) svText(res, PW / 2 + 190, 228, 52, rcol, { align: 'center', font: MONO, weight: 800 });
  if (u > 5.6) svText(`${ghosts.length} FALSE POINTS`, PW / 2, SPH - 120, 40, SV.red, { align: 'center', font: MONO, weight: 800, alpha: 0.9 });
  svPill('LiDAR PULSE · SLOW MOTION', 22, 40, 24, '#04070a', SV.ink);
}

// ---- the fog-chamber number, laid over the drive view
function statOverlay(u) {
  const k = EZ.back(clamp(u / 0.4)), n = Math.round(50 * EZ.io(clamp((u - 1.7) / 1.6))), bw = 500;
  ctx.save(); ctx.translate(600, SPH * 0.62); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.beginPath(); ctx.roundRect(-300, -150, 600, 300, 16); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke();
  svText('TARGET DETECTION · ONE FOG CHAMBER TEST', 0, -108, 24, SV.dim, { align: 'center', font: MONO, weight: 700 });
  svText(`-${n}%`, 0, 6, 132, SV.red, { align: 'center', font: MONO, weight: 800 });
  ctx.fillStyle = SV.green; ctx.fillRect(-bw / 2, 40, bw, 20); svText('CLEAR', -bw / 2, 90, 22, SV.green, { font: MONO, weight: 700 });
  ctx.fillStyle = SV.red; ctx.fillRect(-bw / 2, 100, bw * (1 - n / 100), 20); svText('FOG', -bw / 2, 150 - 6, 22, SV.red, { font: MONO, weight: 700 });
  svText('IEEE ITSC 2018', 290, 140, 18, SV.dim, { align: 'right', font: MONO, weight: 700 });
  ctx.restore();
}

// ---- "sensors that fail differently": four cards, four weak spots
function sensorGlyph(kind, cx, cy, col, t) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
  if (kind === 'cam') { ctx.beginPath(); ctx.roundRect(cx - 38, cy - 24, 76, 50, 8); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + 1, 15, 0, TAU); ctx.stroke(); }
  else if (kind === 'lidar') { ctx.beginPath(); ctx.arc(cx, cy + 10, 30, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 36, cy + 10); ctx.lineTo(cx + 36, cy + 10); ctx.stroke(); for (let i = 0; i < 3; i++) { const a = -0.5 - i * 0.5 + 0.2 * Math.sin(t * 6); ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 54 * Math.cos(a - 0.4), cy - 8 + 54 * Math.sin(a - 0.4)); ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; } }
  else if (kind === 'radar') { for (let i = 1; i <= 3; i++) { ctx.globalAlpha = 1 - i * 0.22; ctx.beginPath(); ctx.arc(cx - 26, cy + 26, i * 22, -Math.PI / 2, 0); ctx.stroke(); } ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx - 26, cy + 26, 6, 0, TAU); ctx.fill(); }
  else { const g = ctx.createLinearGradient(0, cy - 36, 0, cy + 36); g.addColorStop(0, '#fff4b8'); g.addColorStop(0.5, '#ffb43a'); g.addColorStop(1, '#ff5a1f'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy - 40); ctx.bezierCurveTo(cx + 40, cy - 6, cx + 30, cy + 38, cx, cy + 38); ctx.bezierCurveTo(cx - 30, cy + 38, cx - 40, cy - 6, cx, cy - 40); ctx.fill(); }
  ctx.restore();
}
function thesisCard(u, t) {
  sensorBase('#04070b');
  // title: ONE SENSOR is struck out, then the four
  const strike = EZ.o3(clamp((u - 1.3) / 0.5));
  const w = svText('ONE SENSOR', PW / 2, 160, 84, SV.ink, { align: 'center', weight: 900, alpha: u < 2.4 ? 1 : 0.0 });
  if (u < 2.4) { ctx.strokeStyle = SV.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(PW / 2 - 260, 132); ctx.lineTo(PW / 2 - 260 + 520 * strike, 132); ctx.stroke(); }
  const tk = popIn(u, 2.4);
  if (tk > 0) svText('FOUR WEAK SPOTS', PW / 2, 160, 70 * Math.min(1, tk), SV.green, { align: 'center', weight: 900 });
  const C = [
    { n: 'CAMERA', w: 'LOW CONTRAST', g: 'cam', c: SV.ink, t0: 2.4 }, { n: 'LiDAR', w: 'DROPLET ECHOES', g: 'lidar', c: SV.amber, t0: 2.8 },
    { n: 'RADAR', w: 'HEAVY RAIN', g: 'radar', c: SV.cyan, t0: 3.2 }, { n: 'THERMAL', w: 'DENSE FOG', g: 'therm', c: SV.hot, t0: 3.6 },
  ];
  C.forEach((c, i) => {
    const k = popIn(u, c.t0); if (k <= 0) return;
    const x = 20 + (i % 2) * 450, y = 230 + Math.floor(i / 2) * 270, wd = 420, ht = 240;
    ctx.save(); ctx.translate(x + wd / 2, y + ht / 2); ctx.scale(k, k); ctx.translate(-wd / 2, -ht / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.roundRect(0, 0, wd, ht, 16); ctx.fill(); ctx.strokeStyle = c.c; ctx.lineWidth = 3; ctx.stroke();
    sensorGlyph(c.g, 70, 82, c.c, t);
    svText(c.n, 136, 96, 48, c.c, { weight: 900 });
    svText('WEAK SPOT', 28, 170, 22, SV.dim, { font: MONO, weight: 700 });
    svPill(c.w, 28, 208, 30, '#ffffff', SV.red);
    ctx.restore();
  });
  panelChip('CAR SEES', SV.ink);
}

// ---- finale: same storm, the car sees three objects
function fxFinale(u, t) {
  sensorBase();
  const Dp = 0.62, K = [3.7, 4.3, 4.9], fk = smooth(0.4, 1.4, u);
  groundArc(5 + mod(u / 0.9, 1) * 85, '#ffffff', 0.2, 2.5);
  lidarGround(t, Dp, '#ffffff', 125, 0.85);
  for (let d = 20; d <= 80; d += 20) groundArc(d, SV.cyan, 0.08 * fk, 1.5);
  groundArc(5 + mod(u / 1.1, 1) * 85, SV.cyan, 0.5 * fk, 3);
  let n = 0;
  OBJ.forEach((o, i) => {
    const [x, y] = pj(o.X, 0.9, objZ(o, t)), pk = popIn(u, K[i]);
    if (fk > 0) { svGlow(x, y, 80 * fk, '255,138,42', 0.28 * fk); svGlow(x, y, 50 * fk, '58,216,255', 0.28 * fk); }
    objPoints(o, t, objConfD(o, t, Dp), '#ffffff');
    if (pk > 0) { n++; trackBox(o, t, 0.97, SV.green, 'FUSED'); }
  });
  const L = [[`LiDAR: ${Math.round(100 * clamp(1 - Dp * 1.04))}% confidence`, SV.amber]];
  if (u > 0.6) L.push(['Radar: 96% confidence', SV.cyan]); if (u > 1.0) L.push(['Thermal: 91% confidence', SV.hot]);
  L.push(['Camera: BLINDED', SV.red]);
  hudBlock(L); bigCounter(n, 3); panelChip('CAR SEES', n === 3 ? SV.green : SV.ink);
  const q = u - (T.trust - T.callback);
  if (q > 0) { const k = EZ.back(clamp(q / 0.35)); ctx.save(); ctx.translate(600, SPH - 100); ctx.scale(k, k); svPill('WOULD YOU TRUST ONE SENSOR?', 0, 0, 34, '#04070a', SV.ink, { align: 'center' }); ctx.restore(); }
}
