// =====================================================================
//  STATION 0 / END — the fork: a BUY board and a RENT board. The finale rebuilds it with RENT lit.
// =====================================================================
function board(x, y0, label, col, glowC, t0, o = {}) {
  const lift = dropIn(t0, 260), d = 160, ht = 130, z = 34 + lift, t = 12;
  shadowEll(x + 6, y0 + d / 2, 0, 28, 100, 0.35 * popS2(t0));
  isoCyl(x + 6, y0 + 12, 0, 7, 34 + lift, { col: PAL.steelD }); isoCyl(x + 6, y0 + d - 12, 0, 7, 34 + lift, { col: PAL.steelD });
  glow(glowC, o.lit ? 38 : 14, () => isoPanelX(x, y0, z, d, ht, t, { col, r: 10, edge: withA(glowC, 0.8), ew: 2 }));
  const f = panelFaceX(x, y0, z, d, ht, t);
  isoText(f, label, d / 2, ht * 0.62, 66, { align: 'center', color: PAL.text, glow: glowC });
  if (o.sub) isoText(f, o.sub, d / 2, ht * 0.86, 17, { align: 'center', color: withA(PAL.text, 0.8), font: ISOMONO });
  return f;
}
function stationFork(X, lit) {
  // BUY on the right-up side (y<0), RENT on the left-down side (y>0)
  board(X + 170, -250, 'BUY', '#6a2234', PAL.red, Ts('hook') + 0.1, { sub: 'ILLUSTRATIVE  $100K' });
  board(X + 170, -20, 'RENT', lit ? '#1a7e86' : '#175a70', lit ? PAL.amber : PAL.teal, Ts('hook') + 0.3, { lit, sub: lit ? 'RENT FIRST' : 'ILLUSTRATIVE  $8.5K / MO' });
}
// a floating "?" in amber, stacked layers for depth, above a point
function questionMark(x, y, z, size, a = 1) {
  if (a <= 0.01) return;
  const bob = Math.sin(TT * 2.4) * 5, rot = 1;
  ctx.save(); ctx.globalAlpha = clamp(a);
  for (let i = 8; i >= 0; i--) {
    const f = faceOf([x - size * 0.2 - i * 0.9, y + 6 + i * 0.9, z + size * 1.3 + bob], [1, 0, 0], [0, 0, -1]);
    isoText(f, '?', 0, 0, size, { weight: 900, color: i ? shade(PAL.amberD, 0.9) : PAL.amber, glow: i ? null : PAL.amber });
  }
  ctx.restore();
}
