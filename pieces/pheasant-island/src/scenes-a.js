// =====================================================================
//  SCENES (part A) — geography, shared drawing helpers, eras 0-3.
//  World units = canvas pixels at zoom 1 (1920x1080). Europe is drawn with a stylised lon/lat projection;
//  the river scene is a stylised picture of the Bidasoa (Spain on the west bank, France on the east), not a survey.
//  Gold = the island and the state on duty. Steel blue = the other side. Coral = small warnings only.
// =====================================================================
const GEO = (lon, lat) => [960 + (lon - 1.5) * 34, 520 - (lat - 44.5) * 47];
const EU = [[-5.4, 36.1], [-6.3, 36.5], [-7.4, 37.2], [-9.0, 37.0], [-8.8, 38.4], [-9.4, 38.7], [-8.8, 40.2], [-8.7, 41.1], [-8.9, 42.2], [-9.3, 43.0], [-8.4, 43.4],
  [-7.0, 43.6], [-5.7, 43.6], [-4.0, 43.4], [-2.5, 43.4], [-1.8, 43.4], [-1.3, 44.5], [-1.2, 45.6], [-1.1, 46.2], [-2.1, 46.8], [-2.4, 47.3], [-3.0, 47.5], [-4.3, 47.8],
  [-4.8, 48.4], [-3.5, 48.8], [-2.0, 48.7], [-1.5, 48.6], [-1.9, 49.6], [-1.2, 49.7], [0.1, 49.5], [1.2, 50.1], [1.9, 50.9], [3.2, 51.3], [4.0, 51.5], [4.5, 52.4],
  [4.8, 53.1], [6.0, 53.4], [7.2, 53.6], [8.6, 53.9], [8.6, 54.9], [10.5, 57.5], [14, 70], [32, 70], [32, 36.4], [22.4, 36.5], [21.5, 37.9], [20.2, 39.6], [19.4, 41.5], [19.0, 42.2], [16.2, 43.5],
  [14.0, 44.9], [13.7, 45.7], [12.4, 45.3], [12.3, 44.2], [13.6, 43.5], [14.2, 42.3], [15.9, 41.9], [18.5, 40.1], [17.2, 40.4], [16.8, 39.7], [17.1, 39.0], [16.5, 38.4],
  [16.0, 37.95], [15.65, 38.1], [16.0, 39.0], [15.6, 40.0], [14.9, 40.2], [14.0, 40.8], [13.0, 41.3], [12.3, 41.7], [11.2, 42.4], [10.5, 43.0], [10.2, 43.8], [9.1, 44.3],
  [8.5, 44.3], [7.6, 43.8], [7.3, 43.7], [6.0, 43.1], [5.0, 43.4], [4.2, 43.5], [3.2, 43.1], [3.2, 42.3], [3.3, 41.9], [2.2, 41.4], [1.5, 41.2], [0.9, 40.7], [0.2, 40.1],
  [-0.3, 39.5], [-0.1, 38.7], [-1.0, 37.6], [-2.2, 36.7], [-4.4, 36.7]].map(([a, b]) => GEO(a, b));
const PYR = [[-1.8, 43.38], [-1.3, 43.1], [-0.5, 42.8], [0.7, 42.7], [1.7, 42.5], [2.5, 42.35], [3.15, 42.45]].map(([a, b]) => GEO(a, b));
const ISLE = GEO(-1.80, 43.37);
const DOT = ellipsePts(ISLE[0], ISLE[1], 11, 11, 0, 24);
const LAKE = GEO(9.4, 47.6), MOSEL = GEO(6.4, 49.6);

// the river scene: Spain on the left bank, France on the right, the island in the middle
const IC = [960, 540];
const ISL_P = ellipsePts(IC[0], IC[1], 32, 165, 0, 40);      // 40 m wide, 210 m long at 1.57 px per metre
const xL = (y) => 700 + 60 * Math.sin(y / 230 + 0.6), xR = (y) => 1220 + 55 * Math.sin(y / 260 + 2.0);
const BANK_L = (() => { const P = [[-400, -3000]]; for (let y = -3000; y <= 4000; y += 50) P.push([xL(y), y]); P.push([-400, 4000]); return P; })();
const BANK_R = (() => { const P = [[2400, -3000]]; for (let y = -3000; y <= 4000; y += 50) P.push([xR(y), y]); P.push([2400, 4000]); return P; })();
const ISL_SHAPE = () => ({ P: wmCoast(ISL_P, 'isl', 4), c: WM.gold });
const DOT_SHAPE = () => ({ P: wmCoast(DOT, 'dot', 2, 6), c: WM.gold });

function drawEurope() { wmOcean({ key: 'eu', grid: 160, waves: 30 }); wmLand(EU, { key: 'eu', fill: WM.land, amt: 3 }); }
function riverBase() {
  wmOcean({ key: 'rv', grid: 200, waves: 22 });
  wmLand(BANK_L, { key: 'bl', fill: WM.land, amt: 7 });
  wmLand(BANK_R, { key: 'br', fill: WM.land, amt: 7 });
}
const drawIsland = () => wmLand(ISL_P, { key: 'isl', fill: WM.gold, amt: 4 });
const heroG = (look = 0.5, hop) => { if (DEFER) DEFER.push(() => wmGlobe(HERO[0], HERO[1], 58, { key: 'hero', look, hop })); };
const capAt = (t) => t - E0;

// a flag that waves: 'FR' blue-white-red, 'ES' red-yellow-red (simplified, no coat of arms)
function pmFlag(x, y, t0, which, size = 80, o = {}) {
  const k = popS(t0) * (o.out != null ? 1 - EZ.i2(ev(o.out, 0.25)) : 1); if (k <= 0.01) return;
  const s = wmPx(size) * k, fw = s, fh = s * 0.66;
  ctx.save(); ctx.translate(x, y);
  wmStroke(WM.line, 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 1.45); ctx.stroke();
  const wave = (u, v) => [u * fw, -s * 1.45 + v * fh + Math.sin(u * 5 - TT * 7 + (o.ph ?? 0)) * s * 0.05 * u];
  const strip = (u0, v0, u1, v1, col) => { const P = [], n = 8; for (let i = 0; i <= n; i++) P.push(wave(lerp(u0, u1, i / n), v0)); for (let i = n; i >= 0; i--) P.push(wave(lerp(u0, u1, i / n), v1)); wmPath(P); ctx.fillStyle = col; ctx.fill(); };
  if (which === 'FR') { strip(0, 0, 1 / 3, 1, '#0055a4'); strip(1 / 3, 0, 2 / 3, 1, '#ffffff'); strip(2 / 3, 0, 1, 1, '#ef4135'); }
  else { strip(0, 0, 1, 0.25, '#aa151b'); strip(0, 0.25, 1, 0.75, '#f1bf00'); strip(0, 0.75, 1, 1, '#aa151b'); }
  const P = []; for (let i = 0; i <= 8; i++) P.push(wave(i / 8, 0)); for (let i = 8; i >= 0; i--) P.push(wave(i / 8, 1));
  wmPath(P); wmStroke(WM.line, 4); ctx.stroke();
  ctx.restore();
}

// the calendar ring. Month index m: 0 = Feb ... 11 = Jan, clockwise from the bottom, so Spain's half (Feb-Jul) is the left half,
// on Spain's side of the river, and France's half (Aug-Jan) is the right half.
const RING_M = ['FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN'];
const mA = (m) => (90 + 30 * m) * DEG;
function drawRing(cx, cy, ro, ri, o = {}) {
  ctx.save();
  for (let m = 0; m < 12; m++) {
    const a0 = mA(m), a1 = mA(m + 1), es = m < 6;
    const hot = o.duty === 'ES' ? es : o.duty === 'FR' ? !es : false;
    ctx.beginPath(); ctx.arc(cx, cy, ro, a0, a1); ctx.arc(cx, cy, ri, a1, a0, true); ctx.closePath();
    ctx.fillStyle = o.duty ? (hot ? WM.gold : WM.rival) : WM.land; ctx.fill(); wmStroke(WM.line, o.thin ? 3 : 4); ctx.stroke();
    if (o.letters) { const am = (a0 + a1) / 2, rm = (ro + ri) / 2; wmText(RING_M[m], cx + Math.cos(am) * rm, cy + Math.sin(am) * rm, 22, { color: WM.line, shadow: false }); }
  }
  if (o.pointer != null) {
    const a = o.pointer, r0 = ro + 4, r1 = ro + 40, d = 0.05;
    wmPath([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a - d) * r1, cy + Math.sin(a - d) * r1], [cx + Math.cos(a + d) * r1, cy + Math.sin(a + d) * r1]]);
    ctx.fillStyle = WM.gold; ctx.fill(); wmStroke(WM.line, 4); ctx.stroke();
  }
  ctx.restore();
}
const ringK = (t0) => EZ.o3(ev(t0, 0.7));

// ---- era 0: two countries; the camera zooms from Europe to one pin
function sceneEurope() {
  const a = VL('open1').t0, b = VL('open2').t0, zs = b + 0.1;
  drawEurope();
  wmBorder(PYR, EZ.o2(ev(a + 0.5, 0.9)), { solid: true, w: 5 });
  const fr = GEO(2.4, 47.0), sp = GEO(-3.6, 40.5);
  wmLabel('France', fr[0], fr[1], VT('open1', 'countries'), 64, { box: WM.line, out: zs });
  wmLabel('Spain', sp[0], sp[1], VT('open1', 'countries') + 0.18, 64, { box: WM.line, out: zs });
  pmFlag(fr[0] + 170, fr[1] - 10, VT('open1', 'countries') + 0.1, 'FR', 90, { out: zs });
  pmFlag(sp[0] + 170, sp[1] - 10, VT('open1', 'countries') + 0.28, 'ES', 90, { out: zs, ph: 1.3 });
  wmLand(DOT, { raw: true, fill: WM.gold, shadow: false });
  if (TT < M[0] - MD - 0.1) {
    wmPin(ISLE[0], ISLE[1], VT('open1', 'island'), { size: 70 });
    wmLabel('Pheasant Island', ISLE[0] - wmPx(20), ISLE[1] - wmPx(135), VT('open1', 'island') + 0.35, 40, { box: WM.gold, color: WM.line });
  }
  wmTag('Europe', { x: 80, y: TAGY, at: capAt(a) + 0.1 });
  wmCaption('Two countries. One island.', { hl: ['ONE', 'ISLAND.'], size: 56, y: CAPY, max: CAPW, at: capAt(a) + 0.2 });
  heroG(0.6, VT('open1', 'island'));
}

// ---- era 1: the island and the calendar ring; flags swap as the year turns; who owns it?
function sceneHook(labelled, tEnd) {
  const a = VL('open3').t0, b = VL('where').t1, y0 = a + 0.5;
  riverBase(); drawIsland();
  wmLabel('Spain', VERT ? 960 : 330, VERT ? 60 : 560, M[0] + 0.3, 64, { box: WM.line });
  wmLabel('France', VERT ? 960 : 1590, VERT ? 985 : 560, M[0] + 0.45, 64, { box: WM.line });
  wmPin(1330, 340, VT('where', 'Hendaye') - 0.25, { c: WM.navy, size: 56 });
  wmLabel('Hendaye', 1330 + wmPx(10), 340 - wmPx(100), VT('where', 'Hendaye'), 42, { box: WM.line });
  wmPin(560, 780, VT('where', 'Irun') - 0.25, { c: WM.navy, size: 56 });
  wmLabel('Irun', 560, 780 - wmPx(100), VT('where', 'Irun'), 42, { box: WM.line });
  // calendar year: Feb 1 at the bottom; the pointer sweeps clockwise. Spain's turn first (left half), then France's (right half).
  const swept = clamp((TT - y0) / (b - y0)) * 1.2, ang = mA(0) + TAU * (swept % 1), who = swept % 1 < 0.5 ? 'ES' : 'FR';
  const k = ringK(VT('open3', 'owns'));
  if (k > 0.02) {
    drawRing(IC[0], IC[1], 300 * k, 248 * k, { letters: k > 0.95, duty: TT > y0 ? who : null, pointer: TT > y0 ? ang : null });
    if (k > 0.95) {
      wmText('1 Feb', IC[0], IC[1] + 300 + wmPx(46), 34, { box: WM.line });
      wmText('1 Aug', IC[0], IC[1] - 300 - wmPx(46), 34, { box: WM.line });
    }
  }
  if (TT > y0) { const sw = swept < 0.5 ? y0 : swept < 1 ? y0 + (b - y0) * 0.5 / 1.2 : y0 + (b - y0) / 1.2; pmFlag(IC[0], IC[1] - 40, sw, who, 76, { ph: who === 'FR' ? 0.5 : 0 }); }
  if (TT >= VT('open3', 'who')) wmStamp('?', VERT ? 1330 : 1300, VERT ? 20 : 300, VT('open3', 'who'), { r: 64 });
  wmCaption('Who owns it?', { hl: ['OWNS'], size: 60, y: CAPY, max: CAPW, at: capAt(VT('open3', 'who')) });
  heroG(0.1, VT('open3', 'who'));
}

// ---- era 2: 1659, the peace signed on the island
function camp(x, y, which, t0) {
  const k = popS(t0); if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  for (const [dx, dy] of [[-76, 46], [76, 46], [0, -10]]) { wmPath([[dx - 38, dy + 24], [dx, dy - 34], [dx + 38, dy + 24]]); ctx.fillStyle = WM.navy; ctx.fill(); wmStroke(WM.line, 4); ctx.stroke(); }
  ctx.restore();
  pmFlag(x, y - 50, t0 + 0.15, which, 74, { ph: which === 'FR' ? 0.5 : 0 });
}
function scene1659() {
  const a = VL('war').t0, s = VL('sign').t0;
  riverBase(); drawIsland();
  camp(540, 560, 'ES', VT('war', 'france') - 0.2);
  camp(1380, 560, 'FR', VT('war', 'spain') - 0.2);
  const out = s - 0.1;
  if (TT < out + 0.5) {
    const bar = EZ.io(ev(VT('war', 'began') - 0.3, 1.0)), fade = 1 - EZ.i2(ev(out, 0.3));
    ctx.save(); ctx.globalAlpha = fade;
    wmMeasure([620, 190], [1300, 190], bar, (f) => `${Math.round(24 * f)} years of war`, { off: 56, size: 40 });
    ctx.restore();
    wmBadge('1659', 1300, 140, VT('war', '1659'), { c: WM.navy, size: 40 });
    wmBadge('1635', 620, 140, VT('war', '1635'), { c: WM.navy, size: 40 });
  }
  const tb = VT('sign', 'island');
  if (TT > s - 0.2) {   // the table on the island: a plain table, a treaty paper
    const k = popS(tb); ctx.save(); ctx.translate(IC[0], IC[1] + 10); ctx.scale(k, k);
    ctx.beginPath(); ctx.roundRect(-46, -26, 92, 52, 8); ctx.fillStyle = WM.navy; ctx.fill(); wmStroke(WM.line, 4); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-22, -14, 44, 28, 3); ctx.fillStyle = WM.white; ctx.fill(); ctx.stroke();
    for (const sx of [-70, 70]) { ctx.beginPath(); ctx.arc(sx, 0, 11, 0, TAU); ctx.fillStyle = WM.rival; ctx.fill(); ctx.stroke(); }
    ctx.restore();
    wmBadge('7 Nov 1659', IC[0] + wmPx(10), IC[1] - wmPx(95), VT('sign', 'seventh'), { c: WM.gold, color: WM.line, size: 44 });
  }
  wmTag('1659', { x: 80, y: TAGY, at: capAt(VT('war', '1659')) });
  wmCaption(TT < s - 0.2 ? 'A war that began in 1635' : 'The peace was signed here', { hl: ['1635', 'HERE'], size: 54, y: CAPY, max: CAPW, at: capAt(TT < s - 0.2 ? a + 0.3 : s + 0.2) });
  heroG(0.1, VT('sign', 'seventh'));
}

// ---- era 3: 1856, no border line fits the river; the island belongs to both
function scene1856() {
  const a = VL('problem').t0, tr = VL('treaty').t0, jt = VL('joint').t0, cd = VL('condo').t0;
  riverBase(); drawIsland();
  if (TT < tr) {
    [[880, 0.0], [1040, 1.5], [960, 3.0]].forEach(([bx, dt], i) => {
      const t0 = a + 0.5 + dt, P = []; for (let y = 140; y <= 960; y += 40) P.push([bx + 22 * Math.sin(y / 60 + i * 2), y]);
      const f = EZ.io(ev(t0, 0.9)) * (1 - EZ.io(ev(t0 + 1.25, 0.35)));
      wmBorder(P, f, {});
      if (TT >= t0 + 0.9 && TT < t0 + 1.4) wmStamp('?', bx, 520, t0 + 0.9, { r: 52 });
    });
    const bar = EZ.io(ev(VT('problem', 'centuries') - 0.8, 1.4));
    wmMeasure([610, 150], [1330, 150], bar, (f) => `${Math.round(197 * f)} years`, { off: 52, size: 38 });
    wmBadge('1659', 610, 100, a + 0.3, { c: WM.navy, size: 36 });
    wmBadge('1856', 1330, 100, VT('problem', 'centuries') - 0.5, { c: WM.navy, size: 36 });
  } else {
    pmFlag(760, 600, VT('joint', 'both'), 'ES', 84);
    pmFlag(1180, 600, VT('joint', 'both') + 0.15, 'FR', 84, { ph: 0.5 });
    wmRoute([[800, 560], [915, 545]], ev(VT('joint', 'both') + 0.2, 0.7), { color: WM.navy, w: 8 });
    wmRoute([[1130, 560], [1005, 545]], ev(VT('joint', 'both') + 0.35, 0.7), { color: WM.navy, w: 8 });
    wmLabel('Owned by both', IC[0], IC[1] - wmPx(150), VT('joint', 'both'), 46, { box: WM.navy, color: WM.white });
    wmLabel('Condominium', IC[0], IC[1] + wmPx(150), VT('condo', 'condominium'), 52, { box: WM.gold, color: WM.line });
  }
  if (TT >= tr) wmBadge('Treaty of Bayonne', VERT ? 960 : 1500, 90, VT('treaty', 'Bayonne'), { c: WM.navy, size: 40, align: VERT ? 'center' : 'right' });
  wmTag('1856', { x: 80, y: TAGY, at: capAt(tr) });
  const cap = TT < tr ? 'No line fits the river' : TT < cd ? 'Both countries own it' : 'Shared ownership. No split.';
  wmCaption(cap, { hl: ['RIVER', 'BOTH', 'SPLIT.'], size: 54, y: CAPY, max: CAPW, at: capAt(TT < tr ? a + 0.4 : TT < cd ? jt + 0.1 : VT('condo', 'shared')) });
  heroG(0.1, VT('treaty', 'Bayonne'));
}
