// =====================================================================
//  STYLE: sensor-vision — a split-screen night drive. Top: what a human sees (dashcam). Bottom: what the car senses
//  (LiDAR point cloud, detection boxes, HUD). Black ground, white points, ONE colour per meaning:
//  green = tracked, red = lost or blind, amber/violet = 1550 nm LiDAR, cyan = radar, orange = thermal.
// =====================================================================
const SV = { bg: '#04070a', panel: '#070b10', edge: '#1b2631', ink: '#eef5f9', dim: '#7d8c98', green: '#2cff7a', red: '#ff3b3b', amber: '#ffb43a', violet: '#d08cff', cyan: '#3ad8ff', hot: '#ff8a2a' };
const SANS = '"Inter", "Helvetica Neue", Arial, sans-serif';

function svText(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? SANS}`; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = 'alphabetic';
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur ?? 12; }
  ctx.fillStyle = color; ctx.fillText(str, x, y); const w = ctx.measureText(str).width; ctx.restore(); return w;
}
function svPill(str, x, y, size, fg, bg, o = {}) {   // a chip with its left edge at x, baseline-centred on y
  ctx.save(); ctx.font = `${o.weight ?? 800} ${size}px ${o.font ?? SANS}`;
  const w = ctx.measureText(str).width + size * 0.9, h = size * 1.5, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, h * 0.28); ctx.fill();
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(str, x0 + size * 0.45, y + size * 0.04);
  ctx.restore(); return w;
}
function svGlow(x, y, r, rgb, a) {   // a soft round glow, rgb = '255,60,40'
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
const STYLE = {
  name: 'sensor-vision',
  paper: SV.bg,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero() {},
  heroColor: SV.green,
  post() {},
  ones: true,
};
