// ===== scene 4: sealed air goes stale, one failure gives seconds =====
const ST = { f: VW('stale', 'failure') };
sceneCams[3] = () => cam(lg(1, 1.5, EZ.io(seg(TT, ERA_T[3] + 1.0, ERA_T[4]))), 545, 806, 540, 806);
function sceneStale() {
  cwBG({ glow: CW.amber, glowA: 0.06, gy: 800 });
  const fl = ev(ST.f, 0.2) * (0.5 + 0.5 * Math.sin(TT * 14));
  if (fl > 0) { ctx.save(); const px = 540, py = 700; ctx.strokeStyle = cwRGBA(CW.red, 0.8 * fl); ctx.lineWidth = 20; ctx.beginPath(); ctx.roundRect(px - 450 * 0.9, py - 70, 900 * 0.9 + 80, 130, 60); ctx.stroke(); ctx.restore(); }
  cwPlane(540, 700, 0.9, { cut: true });
  for (let i = 0; i < 38; i++) { const R = RNG('stale', i), x = 540 + 0.9 * (-440 + 900 * R.f()), y = 700 + 0.9 * (-44 + 82 * R.f()); ctx.fillStyle = cwRGBA(TT > ST.f ? '#a86a72' : '#8a97a6', 0.7); ctx.beginPath(); ctx.arc(x + Math.sin(TT * 0.8 + i) * 8, y + Math.cos(TT * 0.7 + i * 2) * 5, 4.4, 0, TAU); ctx.fill(); }
  const pu = flash(ERA_T[3] + 1.2, 1.2), gx = 545, gy = 806, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 90 + 120 * pu); g.addColorStop(0, cwRGBA(CW.amber, 0.5 * (0.4 + pu))); g.addColorStop(1, cwRGBA(CW.amber, 0)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(gx - 300, gy - 300, 600, 600); ctx.restore();
  tagD('STALE AIR', 540, 520, VW('stale', 'stale') - 0.1, { c: '#8a97a6', size: 36 });
  tagD('ONE FAILURE', 540, 1000, ST.f, { c: CW.red, size: 42 });
  tagD('SECONDS', 540, 1090, VW('stale', 'seconds') - 0.1, { c: CW.red, size: 42 });
}

// ===== scene 5: engine, bleed air, the pack =====
const EG = { sq: VW('engine', 'squeezes'), hot: VS('engine', 1), ov: VW('engine', 'oven'), pk: VS('engine', 2), cy: VS('engine', 3) };
EG.x0 = EG.pk - 0.45; EG.x1 = EG.pk + 0.15;
sceneCams[4] = () => null;
const ENG = { x: 540, y: 860, s: 1.15 };
const engT = (px, py) => [ENG.x + px * ENG.s, ENG.y + py * ENG.s];
function cwHeatLine(path, heatFn, w, frac = 1, a = 1) {
  const n = 48, k = Math.round(n * frac);
  for (let i = 0; i < k; i++) { const f0 = i / n, f1 = Math.min(1, (i + 1.3) / n), P = [path.at(f0), path.at((f0 + f1) / 2), path.at(f1)]; cwGlow(P, heatFn(f0), w, { a }); }
}
const PACK_PTS = [[120, 330], [400, 330], [400, 445], [400, 595], [400, 720], [620, 720], [780, 720], [860, 720], [860, 840], [400, 840], [400, 855], [400, 1005], [400, 1130], [620, 1130], [780, 1130], [860, 1130], [860, 1215], [700, 1215], [700, 1285], [930, 1285]];
const PACK_P = cwPath(PACK_PTS);
const packHeat = (f) => { const k = [[0, 0], [0.2, 0.05], [0.27, 0], [0.34, 0.0], [0.5, 0.35], [0.6, 0.35], [0.8, 0.5], [0.9, 1], [1, 1]]; for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return cwHex(lerp(k[i - 1][1], k[i][1], (f - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))); return CW.cyan; };
function sceneEngine() {
  const eo = 1 - EZ.io(seg(TT, EG.x0, EG.x1));
  if (eo > 0) {
    ctx.save(); ctx.globalAlpha *= eo; cwBG({ glow: CW.amber, glowA: 0.08, gy: 860 });
    const A = cwEngine(ENG.x, ENG.y, ENG.s, { spin: 9, heat: 1 });
    const col = (pf) => cwHex(1 - clamp((pf - 0.28) / 0.45));
    [-42, 0, 42].forEach((y0, k) => { const P = cwPath(cwSpline([engT(-440, y0), engT(-300, y0), engT(-120, y0 * 0.62), engT(70, y0 * 0.34), engT(150, y0 * 0.3)], 10)); cwFlow(P, { n: 11, speed: 0.19, c: col, r: 4.6, seed: k * 3, t0: ERA_T[4] + 0.1, trail: 0.03 }); });
    const pipe = cwPath(cwSpline([A.bleed, [A.bleed[0], 650], [640, 520], [800, 420], [1010, 372]], 12)), pu = EZ.o3(ev(EG.hot, 0.9));
    if (pu > 0) { cwHeatLine(pipe, () => CW.amber, 12, pu, 1); cwFlow(pipe, { n: 14, speed: 0.2, c: CW.amber, r: 5, t0: EG.hot, trail: 0.03 }); const hot = ev(EG.ov, 0.5); if (hot > 0) cwGlow(pipe.sub(1), CW.red, 6, { a: 0.5 * hot * (0.6 + 0.4 * Math.sin(TT * 8)) }); }
    ctx.restore();
    tagD('COMPRESSOR', 400, 1150, EG.sq, { c: CW.white, size: 34, a: eo });
    tagD('BLEED AIR', 760, 600, EG.hot + 0.1, { c: CW.amber, size: 40, a: eo });
    tagD('HOT AS AN OVEN', 740, 690, EG.ov, { c: CW.red, size: 38, a: eo });
  }
  if (eo < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - eo; cwBG({ glow: CW.amber, glowA: 0.06, gy: 700 });
    cwExchanger(400, 520, 360, 150); cwExchanger(400, 930, 360, 150);
    const spinK = 4 + 8 * ev(EG.pk, 1);
    cwDisc(700, 720, 80, { spin: spinK, c: CW.amber }); cwDisc(700, 1130, 80, { spin: spinK * (0.6 + 0.8 * ev(EG.pk + 0.8, 1)), c: CW.cyan });
    ctx.fillStyle = CW.metal; ctx.fillRect(694, 800, 12, 250);
    const u = EZ.o2(ev(EG.x0 + 0.3, 1.3));
    cwHeatLine(PACK_P, packHeat, 11, u, 0.95);
    cwFlow(PACK_P, { n: 34, speed: 0.08, c: packHeat, r: 5, t0: EG.x0 + 0.5, trail: 0.02 });
    const pc = flash(EG.cy, 0.9); if (pc > 0) cwGlow(PACK_P.sub(1).slice(Math.floor(PACK_PTS.length * 0.8)), CW.cyan, 14, { a: 0.6 * pc });
    ctx.restore();
    tagD('PACK', 400, 395, EG.pk + 0.2, { c: CW.white, size: 36 });
    tagD('TO CABIN', 800, 1345, EG.cy, { c: CW.cyan, size: 34 });
  }
}
