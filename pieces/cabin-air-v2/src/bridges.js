// =====================================================================
//  ERAS, CAMERAS, DIVES — cabin-air (read by kit/morph.js). Scenes are hard cuts joined by a camera dive:
//  each scene zooms into DIVEQ[era] at its end, the next one starts zoomed in on the same screen point and pulls out.
// =====================================================================
const ERA_BG = ERA_LIST.map(() => CW.bg);
const BRIDGES = [];
const cam = (z, px, py, tx = 540, ty = 800) => ({ z, p: [px, py], to: [tx, ty] });
const lg = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), clamp(u)));   // zoom interpolated on a log scale
// the screen point each scene dives into at its end (the next scene opens out of it)
const DIVEQ = [[400, 770], [540, 800], [540, 790], [545, 806], [700, 1285], [540, 1068], [800, 960], [540, 800], [540, 950], [540, 800], [540, 800]];
function pieceCam(era, t) {
  const E = ERA_LIST[era], s = t - E[0], len = E[1] - E[0], f = sceneCams[era];
  const spec = f ? f(s, len) : null, c = spec ? camOf(spec) : { z: 1, tx: 0, ty: 0 };
  let k = 1, q = null;
  if (era > 0) { const u = EZ.o3(seg(s, 0, 0.55)); if (u < 1) { k = 1 + 1.6 * (1 - u); q = DIVEQ[era - 1]; } }
  if (era < ERA_LIST.length - 1) { const u = EZ.i3(seg(s, len - 0.34, len)); if (u > 0) { k = 1 + 2.4 * u; q = DIVEQ[era]; } }
  if (!q || k === 1) return spec ? c : null;
  return { z: k * c.z, tx: k * (c.tx - q[0]) + q[0], ty: k * (c.ty - q[1]) + q[1] };
}
// the dive's dark pulse and the end card, drawn after everything
function cwPost() {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const tb of ERA_T.slice(1, -1)) {
    const a = 0.92 * Math.max(EZ.i2(seg(TT, tb - 0.26, tb)) * (TT < tb ? 1 : 0), (1 - EZ.o2(seg(TT, tb, tb + 0.32))) * (TT >= tb ? 1 : 0));
    if (a > 0.01) {
      ctx.fillStyle = cwRGBA(CW.bg, a); ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(540, 800, 0, 540, 800, 900); g.addColorStop(0, cwRGBA(CW.cyan, 0.22 * a)); g.addColorStop(1, cwRGBA(CW.cyan, 0));
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    }
  }
  if (TT >= CARD0) {   // the channel card, last 2 seconds
    const u = EZ.o2(ev(CARD0, 0.18)), z = 1 + 0.03 * seg(TT, CARD0, DURATION);
    ctx.fillStyle = '#000'; ctx.globalAlpha = u; ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    drawAsset('subscribe.jpg', 0, (H - W) / 2, W, W, { fit: 'contain', alpha: u });
  }
  ctx.restore();
}
