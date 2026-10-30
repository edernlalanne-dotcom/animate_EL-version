// =====================================================================
//  SENSOR — the bottom panel: what the car senses. Drawn into an offscreen layer, then blitted (with the glitch at the payoff).
//  Weather is one number, D (0..1). Range, point loss, scatter and confidence all derive from it.
// =====================================================================
const GP = [];
{ let n = 0; for (let k = 0; k < 25; k++) { const d = 3.6 * Math.pow(1.15, k); for (let j = 0; j <= 70; j++) GP.push({ i: n++, d, phi: (-42 + j * 1.2) * DEG, u: hh(n, 5) }); } }

const objConfD = (o, t, D) => clamp(1.15 - 1.25 * D * o.sens * (0.4 + objZ(o, t) / 60));
const sqr = (x, y, s) => ctx.fillRect(x - s / 2, y - s / 2, s, s);

function sensorBase(tint) {
  ctx.fillStyle = tint || '#04070b'; ctx.fillRect(0, 0, PW, SPH);
  const hy = CY0;
  ctx.strokeStyle = 'rgba(120,150,170,0.10)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(PW, hy); ctx.stroke();
  const g = ctx.createRadialGradient(PW / 2, SPH / 2, SPH * 0.4, PW / 2, SPH / 2, PW * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, SPH);
}
function groundArc(d, col, a, lw) {
  ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = lw; ctx.beginPath(); let on = false;
  for (let j = 0; j <= 60; j++) { const phi = (-42 + j * 1.4) * DEG, Zf = d * Math.cos(phi); if (Zf < 1.6) { on = false; continue; } const [x, y] = pj(d * Math.sin(phi), 0, Zf); if (!on) { ctx.moveTo(x, y); on = true; } else ctx.lineTo(x, y); }
  ctx.stroke(); ctx.globalAlpha = 1;
}
function lidarGround(t, D, col, Rmax, vis = 1) {
  const Rv = lerp(Rmax, 7, Math.pow(D, 0.9)), tw = Math.floor(t * 8);
  const occ = OBJ.map((o) => ({ X: o.X, Z: objZ(o, t), on: objConf(o, t) > 0.5 }));
  ctx.fillStyle = col;
  for (const g of GP) {
    let r = g.d, Y = 0, a;
    if (g.u < D * 0.42) { r = g.d * (0.06 + 0.5 * hh(g.i, tw)); Y = 3.2 * hh(g.i, tw + 1); a = 0.55; }   // an early return off a droplet
    else { if (hh(g.i, 77) > Math.exp(-Math.pow(g.d / Rv, 3))) continue; a = 0.26 + 0.62 * Math.exp(-g.d / 55); }
    const Zf = r * Math.cos(g.phi); if (Zf < 1.6) continue;
    const X = r * Math.sin(g.phi);
    if (Y === 0) { let hid = false; for (const q of occ) if (q.on && Math.abs(X - q.X) < 1.1 && Zf > q.Z - 0.4 && Zf < q.Z + 9) { hid = true; break; } if (hid) continue; }
    const [x, y] = pj(X, Y, Zf); if (y < 0 || y > SPH || x < 0 || x > PW) continue;
    ctx.globalAlpha = a * (0.7 + 0.3 * hh(g.i, tw + 2)) * vis; sqr(x, y, clamp(3.4 - r / 45, 1.7, 3.4));
  }
  ctx.globalAlpha = 1;
}
function scatterCloud(t, D, col) {
  const n = Math.floor(1100 * Math.pow(D, 1.4)), tw = Math.floor(t * 8); ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const r = 2 + 8 * hh(i, tw) + 26 * Math.pow(hh(i, tw + 1), 3), phi = (hh(i, tw + 2) * 2 - 1) * 42 * DEG, Y = -0.6 + 4 * hh(i, tw + 3), Zf = r * Math.cos(phi); if (Zf < 1.6) continue;
    const [x, y] = pj(r * Math.sin(phi), Y, Zf); if (y < 0 || y > SPH || x < 0 || x > PW) continue;
    ctx.globalAlpha = 0.25 + 0.5 * hh(i, tw + 4); sqr(x, y, 2 + 2 * hh(i, tw + 5));
  }
  ctx.globalAlpha = 1;
}
function objPoints(o, t, conf, col) {
  const Z = objZ(o, t), seed = o.id.charCodeAt(1) * 100; ctx.fillStyle = col;
  const n = o.kind === 'car' ? 80 : 40, keep = Math.pow(conf, 0.7), tw = Math.floor(t * 8);
  for (let i = 0; i < n; i++) {
    if (hh(i + seed, 9 + tw) > keep) continue;
    let X, Y;
    if (o.kind === 'car') { X = o.X - 0.9 + 1.8 * ((i % 10) / 9) + 0.04 * (hh(i, 3) - 0.5); Y = 0.25 + 1.2 * (Math.floor(i / 10) / 7) + 0.04 * (hh(i, 4) - 0.5); }
    else if (i < 24) { const a = (i / 24) * TAU; X = o.X + 0.06 * Math.cos(a); Y = 0.35 + 0.35 * Math.sin(a); }
    else { X = o.X - 0.2 + 0.4 * hh(i, 5); Y = 0.85 + 1.0 * hh(i, 6); }
    const [x, y] = pj(X, Y, Z); ctx.globalAlpha = 0.95; sqr(x, y, 3);
  }
  ctx.globalAlpha = 1;
}
function brackets(xl, yt, xr, yb, col, lw = 4, dash = false) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'square';
  const L = Math.min(xr - xl, yb - yt) * 0.28;
  if (dash) { ctx.setLineDash([12, 9]); ctx.strokeRect(xl, yt, xr - xl, yb - yt); }
  else { ctx.beginPath(); for (const [cx, cy, sx, sy] of [[xl, yt, 1, 1], [xr, yt, -1, 1], [xl, yb, 1, -1], [xr, yb, -1, -1]]) { ctx.moveTo(cx, cy + sy * L); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * L, cy); } ctx.stroke(); }
  ctx.restore();
}
function objRect(o, t) {
  const Z = objZ(o, t), a = o.kind === 'car' ? pj(o.X - 1.0, 1.6, Z) : pj(o.X - 0.5, 2.0, Z), b = o.kind === 'car' ? pj(o.X + 1.0, 0.05, Z) : pj(o.X + 0.5, 0.0, Z);
  return [a[0] - 6, a[1] - 6, b[0] + 6, b[1] + 6, Z];
}
// a tracked box: green when held, flickers while confidence falls, red LOST TRACKING when gone
function trackBox(o, t, conf, okCol, tag, below) {
  const LX1 = (w) => clamp(o.id === '02' ? xr - w : xl, 8, PW - 100 - w);
  let [xl, yt, xr, yb, Z] = objRect(o, t);
  const state = conf >= 0.7 ? 'ok' : conf >= 0.33 ? 'flicker' : 'lost';
  if (state === 'flicker') {
    if (hh(F, o.id.charCodeAt(1)) > conf / 0.7 + 0.15) return;
    const j = (1 - conf / 0.7) * 9, dx = (hh(F, 3) - 0.5) * j, dy = (hh(F, 4) - 0.5) * j; xl += dx; xr += dx; yt += dy; yb += dy;
  }
  if (state === 'lost') {
    if (Math.floor(t * 3.5) % 2 === 1) { brackets(xl, yt, xr, yb, SV.red, 3, true); return; }
    brackets(xl, yt, xr, yb, SV.red, 4, true);
    ctx.save(); ctx.font = `800 28px ${SANS}`; const w = ctx.measureText('LOST TRACKING').width + 26; ctx.restore();
    svPill('LOST TRACKING', LX1(w), o.kind === 'cyc' ? yb + 28 : clamp(yt - 26, 24, SPH - 30), 28, '#ffffff', SV.red);
    return;
  }
  brackets(xl, yt, xr, yb, okCol, 4);
  const label = `${o.name} ${Math.round(Z)} m` + (tag ? ' · ' + tag : '');
  ctx.save(); ctx.font = `800 26px ${SANS}`; const w = ctx.measureText(label).width + 24; ctx.restore();
  svPill(label, LX1(w), o.kind === 'cyc' || below ? yb + 26 : clamp(yt - 24, 24, SPH - 30), 26, '#04120a', okCol, { alpha: state === 'ok' ? 1 : 0.8 });
}
function hudBlock(lines) {   // lines: [[text, color], ...] — mono, top-left of the panel
  const size = 34, lh = 46, w = 560, h = lines.length * lh + 20;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(16, 64, w, h, 10); ctx.fill(); ctx.restore();
  lines.forEach(([s, c], i) => svText(s, 30, 64 + 14 + size + i * lh - 4, size, c, { font: MONO, weight: 700 }));
}
function tabs() {}   // v2: the tab strip is gone (less on screen at once)
function panelChip(txt, col) { svPill(txt, PW - 100, 40, 26, col === SV.ink ? '#04070a' : '#04070a', col, { align: 'right' }); }

// ---- the drive part of the bottom panel (clear weather, then everything fails)
function driveSensor(t) {
  const D = Dat(t), kill = killAt(t);
  sensorBase();
  // a pulse ring leaves the sensor every 0.9 s
  const pd = 5 + mod(t / 0.9, 1) * 85; groundArc(pd, '#ffffff', 0.22 * (1 - pd / 95) * (1 - D * 0.6), 2.5);
  lidarGround(t, D, '#ffffff', 125);
  scatterCloud(t, D, '#e8f0f6');
  for (const o of OBJ) { const c = objConf(o, t); if (c > 0.12) objPoints(o, t, c, '#ffffff'); }
  for (const o of OBJ) { const c = objConf(o, t); if (kill < 1 && t > 0.7) trackBox(o, t, c, SV.green); }
  // HUD
  const pct = Math.round(100 * clamp(1 - D * 1.04));
  const lcol = pct > 70 ? SV.green : pct > 35 ? SV.amber : SV.red;
  const camTxt = D >= 0.97 ? 'BLINDED' : D > 0.5 ? 'LOW CONTRAST' : D > 0.2 ? 'DEGRADED' : 'CLEAR', ccol = D >= 0.97 ? SV.red : D > 0.2 ? SV.amber : SV.green;
  const tracks = OBJ.filter((o) => objConf(o, t) >= 0.33).length;
  hudBlock([[`LiDAR: ${pct}% confidence`, lcol], [`Camera: ${camTxt}`, ccol]]);
  if (t > T.story - 0.1 || t > 30) bigCounter(tracks, 3);
  panelChip('CAR SEES', SV.ink);
}
// ---- dead panel: after the payoff until the first fix
function deadSensor(t) {
  sensorBase('#020304');
  for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.05 + 0.18 * hh(i, F); const y = hh(i, F + 5) * SPH; ctx.fillStyle = '#fff'; ctx.fillRect(hh(i, F + 9) * PW, y, 8 + 60 * hh(i, F + 11), 1.5); }
  ctx.globalAlpha = 1;
  hudBlock([['LiDAR: 0% confidence', SV.red], ['Camera: BLINDED', SV.red]]);
  bigCounter(0, 3);
  panelChip('CAR SEES', SV.red);
  if (Math.floor(t * 2.2) % 2 === 0) svText('NO SENSOR DATA', PW / 2, SPH * 0.62, 46, SV.red, { align: 'center', weight: 800, shadow: SV.red, blur: 18 });
}
// choose and draw the bottom panel's content for time t
function sensorContent(t, cold) {
  if (cold) { if (t < T.blind + 0.5) driveSensor(t); else deadSensor(t); return; }
  if (t < T.lidar) driveSensor(t);
  else if (t < T.fog) echoDemo(t - T.lidar, t);
  else if (t < T.blind + 0.5) { driveSensor(t); if (t < T.quiet) statOverlay(t - T.fog); }
  else if (t < T.thesis) deadSensor(t);
  else if (t < T.radar) thesisCard(t - T.thesis, t);
  else if (t < T.l1550) fxRadar(t - T.radar, t);
  else if (t < T.thermal) fx1550(t - T.l1550, t);
  else if (t < T.clean) fxThermal(t - T.thermal, t);
  else if (t < T.callback) fxClean((t - T.clean) * 0.945, t);
  else fxFinale(t - T.callback, t);
}
function sensorView(t, cold) {
  CF0 = lerp(F0, 900, LAYOUT.tl); CY0 = lerp(Y0, 320, LAYOUT.tl);
  const S = layer(1), keep = ctx; ctx = S.getContext('2d');
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); ctx.beginPath(); ctx.rect(0, 0, PW, SPH); ctx.clip();
  sensorContent(t, cold);
  ctx.restore(); ctx = keep;
  ctx.save(); ctx.beginPath(); ctx.roundRect(PX, BOTYv, PW, SPH, 18); ctx.clip();
  const g = t - T.blind;
  if (g > -0.45 && g < 1.3) {
    // the glitch: slices slide sideways, the picture fades to static
    const pre = g < 0, amp = pre ? 6 + 40 * Math.pow((g + 0.45) / 0.45, 2) : 140 * Math.max(0.25, 1 - g / 1.0);
    const fade = g < 0 ? 1 : 1 - clamp(g / 0.55);
    ctx.fillStyle = '#000'; ctx.fillRect(PX, BOTYv, PW, SPH);
    const n = 20, sh = SPH / n; ctx.globalAlpha = fade;
    for (let k = 0; k < n; k++) { const mv = hh(k, F) < (pre ? 0.35 : 0.8) ? (hh(k, F + 3) - 0.5) * 2 * amp : 0; ctx.drawImage(S, 0, k * sh, PW, sh + 1, PX + mv, BOTYv + k * sh, PW, sh + 1); }
    ctx.globalAlpha = 1;
    // colour ghosts
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * fade; ctx.drawImage(S, 0, 0, PW, SPH, PX + amp * 0.3, BOTYv, PW, SPH); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 26; i++) { ctx.fillStyle = hh(i, F + 20) < 0.35 ? 'rgba(255,59,59,0.5)' : 'rgba(255,255,255,0.4)'; ctx.fillRect(PX + hh(i, F + 21) * PW, BOTYv + hh(i, F + 22) * SPH, 20 + 220 * hh(i, F + 23), 2 + 5 * hh(i, F + 24)); }
    if (g >= 0 && g < 0.1) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(PX, BOTYv, PW, SPH); }
  } else ctx.drawImage(S, 0, 0, PW, SPH, PX, BOTYv, PW, SPH);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = SV.edge; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(PX, BOTYv, PW, SPH, 18); ctx.stroke(); ctx.restore();
}
