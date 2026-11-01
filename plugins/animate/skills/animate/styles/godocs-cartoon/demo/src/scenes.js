// =====================================================================
//  LOOK CHECK: four frames in the Cartoon Style GoDocs style. Placeholder text only: [year], [figure], [place].
//  1 dam, sunny   2 flood, disaster   3 scale gag, neutral   4 map, neutral
//  Placed by fractions (LX, LY) and sized by UNIT so the same scenes lay out in 9:16 and 16:9.
// =====================================================================
const SV = () => (PORTRAIT ? 560 : 470) * UNIT;   // the Surveyor's height

function gcBirds(seedKey, n, y0, y1) {
  const R = RNG('birds', seedKey);
  for (let i = 0; i < n; i++) {
    const x = gcX0() + mod(R.r(0, 1) * (gcX1() - gcX0()) + TT * 40 * UNIT, gcX1() - gcX0()), y = lerp(y0, y1, R.r(0, 1)) + Math.sin(TT * 2 + i) * 10 * UNIT, s = R.r(14, 24) * UNIT, fl = Math.sin(TT * 7 + i * 2) * 0.5;
    gcStroke([[x - s, y - s * (0.4 + fl)], [x, y], [x + s, y - s * (0.4 - fl)]], gcM().ink, 0.5);
  }
}
function gcForeground(fy, o = {}) {
  const M = gcM(), x0 = gcX0(), x1 = gcX1();
  gcShape([[x0, fy + 30 * UNIT], [LX(0.25), fy - 18 * UNIT], [LX(0.55), fy + 6 * UNIT], [LX(0.85), fy - 34 * UNIT], [x1, fy - 6 * UNIT], [x1, H * 1.4], [x0, H * 1.4]], o.color || M.land, { w: 1.1, shade: 0.03 });
  const R = RNG('fg', o.seed ?? 1);
  for (let i = 0; i < 9; i++) {   // tufts and rocks: background life on the ground
    const x = R.r(x0, x1), y = fy + R.r(30, 200) * UNIT, s = R.r(0.7, 1.3) * UNIT;
    if (i % 3 === 0) gcShape(ellipsePts(x, y, 38 * s, 24 * s, 0, 14), gcMix(M.land, M.ink, 0.35), { w: 0.7, shade: 0.12 });
    else { gcStroke([[x - 12 * s, y], [x - 4 * s, y - 34 * s], [x, y]], gcMix(M.land, M.ink, 0.5), 0.5); gcStroke([[x, y], [x + 10 * s, y - 42 * s], [x + 16 * s, y]], gcMix(M.land, M.ink, 0.5), 0.5); }
  }
}
function gcDamWorld(spill, crack) {
  const M = gcM(), hz = LY(PORTRAIT ? 0.46 : 0.46);
  gcSky(hz - 10 * UNIT, { sunX: LX(PORTRAIT ? 0.78 : 0.8), sunY: hz - H * (PORTRAIT ? 0.2 : 0.22), sunR: 80, clouds: GC_MOOD === 'disaster' ? 4 : 3, cloudMix: GC_MOOD === 'disaster' ? 0.55 : 0.1 });
  gcRidge(hz + 6 * UNIT, H * 0.13, 11, M.rock, 0.78);
  gcPylon(LX(0.12), hz - 10 * UNIT, 140 * UNIT); gcPylon(LX(0.2), hz + 0 * UNIT, 110 * UNIT);
  gcRidge(hz + H * 0.05, H * 0.15, 23, M.rock, 0.5);
  gcHaze(hz - H * 0.1, hz + H * 0.1, 0.4);
  const xl = LX(PORTRAIT ? 0.4 : 0.42), xr = LX(PORTRAIT ? 0.8 : 0.7), cy = hz + H * (PORTRAIT ? 0.035 : 0.06), by = hz + H * (PORTRAIT ? 0.15 : 0.22);
  gcRiver(by - 4 * UNIT, by + H * (PORTRAIT ? 0.1 : 0.1), { seed: 3, flow: 60 });
  gcDam(xl, xr, cy, by, { spill, crack });
  const x0 = gcX0(), x1 = gcX1(), top = cy - H * 0.19;
  gcRock([[x0, top], [xl - W * 0.16, top - 8 * UNIT], [xl - W * 0.06, cy - H * 0.07], [xl - 10 * UNIT, cy - 14 * UNIT], [xl - 10 * UNIT, cy + 6 * UNIT], [xl - 92 * UNIT, by + 4 * UNIT], [xl - W * 0.14, by + H * 0.05], [x0, by + H * 0.08]], 5);
  gcRock([[x1, top], [xr + W * 0.16, top - 8 * UNIT], [xr + W * 0.06, cy - H * 0.07], [xr + 10 * UNIT, cy - 14 * UNIT], [xr + 10 * UNIT, cy + 6 * UNIT], [xr + 92 * UNIT, by + 4 * UNIT], [xr + W * 0.14, by + H * 0.05], [x1, by + H * 0.08]], 6);
  gcCrane(xr - 40 * UNIT, cy - 20 * UNIT, 190 * UNIT);
  return { hz, xl, xr, cy, by };
}
function sceneDam() {
  gcMood('sunny');
  const g = gcDamWorld(0, 0), fy = H * (PORTRAIT ? 0.68 : 0.76);
  gcBirds('d', 4, g.hz - H * 0.3, g.hz - H * 0.1);
  gcForeground(fy, { seed: 1 });
  const sx = LX(PORTRAIT ? 0.27 : 0.2), sy = H * (PORTRAIT ? 0.715 : 0.84);
  gcSurveyor(sx, sy, SV(), { face: 'surprise', pose: 'point', key: 'sv1', look: [0.8, -0.4] });
  gcLabel('[figure]', LX(PORTRAIT ? 0.6 : 0.56), g.cy - H * (PORTRAIT ? 0.17 : 0.24), 70 * UNIT, { t: E0 + 0.7 });
  gcTag('[year]');
  gcCaption('[caption line]');
}
function sceneFlood() {
  gcMood('disaster');
  const k = ev(E0 + 0.2, 1.2), g = gcDamWorld(1, k), fy = H * (PORTRAIT ? 0.68 : 0.76);
  gcForeground(fy, { seed: 1, color: gcMix(gcM().land, '#4a5148', 0.2) });
  const sx = LX(PORTRAIT ? 0.27 : 0.2), sy = H * (PORTRAIT ? 0.715 : 0.84);
  gcSurveyor(sx, sy, SV(), { face: 'worry', pose: 'worry', key: 'sv2', look: [0.8, -0.2] });
  // rain: seeded diagonal streaks, falling on every frame, in front of everything
  const R = RNG('rain');
  for (let i = 0; i < 90; i++) {
    const x = gcX0() + mod(R.r(0, 1) * (gcX1() - gcX0()) - TT * 300 * UNIT, gcX1() - gcX0()), y = mod(R.r(0, H * 1.2) + TT * 1500 * UNIT, H * 1.3) - H * 0.15, L = R.r(40, 90) * UNIT;
    gcStroke([[x, y], [x - L * 0.28, y + L]], gcMix(gcM().sky1, '#ffffff', 0.5), 0.35);
  }
  gcLabel('[figure]', LX(PORTRAIT ? 0.6 : 0.56), g.cy - H * (PORTRAIT ? 0.17 : 0.24), 70 * UNIT, { t: E0 + 0.7, fill: gcM().accent, color: '#ffffff' });
  gcTag('[year]');
  gcCaption('[caption line]');
}
function sceneScale() {
  gcMood('neutral');
  const M = gcM(), s = Math.min(W, H), hz = H * (PORTRAIT ? 0.66 : 0.78);
  // a turbine hall: wall in two tones, a floor, pipes, windows, a ceiling light bar
  gcFill([[gcX0(), -H * 0.3], [gcX1(), -H * 0.3], [gcX1(), hz], [gcX0(), hz]], gcMix(M.cloth, M.concrete, 0.55), { lift: 0.06 });
  for (let i = 0; i < 5; i++) { const wx = LX(0.1 + i * 0.2) - 70 * UNIT; gcShape(rrectPts(wx, hz - H * 0.52, 140 * UNIT, 190 * UNIT, 20 * UNIT, 6), gcMix(M.sky0, '#ffffff', 0.3), { w: 0.8, shade: 0.04 }); gcStroke([[wx + 70 * UNIT, hz - H * 0.52], [wx + 70 * UNIT, hz - H * 0.52 + 190 * UNIT]], M.ink, 0.4); }
  gcFill([[gcX0(), hz - H * 0.1], [gcX1(), hz - H * 0.1], [gcX1(), hz + 8 * UNIT], [gcX0(), hz + 8 * UNIT]], gcMix(M.cloth, M.ink, 0.1), { lift: 0.05 });
  gcShape(rrectPts(gcX0(), hz - H * 0.17, gcX1() - gcX0(), 26 * UNIT, 8, 4), gcMix(M.concrete, M.ink, 0.2), { w: 0.7, cel: false });
  gcFill([[gcX0(), hz], [gcX1(), hz], [gcX1(), H * 1.3], [gcX0(), H * 1.3]], gcMix(M.concrete, M.ink, 0.28), { lift: 0.1 });
  const tr = s * (PORTRAIT ? 0.4 : 0.3), tx = LX(PORTRAIT ? 0.52 : 0.64), ty = hz - tr * 0.62;
  gcTurbine(tx, ty, tr, TT * 0.9);
  // the gag: a bus parked inside the turbine's footprint, same scale
  const bw = tr * 1.15, by = hz + H * (PORTRAIT ? 0.05 : 0.06), bx = tx + tr * (PORTRAIT ? 0.1 : 0.05);
  gcBus(bx, by, bw);
  // dimension brackets: the turbine's width (top) and the bus's length (bottom)
  const bt = ty - tr - 40 * UNIT, k1 = ev(E0 + 0.6, 0.5), k2 = ev(E0 + 1.1, 0.5);
  if (k1 > 0) { gcStroke([[tx - tr, bt], [tx - tr + 2 * tr * k1, bt]], M.ink, 0.8); gcStroke([[tx - tr, bt - 14 * UNIT], [tx - tr, bt + 14 * UNIT]], M.ink, 0.8); gcStroke([[tx + tr * (2 * k1 - 1), bt - 14 * UNIT], [tx + tr * (2 * k1 - 1), bt + 14 * UNIT]], M.ink, 0.8); }
  gcLabel('[figure]', tx, bt - 56 * UNIT, 64 * UNIT, { t: E0 + 1.0, fill: M.accent });
  const bb = by - bw * 0.34 * 1.12 - 36 * UNIT;
  if (k2 > 0) { const bl = bx - bw / 2; gcStroke([[bl, bb], [bl + bw * k2, bb]], '#ffffff', 0.8); gcStroke([[bl, bb - 12 * UNIT], [bl, bb + 12 * UNIT]], '#ffffff', 0.8); gcStroke([[bl + bw * k2, bb - 12 * UNIT], [bl + bw * k2, bb + 12 * UNIT]], '#ffffff', 0.8); }
  gcLabel('[figure]', bx, bb - 50 * UNIT, 60 * UNIT, { t: E0 + 1.5, fill: M.accent });
  gcSurveyor(LX(PORTRAIT ? 0.16 : 0.16), hz + H * (PORTRAIT ? 0.06 : 0.08), SV() * (PORTRAIT ? 0.85 : 0.9), { face: 'deadpan', pose: 'idle', key: 'sv3', look: [0.9, -0.2] });
  gcBirds('s', 0, 0, 0);
  gcTag('[year]');
  gcCaption('[caption line]');
}
function sceneMap() {
  gcMood('neutral');
  const M = gcM();
  gcFill([[gcX0(), -H * 0.3], [gcX1(), -H * 0.3], [gcX1(), H * 1.3], [gcX0(), H * 1.3]], gcMix(M.concrete, M.sky0, 0.22), { lift: 0.03 });
  for (let gx = 0; gx < 14; gx++) for (let gy = 0; gy < 22; gy++) { ctx.fillStyle = gcMix(M.concrete, M.cloth, 0.2); ctx.beginPath(); ctx.arc(gx * 90 * UNIT, gy * 90 * UNIT, 3.5 * UNIT, 0, TAU); ctx.fill(); }
  const mw = W * (PORTRAIT ? 0.88 : 0.58), mh = H * (PORTRAIT ? 0.46 : 0.66), mx = (W - mw) / 2 + (PORTRAIT ? 0 : -W * 0.1), my = H * (PORTRAIT ? 0.24 : 0.13);
  const pts = gcMapCard(mx, my, mw, mh, ev(E0 + 0.3, 1.8), 4);
  const shown = (k) => ev(E0 + 0.3 + k * 1.8, 0.3) > 0;
  if (shown(0.02)) gcLabel('[place]', pts.A[0], pts.A[1] + 44 * UNIT, 54 * UNIT, { t: E0 + 0.35 });
  if (shown(0.5)) gcLabel('[place]', pts.B[0], pts.B[1] - 150 * UNIT, 54 * UNIT, { t: E0 + 0.3 + 0.9 });
  if (shown(0.98)) gcLabel('[place]', pts.C[0], pts.C[1] + 44 * UNIT, 54 * UNIT, { t: E0 + 0.3 + 1.8 });
  // a compass rose on the card
  const cx = mx + mw - 90 * UNIT, cy2 = my + 100 * UNIT; gcShape([[cx, cy2 - 62 * UNIT], [cx + 16 * UNIT, cy2], [cx, cy2 + 62 * UNIT], [cx - 16 * UNIT, cy2]], M.concrete, { w: 0.8, round: false, shade: 0.1 }); gcText('N', cx, cy2 - 78 * UNIT, 34 * UNIT, M.ink, { align: 'center' });
  const fy = PORTRAIT ? my + mh + 24 * UNIT : H * 0.93;
  gcSurveyor(LX(PORTRAIT ? 0.85 : 0.84), fy, SV() * (PORTRAIT ? 0.6 : 1.0), { face: 'delight', pose: 'hold', key: 'sv4', flip: true });
  gcTag('[year]');
  gcCaption('[caption line]');
}
