// =====================================================================
//  STATION 0 / END — the hook (45 pilots, the red zero), then the fork: a BUY board and a RENT board.
//  The finale rebuilds the fork with RENT lit.
// =====================================================================
function board(x, y0, label, col, glowC, t0, o = {}) {
  if (TT < t0) return;
  const lift = dropIn(t0, 260), d = 160, ht = 130, z = 34 + lift, t = 12;
  shadowEll(x + 6, y0 + d / 2, 0, 28, 100, 0.35 * popS2(t0));
  isoCyl(x + 6, y0 + 12, 0, 7, 34 + lift, { col: PAL.steelD }); isoCyl(x + 6, y0 + d - 12, 0, 7, 34 + lift, { col: PAL.steelD });
  glow(glowC, o.lit ? 38 : 14, () => isoPanelX(x, y0, z, d, ht, t, { col, r: 10, edge: withA(glowC, 0.8), ew: 2 }));
  const f = panelFaceX(x, y0, z, d, ht, t);
  isoText(f, label, d / 2, ht * 0.62, 66, { align: 'center', color: PAL.text, glow: glowC });
  if (o.sub) isoText(f, o.sub, d / 2, ht * 0.86, 17, { align: 'center', color: withA(PAL.text, 0.8), font: ISOMONO });
  return f;
}
function stationFork(X, lit, t0) {
  // BUY on the right-up side (y<0), RENT on the left-down side (y>0)
  board(X + 170, -185, 'BUY', '#6a2234', PAL.red, t0 + 0.0);
  board(X + 170, -10, 'RENT', lit ? '#1a7e86' : '#175a70', lit ? PAL.amber : PAL.teal, t0 + 0.2, { lit, sub: lit ? 'RENT FIRST' : null });
}
// the hook: a counter of 45 pilots, then a red 0 slams in beside it
function stationHook(X) {
  const out = smoothstep(TT, Ts('l1') - 0.15, Ts('l1') + 0.35);
  if (out >= 1) return;
  const t1 = Ts('h1') + 0.1;
  if (TT > t1 - 0.02) {
    const lift = dropIn(t1, 300, { k: 120, damp: 0.7 }) + out * 320, z = 40 + lift, x = X + 90, y0 = -150, d = 160, ht = 140;
    shadowEll(x + 6, y0 + d / 2, 0, 28, 100, 0.3 * popS2(t1));
    isoCyl(x + 6, y0 + 12, 0, 7, z, { col: PAL.steelD }); isoCyl(x + 6, y0 + d - 12, 0, 7, z, { col: PAL.steelD });
    glow(PAL.amber, 16, () => isoPanelX(x, y0, z, d, ht, 12, { col: '#0a2038', r: 10, edge: PAL.amber, ew: 2 }));
    const f = panelFaceX(x, y0, z, d, ht, 12), n = Math.round(45 * smoothstep(TT, Ts('h1') + 0.3, Wt('h1', 3)));
    isoText(f, String(n), d / 2, ht * 0.66, 78, { align: 'center', color: PAL.amber, font: ISOMONO, glow: PAL.amber });
    isoText(f, 'HUMANOID PILOTS', d / 2, ht * 0.9, 15, { align: 'center', color: PAL.text, font: ISOMONO });
  }
  const t2 = Wt('h2', 3) - 0.2;
  if (TT > t2 - 0.02) {
    const lift = dropIn(t2, 420, { k: 260, damp: 0.42 }) + out * 320, z = 40 + lift, x = X + 90, y0 = 20, d = 160, ht = 150;
    shadowEll(x + 6, y0 + d / 2, 0, 28, 100, 0.3 * popS2(t2));
    isoCyl(x + 6, y0 + 12, 0, 7, z, { col: PAL.steelD }); isoCyl(x + 6, y0 + d - 12, 0, 7, z, { col: PAL.steelD });
    glow(PAL.red, 30, () => isoPanelX(x, y0, z, d, ht, 12, { col: '#2a0f22', r: 10, edge: PAL.red, ew: 2.5 }));
    const f = panelFaceX(x, y0, z, d, ht, 12);
    isoText(f, '0', d / 2, ht * 0.74, 120, { align: 'center', color: PAL.red, glow: PAL.red });
    isoText(f, 'IN PRODUCTION', d / 2, ht * 0.9, 15, { align: 'center', color: PAL.text, font: ISOMONO });
  }
}
// a floating "?" in amber, stacked layers for depth, above a point
function questionMark(x, y, z, size, a = 1) {
  if (a <= 0.01) return;
  const bob = Math.sin(TT * 2.4) * 5;
  ctx.save(); ctx.globalAlpha = clamp(a);
  for (let i = 8; i >= 0; i--) {
    const f = faceOf([x - size * 0.2 - i * 0.9, y + 6 + i * 0.9, z + size * 1.3 + bob], [1, 0, 0], [0, 0, -1]);
    isoText(f, '?', 0, 0, size, { weight: 900, color: i ? shade(PAL.amberD, 0.9) : PAL.amber, glow: i ? null : PAL.amber });
  }
  ctx.restore();
}
