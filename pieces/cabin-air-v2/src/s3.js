// ===== scene 6: cabin air, HEPA, renewed in minutes =====
const CAB = { x: 540, y: 830, R: 360 };
const HP = { f0: VS('cabin', 1) + 0.25, f1: VS('cabin', 1) + 1.1, c0: VS('cabin', 2) - 0.2, ff: VW('cabin', 'filters') };
HP.c1 = HP.c0 + 0.8;
const HFAN = [CAB.x, CAB.y + 0.66 * CAB.R];
sceneCams[5] = () => {
  const u = EZ.io(seg(TT, HP.f0, HP.f1)) * (1 - EZ.io(seg(TT, HP.c0, HP.c1)));
  return cam(lg(1.0, 3.1, u), 540, lerp(950, HFAN[1], u), 540, lerp(900, 800, u));
};
function sceneCabin() {
  cwBG({ glow: CW.teal, glowA: 0.1, gy: 900 });
  const zoomU = EZ.io(seg(TT, HP.f0, HP.f1)) * (1 - EZ.io(seg(TT, HP.c0, HP.c1)));
  const t = ERA_T[5], tr = VS('cabin', 1);
  ctx.save(); ctx.globalAlpha *= 1 - 0.85 * zoomU;
  const A = cwCabin(CAB.x, CAB.y, CAB.R, { tshirt: 2 });
  const feed = cwPath([[540, 340], [540, CAB.y - 0.8 * CAB.R]]);
  cwGlow(feed.P, CW.cyan, 8, { a: 0.8 }); cwFlow(feed, { n: 6, speed: 0.4, c: CW.cyan, r: 5, t0: t });
  for (const [P, s] of [[A.ceilL, 1], [A.ceilR, 2]]) {
    cwFlow(P, { n: 14, speed: 0.15, c: CW.cyan, r: 4.2, spread: 14, seed: s, t0: t + 0.3, trail: 0.02 });
    cwFlow(P, { n: 9, speed: 0.15, c: CW.teal, r: 4.2, spread: 14, seed: s + 10, t0: tr });
  }
  cwFlow(A.dropL, { n: 8, speed: 0.15, c: CW.cyan, r: 4, seed: 3, t0: t + 0.8 }); cwFlow(A.dropR, { n: 8, speed: 0.15, c: CW.cyan, r: 4, seed: 4, t0: t + 0.8 });
  const up = cwPath(cwSpline([HFAN, [CAB.x, CAB.y + 0.45 * CAB.R], [CAB.x, CAB.y + 0.2 * CAB.R], [CAB.x, CAB.y - 0.3 * CAB.R], [CAB.x, CAB.y - 0.72 * CAB.R]], 8)), sp = EZ.o3(ev(tr, 0.8));
  if (sp > 0) { cwGlow(up.P, CW.teal, 5, { a: 0.28 * sp }); cwFlow(up, { n: 9, speed: 0.17, c: CW.teal, r: 4.4, spread: 8, t0: tr, seed: 9 }); }
  cwDisc(HFAN[0], HFAN[1], 38, { spin: 12, c: CW.teal });
  const w = seg(TT, HP.c1, HP.c1 + 1.8);
  if (w > 0 && w < 1) { ctx.save(); ctx.beginPath(); ctx.arc(CAB.x, CAB.y, CAB.R - 4, 0, TAU); ctx.clip(); const x = CAB.x - CAB.R + 2 * CAB.R * w, g = ctx.createLinearGradient(x - 160, 0, x + 40, 0); g.addColorStop(0, cwRGBA(CW.cyan, 0)); g.addColorStop(0.8, cwRGBA(CW.cyan, 0.35)); g.addColorStop(1, cwRGBA(CW.cyan, 0)); ctx.fillStyle = g; ctx.fillRect(x - 160, CAB.y - CAB.R, 200, 2 * CAB.R); ctx.restore(); }
  ctx.restore();
  if (zoomU > 0.02) {
    ctx.save(); ctx.globalAlpha *= clamp(zoomU * 1.6);
    const fx = HFAN[0], fy = HFAN[1];
    cwFilter(fx, fy, 300, { pleats: 16 });
    for (let i = 0; i < 46; i++) {
      const R = RNG('dust', i), caught = R.f() < 0.9, x = fx - 140 + 280 * R.f(), ph = (i / 46 + TT * 0.16) % 1;
      if (caught) { const y = lerp(fy + 120, fy + 24, Math.min(1, ph * 1.6)); ctx.fillStyle = cwRGBA('#aab5c1', 0.85); ctx.beginPath(); ctx.arc(x + Math.sin(TT * 2 + i) * 2, y + (ph > 0.62 ? Math.sin(TT * 3 + i) * 1.5 : 0), 3.4, 0, TAU); ctx.fill(); }
      else { const y = lerp(fy + 120, fy - 130, ph); ctx.fillStyle = cwRGBA('#aab5c1', ph < 0.6 ? 0.85 : 0); ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill(); }
    }
    for (let i = 0; i < 30; i++) { const R = RNG('clean', i), x = fx - 140 + 280 * R.f(), ph = (i / 30 + TT * 0.2) % 1; cwDot(x, lerp(fy - 26, fy - 150, ph), 3.6, CW.teal, 1 - ph); }
    ctx.restore();
    tagD('HEPA FILTER', 540, 440, HP.ff - 0.1, { c: CW.teal, size: 44, a: zoomU });
    tagD('DUST CAUGHT', 300, 1170, HP.ff + 0.8, { c: '#aab5c1', size: 32, a: zoomU });
    tagD('CLEAN AIR', 780, 1020, HP.ff + 1.1, { c: CW.teal, size: 32, a: zoomU });
  }
  tagD('FRESH AIR', 540, 300, t + 0.3, { c: CW.cyan, size: 36, a: (1 - zoomU) * (1 - EZ.o2(seg(TT, tr - 0.2, tr))) });
  tagD('HALF IS REUSED', 540, 300, tr, { c: CW.teal, size: 36, a: (1 - zoomU) * (1 - EZ.o2(seg(TT, HP.c1 - 0.3, HP.c1))) });
  const cu = ev(HP.c1, 0.4); if (cu > 0) dEF(() => {
    ctx.save(); ctx.globalAlpha *= cu;
    ctx.translate(540, 360); ctx.fillStyle = cwRGBA(CW.dark, 0.8); ctx.beginPath(); ctx.arc(0, 0, 120, 0, TAU); ctx.fill();
    ctx.strokeStyle = cwRGBA(CW.line, 0.8); ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.stroke();
    ctx.strokeStyle = CW.cyan; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 100, -Math.PI / 2, -Math.PI / 2 + TAU * seg(TT, HP.c1, HP.c1 + 1.8)); ctx.stroke();
    cwText('MINUTES', 0, 14, 36, CW.white); ctx.restore();
  });
}

// ===== scene 7: the outflow valve, up close =====
const VV = { v: VW('valve', 'valve'), o: VW('valve', 'open'), c: VW('valve', 'close') };
sceneCams[6] = () => cam(1 + 0.18 * EZ.io(seg(TT, ERA_T[6], ERA_T[7])), 440, 880, 440, 880);
const VALVE_ANG = () => 5 + 25 * EZ.io(seg(TT, VV.o, VV.o + 0.8)) - 26 * EZ.io(seg(TT, VV.c, VV.c + 0.8));
function sceneValve() {
  cwBG({ glow: CW.cyan, glowA: 0.08, gy: 900 });
  const s = 2.6, px = 440 + 330 * s, py = 860 - 54 * s, th = VALVE_ANG(), lx = (x, y) => [px + x * s, py + y * s];
  cwPlane(px, py, s, { cut: true });
  for (let i = 0; i < 70; i++) { const R = RNG('vin', i), [x, y] = lx(-470 + 760 * R.f(), -50 + 86 * R.f()); cwDot(x + Math.sin(TT * 0.9 + i) * 10, y + Math.cos(TT * 0.8 + i * 2) * 7, 5.2, CW.cyan, 0.75); }
  const [vx, vy] = lx(-330, 54), hx = vx - 72, hy = vy + 4, L = 150, a = th * DEG;
  ctx.save(); ctx.fillStyle = CW.dark; ctx.fillRect(vx - 76, vy - 2, 152, 10); ctx.restore();
  const jet = cwPath(cwSpline([[vx - 30, vy - 40], [vx + 10, vy + 30], [vx + 120, vy + 100], [vx + 330, vy + 160], [vx + 560, vy + 200]], 10));
  cwFlow(jet, { n: Math.round(6 + th * 0.7), speed: 0.34, c: CW.cyan, r: 4.6, spread: 6 + th * 0.5, t0: ERA_T[6] + 0.2, a: clamp(th / 10) * 0.95, trail: 0.05 });
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a); ctx.fillStyle = CW.hull; ctx.beginPath(); ctx.roundRect(0, -5, L, 12, 5); ctx.fill(); ctx.strokeStyle = CW.amber; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  ctx.fillStyle = CW.amber; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, TAU); ctx.fill();
  const alt = 6 + 0.07 * th;
  dEF(() => { cwGauge(760, 1150, 170, alt, { lo: 0, hi: 16, step: 4, zones: [[0, 8, CW.cyan], [8, 10, CW.amber], [10, 16, CW.red]], label: 'CABIN ALT', readout: cwFmt(alt * 1000) + ' FT' }); });
  tagD('OUTFLOW VALVE', 330, 1130, VV.v, { c: CW.amber, size: 36 });
  tagD('OPEN: PRESSURE FALLS', 700, 930, VV.o, { c: CW.cyan, size: 30, a: 1 - ev(VV.c - 0.15, 0.1) });
  tagD('CLOSED: PRESSURE RISES', 700, 930, VV.c, { c: CW.amber, size: 30 });
}

// ===== scene 9: the Boeing 787 =====
const B7 = { nb: VW('b787', 'skips'), el: VW('b787', 'electric'), gg: VW('b787', 'job') };
sceneCams[8] = () => cam(1, 540, 800);
function scene787() {
  cwBG({ glow: CW.cyan, glowA: 0.1, gy: 700 });
  const px = 540, py = 520, s = 0.8, lx = (x, y) => [px + x * s, py + y * s];
  cwPlane(px, py, s, { cut: true });
  const pipe = [lx(6, 84), lx(6, -40)], k = 1 - EZ.o3(ev(B7.nb + 0.2, 0.6));
  if (k > 0.01) cwGlow(pipe, CW.amber, 8, { a: k });
  const [ex, ey] = lx(6, 118), xa = ev(B7.nb + 0.1, 0.3);
  if (xa > 0) { ctx.save(); ctx.globalAlpha = xa; ctx.strokeStyle = CW.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 30, ey - 30); ctx.lineTo(ex + 30, ey + 30); ctx.moveTo(ex + 30, ey - 30); ctx.lineTo(ex - 30, ey + 30); ctx.stroke(); ctx.restore(); }
  const [bx, by] = lx(-120, 54), bc = [470, 1010], br = 235, bu = EZ.o3(ev(B7.el - 0.15, 0.5));
  if (bu > 0) {
    ctx.save(); ctx.strokeStyle = cwRGBA(CW.cyan, 0.85 * bu); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bc[0], bc[1] - br); ctx.stroke(); ctx.fillStyle = CW.cyan; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill();
    ctx.translate(bc[0], bc[1]); ctx.scale(bu, bu); ctx.beginPath(); ctx.arc(0, 0, br, 0, TAU); ctx.fillStyle = cwRGBA(CW.dark, 0.88); ctx.fill(); ctx.strokeStyle = CW.cyan; ctx.lineWidth = 6; ctx.stroke(); ctx.clip();
    ctx.fillStyle = CW.metal2; ctx.beginPath(); ctx.roundRect(-190, -70, 110, 140, 18); ctx.fill(); ctx.strokeStyle = CW.amber; ctx.lineWidth = 4; ctx.stroke(); cwBolt(-135, 0, 1.4, CW.amber);
    ctx.fillStyle = CW.metal; ctx.fillRect(-80, -8, 60, 16);
    cwDisc(20, 0, 70, { spin: 14, c: CW.cyan });
    cwFlow(cwPath([[-230, 0], [-80, 0], [20, 0], [130, -90], [200, -160]]), { n: 14, speed: 0.22, c: CW.cyan, r: 4.6, spread: 30, t0: B7.el, trail: 0.03 });
    ctx.restore();
    tagD('ELECTRIC COMPRESSOR', bc[0], bc[1] + br + 50, B7.el + 0.3, { c: CW.amber, size: 32 });
  }
  tagD('787', 540, 330, ERA_T[8] + 0.3, { c: CW.white, size: 48 });
  tagD('NO BLEED', 700, 700, B7.nb + 0.3, { c: CW.red, size: 36 });
  dEF(() => { const u = ev(B7.gg, 0.5); if (u > 0) { ctx.save(); ctx.globalAlpha *= u; const v = lerp(8, 6, EZ.o3(ev(B7.gg, 1.0))); cwGauge(850, 1150, 120, v, { lo: 0, hi: 16, step: 4, zones: [[0, 8, CW.cyan], [8, 10, CW.amber], [10, 16, CW.red]], label: 'CABIN ALT', readout: cwFmt(v * 1000) + ' FT' }); ctx.restore(); } });
}
