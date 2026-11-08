// ===== scene 7: recirculation and HEPA =====
const HP = { f0: VS('hepa', 1) - 0.4, f1: VS('hepa', 1) + 0.9, c0: VS('hepa', 2) - 0.25 };
HP.c1 = HP.c0 + 0.9;
const HFAN = [CAB.x, CAB.y + 0.66 * CAB.R];
sceneCams[6] = () => {
  const u = EZ.io(seg(TT, HP.f0, HP.f1)) * (1 - EZ.io(seg(TT, HP.c0, HP.c1)));
  const base = lg(1.1, 1.0, EZ.io(seg(TT, ERA_T[6], ERA_T[6] + 0.8)));
  return cam(lg(base, 3.1, u), 540, lerp(1000, HFAN[1], u), 540, lerp(950, 800, u));
};
function sceneHepa() {
  cwBG({ glow: CW.teal, glowA: 0.1, gy: 900 });
  const zoomU = EZ.io(seg(TT, HP.f0, HP.f1)) * (1 - EZ.io(seg(TT, HP.c0, HP.c1)));
  ctx.save(); ctx.globalAlpha *= 1 - 0.85 * zoomU;
  const A = cwCabin(CAB.x, CAB.y, CAB.R, { tshirt: 2 });
  const mix = (c1, c2) => (pf) => c1;
  const t = ERA_T[6];
  // ceiling streams: fresh cyan and recirculated teal
  for (const [P, s] of [[A.ceilL, 1], [A.ceilR, 2]]) { cwFlow(P, { n: 9, speed: 0.15, c: CW.cyan, r: 4.2, spread: 14, seed: s, t0: t }); cwFlow(P, { n: 9, speed: 0.15, c: CW.teal, r: 4.2, spread: 14, seed: s + 10, t0: t }); }
  // under the floor: both streams run to the fan, then split 50 / 50
  cwFlow(A.dropL, { n: 8, speed: 0.15, c: CW.cyan, r: 4, seed: 3, t0: t }); cwFlow(A.dropR, { n: 8, speed: 0.15, c: CW.cyan, r: 4, seed: 4, t0: t });
  const hf = cwPath([HFAN, [CAB.x, CAB.y + 0.50 * CAB.R], A.aisle.P[A.aisle.P.length - 1]]);
  const up = cwPath(cwSpline([HFAN, [CAB.x, CAB.y + 0.45 * CAB.R], [CAB.x, CAB.y + 0.2 * CAB.R], [CAB.x, CAB.y - 0.3 * CAB.R], [CAB.x, CAB.y - 0.72 * CAB.R]], 8));
  const sp = EZ.o3(ev(t + 0.8, 0.8)), outP = cwPath(cwSpline([HFAN, [700, HFAN[1] + 20], [850, HFAN[1] + 50], [1010, HFAN[1] + 110]], 10));
  if (sp > 0) { cwGlow(outP.P, CW.cyan, 4, { a: 0.35 * sp }); cwFlow(outP, { n: 6, speed: 0.2, c: CW.cyan, r: 4.2, t0: t + 0.8 }); cwGlow(up.P, CW.teal, 5, { a: 0.28 * sp }); cwFlow(up, { n: 9, speed: 0.17, c: CW.teal, r: 4.4, spread: 8, t0: t + 0.8, seed: 9 }); }
  cwDisc(HFAN[0], HFAN[1], 38, { spin: 12, c: CW.teal });
  // the cabin refresh wave on the last sentence
  const w = seg(TT, HP.c1, HP.c1 + 2.4);
  if (w > 0 && w < 1) { ctx.save(); ctx.beginPath(); ctx.arc(CAB.x, CAB.y, CAB.R - 4, 0, TAU); ctx.clip(); const x = CAB.x - CAB.R + 2 * CAB.R * w, g = ctx.createLinearGradient(x - 160, 0, x + 40, 0); g.addColorStop(0, cwRGBA(CW.cyan, 0)); g.addColorStop(0.8, cwRGBA(CW.cyan, 0.35)); g.addColorStop(1, cwRGBA(CW.cyan, 0)); ctx.fillStyle = g; ctx.fillRect(x - 160, CAB.y - CAB.R, 200, 2 * CAB.R); ctx.restore(); }
  ctx.restore();
  // the filter macro
  if (zoomU > 0.02) {
    ctx.save(); ctx.globalAlpha *= clamp(zoomU * 1.6);
    const fx = HFAN[0], fy = HFAN[1];
    cwFilter(fx, fy, 300, { pleats: 16 });
    for (let i = 0; i < 46; i++) {   // dust is caught on the pleats, clean air passes through
      const R = RNG('dust', i), caught = R.f() < 0.9, x = fx - 140 + 280 * R.f(), ph = (i / 46 + TT * 0.16) % 1;
      if (caught) { const y = lerp(fy + 120, fy + 24, Math.min(1, ph * 1.6)); ctx.fillStyle = cwRGBA('#aab5c1', 0.85); ctx.beginPath(); ctx.arc(x + Math.sin(TT * 2 + i) * 2, y + (ph > 0.62 ? Math.sin(TT * 3 + i) * 1.5 : 0), 3.4, 0, TAU); ctx.fill(); }
      else { const y = lerp(fy + 120, fy - 130, ph); ctx.fillStyle = cwRGBA('#aab5c1', ph < 0.6 ? 0.85 : 0); ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill(); }
    }
    for (let i = 0; i < 30; i++) { const R = RNG('clean', i), x = fx - 140 + 280 * R.f(), ph = (i / 30 + TT * 0.2) % 1; cwDot(x, lerp(fy - 26, fy - 150, ph), 3.6, CW.teal, 1 - ph); }
    ctx.restore();
    tagD('HEPA FILTER', 540, 440, VW('hepa', 'HEPA') - 0.1, { c: CW.teal, size: 44, a: zoomU });
    tagD('DUST CAUGHT', 300, 1170, VW('hepa', 'HEPA') + 0.9, { c: '#aab5c1', size: 32, a: zoomU });
    tagD('CLEAN AIR', 780, 1020, VW('hepa', 'HEPA') + 1.2, { c: CW.teal, size: 32, a: zoomU });
  }
  tagD('HALF RECIRCULATES', 540, 300, ERA_T[6] + 0.9, { c: CW.teal, size: 36, a: (1 - zoomU) * (1 - EZ.o2(seg(TT, HP.c1 - 0.3, HP.c1))) });
  tagD('OUT', 900, HFAN[1] + 40 + 0, ERA_T[6] + 1.5, { c: CW.cyan, size: 30, a: 1 - zoomU });
  // two-to-three-minute clock
  const cu = ev(HP.c1, 0.4); if (cu > 0 && TT < HP.c1 + 3) dEF(() => {
    ctx.save(); ctx.globalAlpha *= cu * (1 - EZ.i2(seg(TT, HP.c1 + 2.6, HP.c1 + 3.2)));
    ctx.translate(540, 360); ctx.fillStyle = cwRGBA(CW.dark, 0.8); ctx.beginPath(); ctx.arc(0, 0, 120, 0, TAU); ctx.fill();
    ctx.strokeStyle = cwRGBA(CW.line, 0.8); ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.stroke();
    ctx.strokeStyle = CW.cyan; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 100, -Math.PI / 2, -Math.PI / 2 + TAU * seg(TT, HP.c1, HP.c1 + 2.4)); ctx.stroke();
    cwText('2-3', 0, 12, 64, CW.white); cwText('MIN', 0, 56, 30, CW.cyan); ctx.restore();
  });
}

// ===== scene 8: the outflow valve =====
const VV = { o: VW('valve', 'opens'), c: VW('valve', 'closes'), s: VS('valve', 2), z: VW('valve', 'outflow') - 0.3 };
sceneCams[7] = () => cam(lg(1, 1.9, EZ.io(seg(TT, VV.z, VV.z + 1.3))), 570, 950, 540, lerp(840, 900, EZ.io(seg(TT, VV.z, VV.z + 1.3))));
const VALVE_ANG = () => {
  const sm = (a, b, t0) => (b - a) * EZ.io(seg(TT, t0, t0 + 0.7));
  return 5 + sm(5, 30, VV.o) + sm(30, 4, VV.c) + sm(4, 14, VV.s);
};
function sceneValve() {
  cwBG({ glow: CW.cyan, glowA: 0.08, gy: 900 });
  const px = 1200, py = 846, s = 2.0, th = VALVE_ANG();
  cwPlane(px, py, s, { cut: true });
  const lx = (x, y) => [px + x * s, py + y * s];
  // dense cabin air inside the hull
  for (let i = 0; i < 70; i++) { const R = RNG('vin', i), [x, y] = lx(-470 + 760 * R.f(), -48 + 84 * R.f()); cwDot(x + Math.sin(TT * 0.9 + i) * 10, y + Math.cos(TT * 0.8 + i * 2) * 7, 4.8, CW.cyan, 0.75); }
  // the valve: a hinged flap on the belly, aft
  const [vx, vy] = lx(-330, 54), hx = vx - 72, hy = vy + 4, L = 150, a = th * DEG;
  ctx.save(); ctx.fillStyle = CW.dark; ctx.fillRect(vx - 76, vy - 2, 152, 10); ctx.restore();
  const jet = cwPath(cwSpline([[vx - 30, vy - 40], [vx + 10, vy + 30], [vx + 120, vy + 100], [vx + 330, vy + 160], [vx + 560, vy + 200]], 10));
  cwFlow(jet, { n: Math.round(6 + th * 0.7), speed: 0.34, c: CW.cyan, r: 4.6, spread: 6 + th * 0.5, t0: ERA_T[7] + 0.3, a: clamp(th / 10) * 0.95, trail: 0.05 });
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a); ctx.fillStyle = CW.hull; ctx.beginPath(); ctx.roundRect(0, -5, L, 12, 5); ctx.fill(); ctx.strokeStyle = CW.amber; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  ctx.fillStyle = CW.amber; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, TAU); ctx.fill();
  // cabin altitude gauge, driven by the flap
  const alt = 6 + 0.07 * th;
  dEF(() => { cwGauge(700, 470, 170, alt, { lo: 0, hi: 16, step: 4, zones: [[0, 8, CW.cyan], [8, 10, CW.amber], [10, 16, CW.red]], label: 'CABIN ALT', readout: cwFmt(alt * 1000) + ' FT' }); });
  tagD('OUTFLOW VALVE', 330, 1130, VW('valve', 'outflow') + 0.3, { c: CW.amber, size: 36 });
  tagD('AIR OUT', 800, 1200, ERA_T[7] + 0.6, { c: CW.cyan, size: 34 });
}

// ===== scene 9: the Boeing 787 =====
const B7 = { nb: VS('b787', 1), el: VS('b787', 2), gg: VS('b787', 3) };
sceneCams[8] = () => cam(1, 540, 800);
function scene787() {
  cwBG({ glow: CW.cyan, glowA: 0.1, gy: 700 });
  const px = 540, py = 520, s = 0.8, lx = (x, y) => [px + x * s, py + y * s];
  cwPlane(px, py, s, { cut: true });
  // engine bleed pipe: amber until the 787 skips it
  const pipe = [lx(6, 84), lx(6, -40)], k = 1 - EZ.o3(ev(B7.nb + 0.4, 0.7));
  if (k > 0.01) { cwGlow(pipe, CW.amber, 8, { a: k }); }
  const [ex, ey] = lx(6, 118), xa = ev(B7.nb + 0.2, 0.3);
  if (xa > 0) { ctx.save(); ctx.globalAlpha = xa; ctx.strokeStyle = CW.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 30, ey - 30); ctx.lineTo(ex + 30, ey + 30); ctx.moveTo(ex + 30, ey - 30); ctx.lineTo(ex - 30, ey + 30); ctx.stroke(); ctx.restore(); }
  // belly inlet and the electric compressor in a magnifier bubble
  const [bx, by] = lx(-120, 54), bc = [470, 1010], br = 235, bu = EZ.o3(ev(B7.el - 0.2, 0.6));
  if (bu > 0) {
    ctx.save(); ctx.strokeStyle = cwRGBA(CW.cyan, 0.85 * bu); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bc[0], bc[1] - br); ctx.stroke(); ctx.fillStyle = CW.cyan; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill();
    ctx.translate(bc[0], bc[1]); ctx.scale(bu, bu); ctx.beginPath(); ctx.arc(0, 0, br, 0, TAU); ctx.fillStyle = cwRGBA(CW.dark, 0.88); ctx.fill(); ctx.strokeStyle = CW.cyan; ctx.lineWidth = 6; ctx.stroke(); ctx.clip();
    ctx.fillStyle = CW.metal2; ctx.beginPath(); ctx.roundRect(-190, -70, 110, 140, 18); ctx.fill(); ctx.strokeStyle = CW.amber; ctx.lineWidth = 4; ctx.stroke(); cwBolt(-135, 0, 1.4, CW.amber);
    ctx.fillStyle = CW.metal; ctx.fillRect(-80, -8, 60, 16);
    cwDisc(20, 0, 70, { spin: 14, c: CW.cyan });
    const P = cwPath([[-230, 0], [-80, 0], [20, 0], [130, -90], [200, -160]]);
    cwFlow(P, { n: 14, speed: 0.22, c: CW.cyan, r: 4.6, spread: 30, t0: B7.el, trail: 0.03 });
    ctx.restore();
    tagD('ELECTRIC COMPRESSOR', bc[0], bc[1] + br + 50, B7.el + 0.3, { c: CW.amber, size: 32 });
  }
  tagD('787', 540, 330, ERA_T[8] + 0.5, { c: CW.white, size: 48 });
  tagD('NO BLEED', 700, 700, B7.nb + 0.5, { c: CW.red, size: 36 });
  dEF(() => { const u = ev(B7.gg, 0.5); if (u > 0) { ctx.save(); ctx.globalAlpha *= u; cwGauge(850, 1150, 120, lerp(8, 6, EZ.o3(ev(B7.gg, 1.2))), { lo: 0, hi: 16, step: 4, zones: [[0, 8, CW.cyan], [8, 10, CW.amber], [10, 16, CW.red]], label: 'CABIN ALT', readout: cwFmt(lerp(8, 6, EZ.o3(ev(B7.gg, 1.2))) * 1000) + ' FT' }); ctx.restore(); } });
}
