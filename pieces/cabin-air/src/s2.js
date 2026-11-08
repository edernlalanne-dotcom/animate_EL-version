// ===== scene 4: engine and bleed air =====
const BL = { e0: VS('bleed', 1) - 0.35 };
BL.e1 = BL.e0 + 1.3;
sceneCams[3] = () => {
  if (TT >= BL.e1) return null;
  const u = EZ.io(seg(TT, BL.e0, BL.e1));
  return u > 0 ? cam(lg(1, 3.4, u), 545, 806, 540, lerp(800, 860, u)) : null;
};
const ENG = { x: 540, y: 860, s: 1.15 };
const engT = (px, py) => [ENG.x + px * ENG.s, ENG.y + py * ENG.s];
function cwHeatLine(path, heatFn, w, frac = 1, a = 1) {   // a glowing line coloured along its length
  const n = 48, k = Math.round(n * frac);
  for (let i = 0; i < k; i++) { const f0 = i / n, f1 = Math.min(1, (i + 1.3) / n), P = [path.at(f0), path.at((f0 + f1) / 2), path.at(f1)]; cwGlow(P, heatFn(f0), w, { a }); }
}
function sceneBleed() {
  const out = 1 - EZ.io(seg(TT, BL.e1 - 0.55, BL.e1));
  if (out > 0) {
    ctx.save(); ctx.globalAlpha = out; cwBG({ glow: CW.amber, glowA: 0.06, gy: 800 });
    cwPlane(540, 700, 0.9, { cut: true });
    // stale air: dim grey dots drifting in the fuselage
    for (let i = 0; i < 38; i++) { const R = RNG('stale', i), x = 540 + 0.9 * (-440 + 900 * R.f()), y = 700 + 0.9 * (-44 + 82 * R.f()); ctx.fillStyle = cwRGBA('#8a97a6', 0.6); ctx.beginPath(); ctx.arc(x + Math.sin(TT * 0.8 + i) * 8, y + Math.cos(TT * 0.7 + i * 2) * 5, 4.4, 0, TAU); ctx.fill(); }
    const pu = flash(VS('bleed', 0) + 1.6, 1.2), gx = 545, gy = 806;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 90 + 120 * pu); g.addColorStop(0, cwRGBA(CW.amber, 0.5 * (0.4 + pu))); g.addColorStop(1, cwRGBA(CW.amber, 0)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(gx - 300, gy - 300, 600, 600); ctx.restore();
    tagD('STALE AIR', 540, 520, ERA_T[3] + 0.7, { c: '#8a97a6', size: 36 });
    tagD('ENGINES', 545, 960, VW('bleed', 'engines') - 0.1, { c: CW.amber, size: 36 });
    ctx.restore();
  }
  if (out < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - out; if (TT < BL.e1) screen();
    cwBG({ glow: CW.amber, glowA: 0.08, gy: 860 });
    const A = cwEngine(ENG.x, ENG.y, ENG.s, { spin: 9, heat: 1 });
    // airflow lanes through the compressor: cyan in, amber out
    const col = (pf) => cwHex(1 - clamp((pf - 0.28) / 0.45));
    [-42, 0, 42].forEach((y0, k) => {
      const P = cwPath(cwSpline([engT(-440, y0), engT(-300, y0), engT(-120, y0 * 0.62), engT(70, y0 * 0.34), engT(150, y0 * 0.3)], 10));
      cwFlow(P, { n: 11, speed: 0.17, c: col, r: 4.6, seed: k * 3, t0: BL.e1 - 0.4, trail: 0.03 });
    });
    // the bleed pipe up and away
    const pipe = cwPath(cwSpline([A.bleed, [A.bleed[0], 650], [640, 520], [800, 420], [1010, 372]], 12));
    const tp = VS('bleed', 2), pu = EZ.o3(ev(tp, 0.9));
    if (pu > 0) {
      cwHeatLine(pipe, () => CW.amber, 12, pu, 1);
      cwFlow(pipe, { n: 14, speed: 0.2, c: CW.amber, r: 5, t0: tp, trail: 0.03 });
      const hot = ev(VS('bleed', 4), 0.6); if (hot > 0) cwGlow(pipe.sub(1), CW.red, 6, { a: 0.5 * hot * (0.6 + 0.4 * Math.sin(TT * 8)) });
    }
    ctx.restore();
    tagD('COMPRESSOR', 400, 1150, VW('bleed', 'compressor'), { c: CW.white, size: 34 });
    tagD('BLEED AIR', 760, 600, VS('bleed', 3) + 0.15, { c: CW.amber, size: 40 });
    tagD('TOO HOT', 760, 690, VS('bleed', 4) + 0.5, { c: CW.red, size: 40 });
  }
}

// ===== scene 5: the air conditioning pack =====
const PK = { sq: VW('pack', 'squeeze'), co: VW('pack', 'cool'), ex: VW('pack', 'expand'), cy: VS('pack', 3) };
sceneCams[4] = () => cam(1, 540, 800);
const PACK_PTS = [[120, 330], [400, 330], [400, 445], [400, 595], [400, 720], [620, 720], [780, 720], [860, 720], [860, 840], [400, 840], [400, 855], [400, 1005], [400, 1130], [620, 1130], [780, 1130], [860, 1130], [860, 1215], [700, 1215], [700, 1285], [930, 1285]];
const PACK_P = cwPath(PACK_PTS);
const packHeat = (f) => { const k = [[0, 0], [0.2, 0.05], [0.27, 0], [0.34, 0.0], [0.5, 0.35], [0.6, 0.35], [0.8, 0.5], [0.9, 1], [1, 1]]; for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return cwHex(lerp(k[i - 1][1], k[i][1], (f - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))); return CW.cyan; };
function scenePack() {
  cwBG({ glow: CW.amber, glowA: 0.06, gy: 700 });
  // ram air crossing the heat exchangers
  const ra = ev(PK.co - 0.3, 0.5);
  for (const y of [520, 930]) {
    const R = cwPath([[110, y], [960, y]]);
    if (ra > 0) { cwGlow([[110, y], [960, y]], CW.cyan, 3, { a: 0.18 * ra }); cwFlow(R, { n: 12, speed: 0.22, c: CW.cyan, r: 4, seed: y, t0: PK.co - 0.3, spread: 24 }); }
  }
  // parts
  cwExchanger(400, 520, 360, 150); cwExchanger(400, 930, 360, 150);
  const spinK = 4 + 8 * ev(PK.sq, 1);
  cwDisc(700, 720, 80, { spin: spinK, c: CW.amber }); cwDisc(700, 1130, 80, { spin: spinK * (0.6 + 0.8 * ev(PK.ex, 1)), c: CW.cyan });
  ctx.fillStyle = CW.metal; ctx.fillRect(694, 800, 12, 250);   // the shaft joins compressor and turbine
  // the path draws on and glows by temperature
  const u = EZ.o2(ev(ERA_T[4] + 0.2, 1.4));
  cwHeatLine(PACK_P, packHeat, 11, u, 0.95);
  cwFlow(PACK_P, { n: 34, speed: 0.07, c: packHeat, r: 5, t0: ERA_T[4] + 0.6, trail: 0.02 });
  // colour pulse on the last sentence
  const pc = flash(PK.cy, 0.9); if (pc > 0) cwGlow(PACK_P.sub(1).slice(Math.floor(PACK_PTS.length * 0.8)), CW.cyan, 14, { a: 0.6 * pc });
  tagD('HEAT EXCHANGER', 400, 395, VS('pack', 0) + 0.8, { c: CW.white, size: 32 });
  tagD('COMPRESSOR', 700, 615, PK.sq, { c: CW.amber, size: 32 });
  tagD('OUTSIDE AIR', 790, 480, PK.co, { c: CW.cyan, size: 32 });
  tagD('TURBINE', 700, 1030, PK.ex, { c: CW.cyan, size: 32 });
  tagD('TO CABIN', 800, 1345, PK.cy, { c: CW.cyan, size: 34 });
}

// ===== scene 6: air through the cabin =====
const CAB = { x: 540, y: 830, R: 360 };
sceneCams[5] = () => cam(1 + 0.1 * EZ.io(seg(TT, ERA_T[5], ERA_T[6])), 540, 1000, 540, 950);
function sceneFlow() {
  cwBG({ glow: CW.cyan, glowA: 0.1, gy: 800 });
  const A = cwCabin(CAB.x, CAB.y, CAB.R, { tshirt: 2 });
  const feed = cwPath([[540, 340], [540, CAB.y - 0.8 * CAB.R]]);
  cwGlow(feed.P, CW.cyan, 8, { a: 0.8 }); cwFlow(feed, { n: 6, speed: 0.4, c: CW.cyan, r: 5, t0: ERA_T[5] });
  const t = ERA_T[5] + 0.5;
  cwFlow(A.ceilL, { n: 16, speed: 0.15, c: CW.cyan, r: 4.4, spread: 12, seed: 1, t0: t, trail: 0.02 });
  cwFlow(A.ceilR, { n: 16, speed: 0.15, c: CW.cyan, r: 4.4, spread: 12, seed: 2, t0: t, trail: 0.02 });
  cwFlow(A.ceilL, { n: 10, speed: 0.12, c: CW.cyan, r: 3.8, spread: 40, seed: 5, t0: t + 0.4 });
  cwFlow(A.ceilR, { n: 10, speed: 0.12, c: CW.cyan, r: 3.8, spread: 40, seed: 6, t0: t + 0.4 });
  cwFlow(A.dropL, { n: 8, speed: 0.15, c: CW.cyan, r: 4, seed: 7, t0: t + 0.8 }); cwFlow(A.dropR, { n: 8, speed: 0.15, c: CW.cyan, r: 4, seed: 8, t0: t + 0.8 });
  tagD('FRESH AIR', 540, 300, ERA_T[5] + 0.3, { c: CW.cyan, size: 36 });
  tagD('FLOOR GRILLES', 540, 1290, VW('flow', 'floor') - 0.3, { c: CW.white, size: 32 });
}
