// =====================================================================
//  styles/drone/kit.js — top-down drone / satellite view of heavy infrastructure.
//  Dark ground, grey concrete with expansion joints, teal water with turbulence, neon red measurement lines.
//  Built on kit/core.js. Prefixed `dr` so it never collides with core names.
//  Needs from the piece head: nothing but W, H, TT (motion on 1s: STYLE.ones).
// =====================================================================
const DR = {
  ground: '#05080b', grid: 'rgba(120,170,200,0.07)', water: '#0a2431', waterL: '#14485a', foam: 'rgba(190,235,245,0.55)',
  concrete: '#7f8287', concreteL: '#a3a6ab', concreteD: '#4f5257', joint: 'rgba(20,22,26,0.55)', steel: '#55626d', steelD: '#2c353d',
  red: '#ff2b3a', redGlow: 'rgba(255,43,58,0.35)', white: '#eef2f5', amber: '#f0a81c', tug: '#e8742a', cyan: '#5fe3ff',
  box: ['#b5532c', '#2d7f8e', '#d4a03a', '#6d7f90', '#9c3b3b', '#3e6e4f', '#c9c3b2'],
};
const DR_FONT = '"Segoe UI", "Helvetica Neue", Arial, "DejaVu Sans", sans-serif';
const DR_MONO = 'Consolas, Menlo, "DejaVu Sans Mono", monospace';

function drText(str, x, y, size, color, o = {}) {
  ctx.save();
  ctx.font = `${o.weight ?? 700} ${size}px ${o.font ?? DR_FONT}`; ctx.fillStyle = color; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = o.base ?? 'alphabetic';
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur ?? 18; }
  if (o.track && 'letterSpacing' in ctx) ctx.letterSpacing = `${o.track}px`;
  ctx.fillText(str, x, y);
  ctx.restore();
}
function drTextW(str, size, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 700} ${size}px ${o.font ?? DR_FONT}`; if (o.track && 'letterSpacing' in ctx) ctx.letterSpacing = `${o.track}px`;
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}

// a hairline that stays the same width at any camera zoom
const drScale = () => { const m = ctx.getTransform(); return Math.max(1e-6, Math.hypot(m.a, m.b)); };
const drHair = (w) => w / drScale();

// ground: faint plan grid, so camera moves read as flying over something
function drGround(x0, y0, x1, y1) {
  ctx.fillStyle = DR.ground; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = DR.grid; ctx.lineWidth = drHair(1.2); ctx.beginPath();
  const g = 200;
  for (let x = Math.ceil(x0 / g) * g; x <= x1; x += g) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  for (let y = Math.ceil(y0 / g) * g; y <= y1; y += g) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
}

// concrete slab with expansion joints
function drConcrete(x, y, w, h, o = {}) {
  ctx.fillStyle = o.fill ?? DR.concrete; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = DR.joint; ctx.lineWidth = drHair(1.4); ctx.beginPath();
  const step = o.step ?? 90;
  for (let a = Math.ceil(x / step) * step; a < x + w; a += step) { ctx.moveTo(a, y); ctx.lineTo(a, y + h); }
  ctx.stroke();
  if (o.edge !== false) { ctx.strokeStyle = DR.concreteL; ctx.lineWidth = drHair(2); ctx.strokeRect(x, y, w, h); }
}

// water: base fill + seeded wave strokes that drift; turb 0..1 adds churn
function drWater(x, y, w, h, o = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = DR.water; ctx.fillRect(x, y, w, h);
  const R = RNG('drwater', Math.round(x), Math.round(y)), n = Math.min(260, Math.round(w * h / 2600)), turb = o.turb ?? 0;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const px = x + R.f() * w, py = y + R.f() * h, len = 18 + R.f() * 46, ph = R.f() * TAU, sp = 6 + R.f() * 10;
    const dx = Math.sin(TT * 0.8 + ph) * (4 + turb * 16) + (TT * sp * (o.flow ?? 0.4)) % 1, a = 0.07 + 0.1 * R.f() + turb * 0.18;
    ctx.strokeStyle = `rgba(120,200,225,${a})`; ctx.lineWidth = drHair(1.6 + turb * 1.4);
    ctx.beginPath(); ctx.moveTo(px + dx, py); ctx.quadraticCurveTo(px + dx + len / 2, py + Math.sin(TT * 1.6 + ph) * (2 + turb * 5), px + dx + len, py); ctx.stroke();
  }
  ctx.restore();
}

// a container ship seen from straight above, bow to +x. cx, cy = centre; len, beam in world px.
function drShip(cx, cy, len, beam, o = {}) {
  const x0 = cx - len / 2, x1 = cx + len / 2, hb = beam / 2, bow = Math.min(len * 0.14, beam * 1.1);
  ctx.save();
  // soft shadow on the water
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + beam * 0.04, len / 2 * 1.01, hb * 1.06, 0, 0, TAU); ctx.fill();
  // hull
  ctx.beginPath(); ctx.moveTo(x0, cy - hb * 0.9); ctx.lineTo(x1 - bow, cy - hb);
  ctx.quadraticCurveTo(x1 - bow * 0.15, cy - hb * 0.95, x1, cy); ctx.quadraticCurveTo(x1 - bow * 0.15, cy + hb * 0.95, x1 - bow, cy + hb);
  ctx.lineTo(x0, cy + hb * 0.9); ctx.quadraticCurveTo(x0 - len * 0.01, cy, x0, cy - hb * 0.9); ctx.closePath();
  ctx.fillStyle = o.hull ?? '#1d3b5c'; ctx.fill();
  ctx.lineWidth = drHair(2); ctx.strokeStyle = '#6f93b5'; ctx.stroke();
  // deck rim
  ctx.fillStyle = o.deck ?? '#2a4a6b'; ctx.fillRect(x0 + len * 0.02, cy - hb * 0.82, len * 0.9 - bow * 0.5, hb * 1.64);
  // containers: seeded stacks along the deck, forward of the bridge
  const R = RNG('drship', Math.round(len)), bx = x0 + len * 0.15, cw = len * 0.022, ch = Math.max(2, beam * 0.07);
  const bridgeX = x0 + len * 0.13, forward = x1 - bow * 1.3;
  for (let x = bridgeX + len * 0.06; x < forward; x += cw * 1.04) {
    const rows = Math.floor((hb * 1.5) / (ch * 1.1)), top = cy - rows * ch * 1.1 / 2;
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = R.pick(DR.box); ctx.fillRect(x, top + r * ch * 1.1, cw, ch);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + cw * 0.5, top + r * ch * 1.1, cw * 0.5, ch);
    }
  }
  // bridge house + funnel
  ctx.fillStyle = '#e8edf1'; ctx.fillRect(bx - len * 0.05, cy - hb * 0.7, len * 0.065, hb * 1.4);
  ctx.fillStyle = '#b9c2ca'; ctx.fillRect(bx - len * 0.03, cy - hb * 0.5, len * 0.03, hb);
  ctx.fillStyle = '#c0392b'; ctx.fillRect(bx - len * 0.085, cy - hb * 0.22, len * 0.03, hb * 0.44);
  // navigation lights: red to port, green to starboard at the bow, a white mast light that blinks
  const lr = Math.max(2.2, beam * 0.014), blinkOn = Math.floor(TT * 1.6) % 2 === 0;
  ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(x1 - bow * 0.95, cy - hb * 0.96, lr, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3bff7a'; ctx.beginPath(); ctx.arc(x1 - bow * 0.95, cy + hb * 0.96, lr, 0, TAU); ctx.fill();
  ctx.fillStyle = blinkOn ? '#ffffff' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(bx - len * 0.016, cy, lr * 1.2, 0, TAU); ctx.fill();
  // bow wake
  if (o.wake) {
    ctx.strokeStyle = DR.foam; ctx.lineWidth = drHair(2.2 * o.wake); ctx.globalAlpha *= 0.6 * o.wake;
    ctx.beginPath(); ctx.moveTo(x1 - bow * 0.5, cy - hb); ctx.lineTo(x1 - bow * 2.4, cy - hb * 1.12); ctx.moveTo(x1 - bow * 0.5, cy + hb); ctx.lineTo(x1 - bow * 2.4, cy + hb * 1.12); ctx.stroke();
  }
  ctx.restore();
}

// a neon measurement: glow + core, pulsing. Brackets at both ends.
function drNeon(x1, y1, x2, y2, o = {}) {
  const p = 0.65 + 0.35 * Math.sin(TT * (o.rate ?? 5.5)), k = (o.alpha ?? 1) * p, col = o.color ?? DR.red, w = o.w ?? 2.6;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = o.glow ?? DR.redGlow; ctx.globalAlpha = k; ctx.lineWidth = drHair(w * 5); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = col; ctx.globalAlpha = Math.min(1, (o.alpha ?? 1) * (0.8 + 0.2 * p)); ctx.lineWidth = drHair(w); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  if (o.ticks !== false) {   // end brackets, perpendicular
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, t = (o.tick ?? 10) / drScale();
    ctx.beginPath(); ctx.moveTo(x1 + nx * t, y1 + ny * t); ctx.lineTo(x1 - nx * t, y1 - ny * t); ctx.moveTo(x2 + nx * t, y2 + ny * t); ctx.lineTo(x2 - nx * t, y2 - ny * t); ctx.stroke();
  }
  ctx.restore();
}

// a label chip drawn in screen space at a world point (DEFER keeps it sharp and readable under any zoom)
function drTag(wx, wy, str, o = {}) {
  const [sx, sy] = toScreen(wx, wy);   // projected now, under the camera; drawn later in screen space
  const f = () => {
    const s = (o.size ?? 30) * 1.5, w = drTextW(str, s, { font: o.font, track: 1 }) + 34, h = s * 1.75, a = o.alpha ?? 1;
    if (sx < -w || sx > W + w || sy < -h || sy > H + h) return;
    ctx.save(); ctx.globalAlpha = a;
    const ox_ = PORTRAIT ? -(o.dy ?? 0) : (o.dx ?? 0), oy_ = PORTRAIT ? (o.dx ?? 0) : (o.dy ?? 0);   // offsets are given for 16:9 and turn with the rotated world in 9:16
    const x = clamp(sx - w / 2 + ox_, 24, W - w - 150), y = clamp(sy - h / 2 + oy_, PORTRAIT ? 250 : 24, PORTRAIT ? H - 420 - h : H - h - 24);   // a label slides along the frame edge instead of being cut off
    ctx.fillStyle = 'rgba(6,9,12,0.82)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = o.color ?? DR.red; ctx.lineWidth = 2; ctx.shadowColor = o.color ?? DR.red; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
    drText(str, x + w / 2, y + h / 2 + s * 0.36, s, o.text ?? DR.white, { align: 'center', track: 1, font: o.font });
    ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}

// a mule: a small electric locomotive on the wall rail. dir = +1 pulls from the wall above (y<0 side), -1 from below.
function drMule(x, y, side, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#2b2f34'; ctx.fillRect(-26, -13, 52, 26);
  ctx.fillStyle = o.color ?? DR.amber; ctx.fillRect(-23, -10, 46, 20);
  ctx.fillStyle = '#1b1e22'; ctx.fillRect(-9, -7, 18, 14);
  ctx.fillStyle = '#fff6d0'; ctx.fillRect(side > 0 ? 18 : -22, -3, 4, 6);
  ctx.restore();
}
// a cable from (ax, ay) to (bx, by) with a little live sag
function drCable(ax, ay, bx, by, o = {}) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, sag = Math.sin(TT * 1.3 + (o.ph ?? 0)) * (o.sag ?? 2.5);
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = drHair(5); ctx.beginPath(); ctx.moveTo(ax, ay + 2); ctx.quadraticCurveTo(mx, my + sag + 2, bx, by + 2); ctx.stroke();
  ctx.strokeStyle = o.color ?? '#e9edf0'; ctx.lineWidth = drHair(o.w ?? 2.4); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(mx, my + sag, bx, by); ctx.stroke();
  ctx.restore();
}
function drTug(x, y, o = {}) {
  ctx.save(); ctx.translate(x, y);
  if (o.wake) {   // a foam trail behind it, along the direction of travel (+x)
    ctx.strokeStyle = DR.foam; ctx.lineWidth = drHair(2); ctx.globalAlpha *= 0.6 * o.wake; ctx.lineCap = 'round';
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-40, sg * 13); ctx.lineTo(-40 - 120 * o.wake, sg * 24); ctx.stroke(); }
    ctx.globalAlpha /= (0.6 * o.wake);
  }
  ctx.rotate(o.rot ?? 0);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 3, 46, 17, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, -14); ctx.lineTo(24, -14); ctx.quadraticCurveTo(46, -10, 46, 0); ctx.quadraticCurveTo(46, 10, 24, 14); ctx.lineTo(-40, 14); ctx.closePath();
  ctx.fillStyle = DR.tug; ctx.fill(); ctx.lineWidth = drHair(2); ctx.strokeStyle = '#ffd2b0'; ctx.stroke();
  ctx.fillStyle = '#f4efe6'; ctx.fillRect(-14, -9, 22, 18); ctx.fillStyle = '#20272d'; ctx.fillRect(-8, -5, 10, 10);
  ctx.restore();
}

// a miter gate leaf from its hinge, at opening angle a (radians from +x axis, pointing into the channel by sgn)
function drLeaf(hx, hy, sgn, a, L, thick = 16) {
  const ex = hx + Math.cos(a) * L, ey = hy + sgn * Math.sin(a) * L;
  ctx.save(); ctx.lineCap = 'butt';
  ctx.strokeStyle = DR.steelD; ctx.lineWidth = thick + 6; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = DR.steel; ctx.lineWidth = thick; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.fillStyle = '#9fb0bd'; ctx.beginPath(); ctx.arc(hx, hy, thick * 0.6, 0, TAU); ctx.fill();
  ctx.restore();
}

// a plain dimension line with arrows and white text (screen-space label)
function drDim(x1, y1, x2, y2, label, o = {}) {
  drNeon(x1, y1, x2, y2, { color: o.color ?? DR.cyan, glow: 'rgba(95,227,255,0.25)', rate: 0.0001, w: 2, alpha: o.alpha ?? 1, tick: o.tick ?? 14 });
  drTag((x1 + x2) / 2, (y1 + y2) / 2, label, { color: o.color ?? DR.cyan, size: o.size ?? 26, alpha: o.alpha ?? 1, dx: o.dx, dy: o.dy });
}

// a car seen from above, to scale: 15 ft x 7 ft is 30 x 14 world px
function drCar(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(-14, -5, 30, 14);
  ctx.fillStyle = '#d9d9de'; ctx.beginPath(); ctx.roundRect(-15, -7, 30, 14, 4); ctx.fill();
  ctx.fillStyle = '#34414d'; ctx.fillRect(-6, -5.5, 12, 11);
  ctx.fillStyle = '#ff3b3b'; ctx.fillRect(-15, -5.5, 2, 3); ctx.fillRect(-15, 2.5, 2, 3);
  ctx.restore();
}

// a person on the wall in a hi-vis vest and hard hat
function drWorker(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(2, 3, 8, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ff8a1c'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 11, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffe44d'; ctx.beginPath(); ctx.arc(0, 0, 4.6, 0, TAU); ctx.fill();
  ctx.restore();
}

const STYLE = {
  name: 'drone',
  paper: DR.ground,
  backdrop(c) { fillAll(c); },
  window(P, key, src) { ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore(); },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.restore(); },
  hero() {},
  heroColor: '#ff2b3a',
  post() {   // a vignette over every frame, like a drone's lens (not on the end card)
    if (typeof END_T !== 'undefined' && TT >= END_T) return;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.hypot(W, H) * 0.58);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  ones: true,
};
