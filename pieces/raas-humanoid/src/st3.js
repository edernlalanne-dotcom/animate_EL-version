// =====================================================================
//  STATION 3 — obsolescence: a staircase of ever newer models, a dusty old robot, the vendor's swap.  (s2a..s2d)
// =====================================================================
function stationUpgrade(X, hx) {
  const tA = Ts('s2a');
  // ---- s2a / s2b: five pedestals, each model a step higher, lighting one by one
  const stA = popS2(tA - 0.1) * (1 - smoothstep(TT, Ts('s2d') - 0.2, Ts('s2d') + 0.4));
  if (stA > 0.02) {
    const y0 = -230;
    for (let i = 0; i < 5; i++) {
      const t0 = tA + 0.15 + i * 0.32, a = popS2(t0, { k: 150 }), s = Math.min(1, a), x0 = X - 150 + i * 92, h = 20 + i * 22;
      if (a < 0.02) continue;
      const lit = clamp((TT - t0 - 0.2) / 0.3);
      isoBox(x0, y0, 0, 80, 80, h * s, { col: mixC('#1c4f78', '#2a8fa0', i / 4), r: 8 });
      const pf = faceOf([x0, y0 + 80, h * s], [1, 0, 0], [0, 0, -1]);
      if (h * s > 26) isoText(pf, 'V' + (i + 1), 40, 22, 20, { align: 'center', color: PAL.text, font: ISOMONO });
      robotMini(x0 + 40, y0 + 40, h * s, 0.42 + i * 0.06, { col: mixC('#7a8c99', PAL.steel, i / 4), acc: i === 4 ? PAL.teal : PAL.amber, dim: (4 - i) * 0.08, seed: i });
      if (lit > 0) { ctx.save(); ctx.globalAlpha = lit * (0.6 + 0.4 * blinkOn(TT, 1.0, i * 0.2)); glow(PAL.amber, 14, () => faceEll(groundFace(x0 + 40, y0 + 40, h * s + 1), 0, 0, 38, 30, { stroke: PAL.amber, w: 2.5 })); ctx.restore(); }
    }
    // an arrow along the foot of the steps: time moves right
    const ar = smoothstep(TT, tA + 0.3, tA + 1.9);
    if (ar > 0.02) glow(PAL.amber, 12, () => { line3([[X - 190, y0 + 110, 2], [X - 190 + 520 * ar, y0 + 110, 2]], PAL.amber, 4); });
  }
  // the DIGIT 4 -> DIGIT 5 pair (s2b): two signs on the floor
  const dA = popS2(Ts('s2b') + 0.1) * (1 - smoothstep(TT, Ts('s2c') + 0.1, Ts('s2c') + 0.5));
  if (dA > 0.02) {
    const f = groundFace(X + 20, -90, 0), a = Math.min(1, dA);
    ctx.save(); ctx.globalAlpha = a;
    faceRR(f, 0, 0, 320, 60, 12, { fill: withA('#06132a', 0.85), stroke: PAL.amber, w: 2.5 });
    isoText(f, 'DIGIT 4', 18, 42, 32, { color: PAL.textD }); isoText(f, '→', 150, 43, 34, { color: PAL.amber, glow: PAL.amber }); isoText(f, 'DIGIT 5', 190, 42, 32, { color: PAL.text, glow: PAL.teal });
    ctx.restore();
  }
  // ---- s2c: the purchased robot on the right gathers dust and an OUTDATED stamp
  const oA = popS2(Ts('s2c') - 0.1);
  const swapT = Ts('s2d') + 0.2, swap = smoothstep(TT, swapT, swapT + 1.5);
  const oldDim = smoothstep(TT, Ts('s2c'), Te('s2c'));
  const padY = lerp(90, 420, swap), newY = lerp(-420, 90, swap);
  if (oA > 0.02 && swap < 1) {
    const px = X + 130;
    isoBox(px - 60, padY - 60, 0, 120, 120, 10, { col: '#17405f', r: 10, edge: withA(PAL.amber, 0.7), ew: 2 });
    robotMini(px, padY, 10, 0.95 * Math.min(1, oA), { col: '#aab7c0', acc: PAL.amber, dim: 0.15 + oldDim * 0.7, seed: 7 });
    if (TT > Ts('s2c') + 0.5 && swap < 0.5) {   // dust falls
      for (let i = 0; i < 14; i++) { const R = RNG('dust', i), q = mod(TT * 0.4 + R.f(), 1); ctx.save(); ctx.globalAlpha = (1 - q) * 0.7 * oldDim; const p = isoP([px - 40 + R.f() * 80, padY - 40 + R.f() * 80, 200 - q * 190]); ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, TAU); ctx.fillStyle = '#9aa7b0'; ctx.fill(); ctx.restore(); }
    }
    const sT = Ts('s2c') + 0.9, sd = dropIn(sT, 260, { k: 150, damp: 0.45 });
    if (TT > sT - 0.02 && swap < 0.4) {
      const sx = px - 20, sy = padY + 70;
      glow(PAL.red, 22, () => isoPanelY(sx - 80, sy, 20 + sd, 160, 62, 8, { col: '#7a1f2c', r: 8, edge: PAL.red, ew: 2.2 }));
      isoText(panelFaceY(sx - 80, sy, 20 + sd, 160, 62, 8), 'OUTDATED', 80, 41, 31, { align: 'center', color: '#ffe3e6' });
    }
  }
  // ---- s2d: the vendor swaps the model: the old pad slides out, a new robot rides in
  if (TT > Ts('s2d') && swap > 0.001) {
    const px = X + 130;
    if (swap < 1) { isoBox(px - 60, newY - 60, 0, 120, 120, 10, { col: '#17405f', r: 10, edge: withA(PAL.teal, 0.9), ew: 2 }); robotMini(px, newY, 10, 0.95, { col: '#e8f2f7', acc: PAL.teal, seed: 3 }); }
    else { isoBox(px - 60, 30, 0, 120, 120, 10, { col: '#17405f', r: 10, edge: withA(PAL.teal, 0.9), ew: 2 }); robotMini(px, 90, 10, 0.95, { col: '#e8f2f7', acc: PAL.teal, seed: 3 }); }
  }
  // a vendor van marker (a small box with a label) at the left of the swap
  const vA = popS2(Ts('s2d') + 0.1);
  if (vA > 0.02) {
    const f = groundFace(X + 230, -70, 0), s = Math.min(1, vA);
    ctx.save(); ctx.globalAlpha = s; faceRR(f, 0, 0, 180, 52, 10, { fill: withA('#06132a', 0.85), stroke: PAL.teal, w: 2.5 }); isoText(f, 'VENDOR SWAP', 90, 35, 25, { align: 'center', color: PAL.teal, glow: PAL.teal }); ctx.restore();
  }
}
