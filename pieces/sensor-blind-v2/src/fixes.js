// =====================================================================
//  FIXES — the bottom panel after the payoff: radar, 1550 nm LiDAR, thermal, lens care, fusion.
//  Each draws into the sensor layer with u = seconds since its voice line began.
// =====================================================================
const fxPill = (txt, col, y = SPH - 128, size = 38, cx = PW / 2) => svPill(txt, cx, y, size, '#03100a', col, { align: 'center' });
function fxHud(lines, tabsOn, tabCols, chipCol) { hudBlock(lines); tabs(tabsOn, tabCols); panelChip('CAR SEES', chipCol); }
const popIn = (u, t0) => EZ.back(clamp((u - t0) / 0.3));

function fxRadar(u, t) {
  sensorBase('#02080c');
  const rk = smooth(2.2, 3.0, u);   // fog first (radar passes), then heavy rain (it gains little)
  for (let d = 10; d <= 80; d += 10) groundArc(d, SV.cyan, 0.1, 1.5);
  const ph = mod(u / 1.1, 1), rw = 5 + ph * 85; groundArc(rw, SV.cyan, 0.75 * (1 - rw / 95), 4);
  for (let i = 0; i < 220 * rk; i++) { const r = 4 + 40 * hh(i, F), phi = (hh(i, F + 1) * 2 - 1) * 42 * DEG, Zf = r * Math.cos(phi); if (Zf < 2) continue; const [x, y] = pj(r * Math.sin(phi), 0.5 * hh(i, F + 2), Zf); ctx.fillStyle = 'rgba(58,216,255,0.45)'; ctx.fillRect(x, y, 3, 3); }
  let n = 0;
  OBJ.forEach((o, k) => {
    const Z = objZ(o, t), [x, y] = pj(o.X, o.kind === 'car' ? 0.7 : 0.9, Z), t0 = 0.4 + k * 0.35, pop = popIn(u, t0); if (pop <= 0) return;
    const flash = clamp(1 - Math.abs(rw - Z) / 7), r = clamp(CF0 * 0.55 / Z, 9, 34) * (o.kind === 'cyc' ? 0.65 : 1), dim = 1 - 0.6 * rk;
    ctx.globalAlpha = dim; svGlow(x, y, r * 2.6, '58,216,255', 0.35 + 0.5 * flash); ctx.fillStyle = '#bff3ff'; ctx.beginPath(); ctx.arc(x, y, r * 0.5 * pop, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    const c = lerp(0.97, 0.5, rk); if (c >= 0.33) n++;
    trackBox(o, t, c, SV.cyan, 'RADAR');
  });
  fxPill(rk < 0.5 ? 'FOG: RADAR PASSES THROUGH' : 'HEAVY RAIN: GAINS LITTLE', rk < 0.5 ? SV.cyan : SV.amber, SPH - 100, 34, 600);
  const pc = Math.round(lerp(96, 52, rk));
  fxHud([[`Radar: ${pc}% confidence`, rk < 0.5 ? SV.cyan : SV.amber], ['Camera: BLINDED', SV.red]], [], null, SV.cyan);
  bigCounter(n, 3);
}
function fx1550(u, t) {
  sensorBase();
  const Dp = lerp(1.0, 0.55, EZ.io(clamp(u / 2.4)));
  groundArc(5 + mod(u / 0.9, 1) * 85, SV.violet, 0.3, 2.5);
  lidarGround(t, Dp, SV.violet, 190); scatterCloud(t, Dp * 0.5, '#ead6ff');
  let n = 0;
  for (const o of OBJ) { const c = objConfD(o, t, Dp); if (c > 0.12) objPoints(o, t, c, '#f1e0ff'); if (c >= 0.33) n++; trackBox(o, t, c, SV.violet, '1550'); }
  // allowed power: two bars
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.beginPath(); ctx.roundRect(16, SPH - 232, 520, 118, 10); ctx.fill();
  svText('EYE-SAFETY POWER LIMIT', 30, SPH - 204, 22, SV.dim, { font: MONO, weight: 700 });
  const k = EZ.o3(clamp((u - 0.6) / 1.2));
  ctx.fillStyle = SV.amber; ctx.fillRect(30, SPH - 190, 150 * k, 22); svText('905 nm', 30 + 150 * k + 12, SPH - 172, 22, SV.amber, { font: MONO, weight: 700 });
  ctx.fillStyle = SV.violet; ctx.fillRect(30, SPH - 158, 400 * k, 22); svText('1550 nm', 30 + 400 * k - 4 > 460 ? 460 : 30 + 400 * k + 12, SPH - 140, 22, SV.violet, { font: MONO, weight: 700 });
  fxPill('1550 nm LiDAR', SV.violet, SPH - 84, 34);
  const pct = Math.round(100 * clamp(1 - Dp * 0.9)), lc = pct > 70 ? SV.green : pct > 35 ? SV.amber : SV.red;
  fxHud([[`LiDAR: ${pct}% confidence`, lc], ['Camera: BLINDED', SV.red], [`Tracks: ${n}/3`, n === 3 ? SV.green : SV.amber]], ['LIDAR'], { LIDAR: SV.violet }, SV.violet);
}
// ---- thermal: heat, not light (ironbow palette)
function thermalCar(X, Z) {
  const [xl, yt] = pj(X - 0.93, 1.45, Z), [xr, yb] = pj(X + 0.93, 0.18, Z), wp = xr - xl, hp = yb - yt;
  let g = ctx.createLinearGradient(0, yt, 0, yb); g.addColorStop(0, '#3a1456'); g.addColorStop(0.5, '#8a2a5a'); g.addColorStop(1, '#d4502a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(xl, yt + hp * 0.2, wp, hp * 0.8, wp * 0.07); ctx.fill();
  svGlow((xl + xr) / 2, yb - hp * 0.08, wp * 0.5, '255,230,120', 0.9);   // the exhaust
  for (const s of [-1, 1]) { const [lx, ly] = pj(X + s * 0.7, 0.9, Z); svGlow(lx, ly, wp * 0.18, '255,190,80', 0.95); }
}
function thermalCyc(X, Z, t) {
  const k = CF0 / Z, [bx, by] = pj(X, 0, Z);
  ctx.strokeStyle = '#4a1a66'; ctx.lineWidth = Math.max(1.5, 0.05 * k); ctx.beginPath(); ctx.ellipse(bx, by - 0.35 * k, 0.05 * k, 0.35 * k, 0, 0, TAU); ctx.stroke();
  const g = ctx.createLinearGradient(0, by - 1.9 * k, 0, by - 0.7 * k); g.addColorStop(0, '#fff4b8'); g.addColorStop(0.4, '#ffc23a'); g.addColorStop(1, '#ff6a24');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(bx - 0.22 * k, by - 1.6 * k, 0.44 * k, 0.85 * k, 0.12 * k); ctx.fill();
  const sw = Math.sin(t * 9); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(bx - 0.17 * k + sw * 0.05 * k, by - 0.8 * k, 0.12 * k, 0.55 * k); ctx.fillRect(bx + 0.05 * k - sw * 0.05 * k, by - 0.8 * k, 0.12 * k, 0.55 * k);
  ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(bx, by - 1.75 * k, 0.14 * k, 0, TAU); ctx.fill(); svGlow(bx, by - 1.75 * k, 0.45 * k, '255,240,170', 0.6);
}
function fxThermal(u, t) {
  let g = ctx.createLinearGradient(0, 0, 0, SPH); g.addColorStop(0, '#0a031c'); g.addColorStop(0.4, '#1d0a36'); g.addColorStop(1, '#2d0f3e'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, SPH);
  const rp = [pj(-5.25, 0, 300), pj(5.25, 0, 300), pj(5.25, 0, 1.7), pj(-5.25, 0, 1.7)];
  ctx.fillStyle = 'rgba(70,22,92,0.7)'; ctx.beginPath(); rp.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
  const lamps = []; for (let k = 0; k < 6; k++) { const Z = mod(k * 30 + 12 - t * 24, 180) + 2.5; for (const X of [-7.2, 7.2]) lamps.push([X, Z]); }
  for (const [X, Z] of lamps) { const [tx, ty] = pj(X, 7, Z); svGlow(tx, ty, clamp(CF0 * 0.9 / Z, 4, 50), '255,200,100', 0.7); }
  let n = 0;
  [...OBJ].sort((a, b) => objZ(b, t) - objZ(a, t)).forEach((o) => { const Z = objZ(o, t); if (o.kind === 'car') thermalCar(o.X, Z); else thermalCyc(o.X, Z, t); });
  for (let i = 0; i < 200; i++) { ctx.fillStyle = `rgba(255,255,255,${0.02 + 0.05 * hh(i, F)})`; ctx.fillRect(hh(i, F + 1) * PW, hh(i, F + 2) * SPH, 2, 2); }
  ctx.fillStyle = 'rgba(214,224,232,0.10)'; ctx.fillRect(0, 0, PW, SPH);   // the fog is still there, it just does not hide heat
  OBJ.forEach((o, k) => { if (u > 0.5 + k * 0.45) { n++; trackBox(o, t, 1, SV.hot, 'HEAT'); } });
  const vg = ctx.createRadialGradient(PW / 2, SPH / 2, SPH * 0.4, PW / 2, SPH / 2, PW * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, PW, SPH);
  // the ordinary camera, same instant, for comparison
  const ix = 16, iy = 70, iw = 350, ih = 190;
  ctx.save(); ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 12); ctx.clip();
  let cg = ctx.createLinearGradient(0, iy, 0, iy + ih); cg.addColorStop(0, '#c9d2d9'); cg.addColorStop(1, '#a9b4bd'); ctx.fillStyle = cg; ctx.fillRect(ix, iy, iw, ih);
  ctx.strokeStyle = 'rgba(90,105,120,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < 40; i++) { const x = ix + hh(i, 1) * iw, y = iy + mod(hh(i, 2) * ih + t * 600, ih); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 22); } ctx.stroke();
  svText('NOTHING VISIBLE', ix + iw / 2, iy + ih / 2 + 10, 30, '#38454f', { align: 'center', weight: 900 });
  ctx.restore();
  ctx.strokeStyle = SV.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 12); ctx.stroke();
  svPill('CAMERA', ix + 10, iy + 26, 24, '#04070a', SV.ink); svPill('0 TRACKS', ix + iw - 10, iy + ih - 26, 24, '#ffffff', SV.red, { align: 'right' });
  fxPill('THERMAL CAMERA', SV.hot, SPH - 100, 36, 600);
  svText('READS HEAT, NOT LIGHT', 600, SPH - 52, 26, SV.hot, { align: 'center', font: MONO, weight: 700 });
  panelChip('THERMAL', SV.hot); bigCounter(n, 3);
}
// ---- lens care: coating, air puffer, wiper
function fxClean(u, t) {
  sensorBase('#05080c');
  const cx = PW / 2, cy = SPH / 2 - 40, R = 175;
  ctx.fillStyle = '#10171e'; ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, TAU); ctx.fill(); ctx.strokeStyle = '#33414d'; ctx.lineWidth = 5; ctx.stroke();
  let g = ctx.createRadialGradient(cx - 40, cy - 50, 10, cx, cy, R); g.addColorStop(0, '#1b2a36'); g.addColorStop(1, '#070c11'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.fillStyle = '#02040a'; ctx.beginPath(); ctx.arc(cx, cy, 62, 0, TAU); ctx.fill(); svGlow(cx, cy, 62, '58,216,255', 0.25);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, R - 14, -2.6, -1.7); ctx.stroke();
  // droplets: three groups leave by three methods
  let left = 0; const N = 80;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  for (let j = 0; j < N; j++) {
    const a = hh(j, 41) * TAU, d = Math.sqrt(hh(j, 42)) * R * 0.95, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, r0 = 6 + 15 * hh(j, 43) * hh(j, 43), grp = hh(j, 31), xf = clamp((x - (cx - R)) / (2 * R));
    let tc, yy = y, r = r0;
    if (grp < 0.34) { tc = 0.35 + 0.8 * hh(j, 32); const s = Math.max(0, u - (tc - 0.55)); yy = y + 330 * s * s; r = r0 * (1 - 0.25 * clamp(s / 0.55)); }
    else if (grp < 0.7) tc = 1.35 + 1.05 * xf; else tc = 2.6 + 1.05 * clamp((x - (cx - R * 1.2)) / (R * 2.4));
    if (u >= tc) continue; left++;
    ctx.fillStyle = 'rgba(160,200,230,0.22)'; ctx.beginPath(); ctx.ellipse(x, yy, r, r * 1.15, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(x - r * 0.3, yy - r * 0.4, Math.max(1.2, r * 0.2), 0, TAU); ctx.fill();
  }
  // air puffer: streaks cross the lens from both sides
  if (u > 1.2 && u < 2.6) {
    const s = (u - 1.2) / 1.4;
    for (let k = 0; k < 9; k++) { const yk = cy - R * 0.8 + k * (R * 1.6 / 8), xa = cx - R * 1.2 + s * R * 2.4 - k * 6; ctx.strokeStyle = `rgba(255,255,255,${0.45 * (1 - Math.abs(s - 0.5) * 0.8)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa - 90, yk + 10); ctx.quadraticCurveTo(xa - 40, yk - 6, xa, yk); ctx.stroke(); }
  }
  ctx.restore();
  // nozzles
  ctx.fillStyle = '#33414d'; ctx.fillRect(cx - R - 80, cy - 14, 60, 28); ctx.fillRect(cx + R + 20, cy - 14, 60, 28);
  // the wiper
  if (u > 2.5 && u < 3.8) { const s = clamp((u - 2.6) / 1.05), th = -Math.PI / 2 + (s * 2 - 1) * 0.75, px = cx, py = cy + R + 120; ctx.strokeStyle = '#d7e1e8'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px + 60 * Math.cos(th), py + 60 * Math.sin(th)); ctx.lineTo(px + 360 * Math.cos(th), py + 360 * Math.sin(th)); ctx.stroke(); ctx.lineCap = 'butt'; }
  const stage = u < 1.2 ? 'HYDROPHOBIC COATING' : u < 2.5 ? 'AIR PUFFER' : 'WIPER';
  fxPill(stage, SV.ink, SPH - 104, 40);
  const wet = left > 0; fxHud([[`Droplets: ${left}`, wet ? SV.amber : SV.green], [`Lens: ${wet ? 'WET' : 'CLEAR'}`, wet ? SV.amber : SV.green]], [], null, SV.ink);
  if (!wet) svText('CLEAR', cx, cy + 12, 44, SV.green, { align: 'center', shadow: SV.green, blur: 16 });
}
// ---- fusion: the tracks come back
function fxFusion(u, t) {
  sensorBase();
  const Dp = 0.62, on = u > 2.5, kf = EZ.o2(clamp((u - 2.5) / 1.6));
  groundArc(5 + mod(u / 0.9, 1) * 85, '#ffffff', 0.2, 2.5);
  lidarGround(t, Dp, '#ffffff', 125, 0.85);
  if (on) { for (let d = 20; d <= 80; d += 20) groundArc(d, SV.cyan, 0.08 * kf, 1.5); groundArc(5 + mod(u / 1.1, 1) * 85, SV.cyan, 0.5 * kf, 3); }
  let n = 0;
  OBJ.forEach((o) => {
    const cl = objConfD(o, t, Dp), c = on ? lerp(cl, 0.97, kf) : cl;
    if (on) { const [x, y] = pj(o.X, 0.9, objZ(o, t)); svGlow(x, y, 70 * kf, '255,138,42', 0.3 * kf); svGlow(x, y, 44 * kf, '58,216,255', 0.3 * kf); }
    if (cl > 0.12) objPoints(o, t, cl, '#ffffff');
    if (c >= 0.33) n++; trackBox(o, t, c, SV.green, on && c >= 0.7 ? 'FUSED' : '', o.id === '02');
  });
  const pct = Math.round(100 * clamp(1 - Dp * 1.04)), L = [[`LiDAR: ${pct}% confidence`, SV.amber]];
  if (u > 2.5) L.push(['Radar: 96% confidence', SV.cyan]); if (u > 2.9) L.push(['Thermal: 91% confidence', SV.hot]);
  L.push(['Camera: BLINDED', SV.red], [`Tracks: ${n}/3`, n === 3 ? SV.green : SV.amber]);
  fxHud(L, u > 2.5 ? ['LIDAR', 'RADAR', 'THERMAL', 'CAMERA'] : ['LIDAR', 'CAMERA'], { LIDAR: SV.amber, RADAR: SV.cyan, THERMAL: SV.hot, CAMERA: SV.red }, SV.green);
  if (u > 4.5) fxPill('ONE BLIND. THREE COVER.', SV.green, SPH - 100, 36);
}
