// =====================================================================
//  STATION 1 — the aisle: a RaaS card slides in, an invoice drops.   (c1, c2, c3)
// =====================================================================
function stationAisle(X, hx) {
  // c1: a ring under the walking hero marks the human-sized aisle
  const ra = smoothstep(TT, Ts('c1'), Ts('c1') + 0.4) * (1 - smoothstep(TT, Te('c1'), Te('c1') + 0.5));
  if (ra > 0.01) {
    const gf = groundFace(hx, 0, 0);
    ctx.save(); ctx.globalAlpha = ra * 0.9;
    faceEll(gf, 0, 0, 80, 62, { stroke: PAL.teal, w: 3 });
    for (let i = 0; i < 2; i++) { const k = mod(TT * 0.8 + i * 0.5, 1); ctx.globalAlpha = ra * (1 - k) * 0.7; faceEll(gf, 0, 0, 80 + k * 60, 62 + k * 46, { stroke: PAL.teal, w: 2 }); }
    ctx.restore();
  }
  // c2: the RaaS card drops onto two posts
  const t2 = Ts('c2') + 0.05, out = smoothstep(TT, Te('c3') + 0.3, Te('c3') + 1.0), lift = dropIn(t2, 320, { k: 110, damp: 0.7 }) - out * 330;
  if (TT > t2 - 0.02 && out < 1) {
    const cx = X + 20, cy = -300, d = 250, ht = 170, z = 70 + lift;
    isoCyl(cx + 10, cy + 24, 0, 8, z, { col: PAL.steelD }); isoCyl(cx + 10, cy + d - 24, 0, 8, z, { col: PAL.steelD });
    shadowEll(cx + 6, cy + d / 2, 0, 30, 130, 0.3 * popS2(t2));
    glow(PAL.teal, 24, () => isoPanelX(cx, cy, z, d, ht, 12, { col: '#0f4a66', r: 12, edge: withA(PAL.teal, 0.9), ew: 2 }));
    const f = panelFaceX(cx, cy, z, d, ht, 12);
    faceRR(f, 22, 26, 44, 32, 9, { fill: PAL.steel }); faceRR(f, 12, 62, 64, 50, 12, { fill: PAL.steel });
    faceRR(f, 27, 36, 34, 11, 5, { fill: PAL.visor }); glow(PAL.amber, 12, () => faceEll(f, 44, 41.5, 3.5, 3.5, { fill: PAL.amber }));
    faceEll(f, 44, 86, 5.5, 5.5, { fill: PAL.amber });
    isoText(f, 'RaaS', 96, 92, 76, { color: PAL.text, glow: PAL.teal });
    const lit = TT >= Wt('c2', 4);
    isoText(f, 'ROBOTICS AS A SERVICE', 20, 146, 21, { color: lit ? PAL.amber : PAL.textD, font: ISOMONO, glow: lit ? PAL.amber : null });
    const a0 = TT * 3.2;   // the subscription loop
    faceLine(f, arcPts(228, 36, 18, a0, a0 + 4.3, 20), PAL.amber, 4);
    faceEll(f, 228 + Math.cos(a0 + 4.3) * 18, 36 + Math.sin(a0 + 4.3) * 18, 4.5, 4.5, { fill: PAL.amber });
  }
  // a subscription pulse: amber chips travel the lane once a month (idle motion while RaaS is explained)
  if (TT > Ts('c2') + 0.9 && TT < Te('c3') + 0.6) for (let i = 0; i < 10; i++) {
    const t0 = Ts('c2') + 0.9 + i * 0.6, q = (TT - t0) / 1.8; if (q <= 0 || q >= 1) continue;
    glow(PAL.amber, 12, () => isoBox(X - 60 + q * 380, 70, 0, 26, 16, 4, { col: PAL.amber, r: 3, cap: 1.1 }));
  }
  // c3: the monthly invoice drops on the floor
  const t3 = Ts('c3') + 0.5, dz = dropIn(t3, 340, { k: 140, damp: 0.5 }) - out * 0, ix = X + 210, iy = -90;
  if (TT > t3 - 0.02 && TT < Te('c3') + 1.4) {
    shadowEll(ix + 40, iy + 50, 0, 60, 70, 0.35 * popS2(t3));
    for (let k = 0; k < 4; k++) isoBox(ix + (k % 2) * 3, iy + (k % 3) * 2, k * 4 + dz * (1 + k * 0.05), 80, 100, 4, { col: shade('#cfe3ec', 1.05 - k * 0.04), r: 3 });
    const top = groundFace(ix + 3, iy + 4, 16 + dz * 1.15);
    isoText(top, 'INVOICE', 8, 24, 18, { color: '#27415c', font: ISOMONO });
    for (let i = 0; i < 4; i++) faceLine(top, [[8, 38 + i * 12], [72 - (i % 2) * 18, 38 + i * 12]], 'rgba(39,65,92,0.45)', 2);
    isoText(top, '$ / MONTH', 8, 92, 15, { color: PAL.amberD, font: ISOMONO });
    // a repeating stamp: a month tile pulses every second
    glow(PAL.amber, 14, () => faceRR(top, 56, 8, 18, 14, 3, { fill: withA(PAL.amber, 0.5 + 0.5 * blinkOn(TT, 1.0) ), stroke: PAL.amber }));
  }
}
