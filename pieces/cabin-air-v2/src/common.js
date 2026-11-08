// =====================================================================
const sceneCams = [];   // era -> (s, len) => cam | null, filled by the scene files
//  common parts: the cabin cross-section, the window view, clouds, small icons
// =====================================================================
const sT = () => TT - E0;
const flash = (t, d = 0.5) => 1 - EZ.o2(ev(t, d));   // 1 at t, fading to 0
// ---- cabin cross-section (front view), centred (cx, cy), shell radius R. o: a (alpha), tshirt (passenger index), people
const CAB_SK = [CW.skin[0], CW.skin[1], CW.skin[2], CW.skin[3], CW.skin[1], CW.skin[0]];
const CAB_SH = ['#7fa6c9', '#9aa9bb', '#5f87ad', '#a6b8c9', '#6f93b4', '#8ca3ba'];
function cwCabin(cx, cy, R, o = {}) {
  const fl = cy + 0.30 * R, a = o.a ?? 1;
  ctx.save(); ctx.globalAlpha *= a;
  // shell: transparent hull
  ctx.fillStyle = cwRGBA(CW.bg2, 0.78); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  // cargo hold below the floor
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 2, 0, TAU); ctx.clip(); ctx.fillStyle = cwRGBA(CW.dark, 0.5); ctx.fillRect(cx - R, fl, 2 * R, R); ctx.restore();
  // floor and bins and vent
  ctx.strokeStyle = cwRGBA(CW.hull, 0.8); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 0.953 * R, fl); ctx.lineTo(cx + 0.953 * R, fl); ctx.stroke();
  for (const sg of [-1, 1]) { ctx.fillStyle = cwRGBA(CW.metal, 0.75); ctx.beginPath(); ctx.roundRect(cx + sg * 0.60 * R - 0.22 * R, cy - 0.56 * R, 0.44 * R, 0.13 * R, 14); ctx.fill(); ctx.strokeStyle = cwRGBA(CW.hull, 0.6); ctx.lineWidth = 3; ctx.stroke(); }
  ctx.fillStyle = CW.metal; ctx.beginPath(); ctx.roundRect(cx - 0.26 * R, cy - 0.80 * R, 0.52 * R, 0.05 * R, 8); ctx.fill();
  // passengers: 3 + 3
  const xs = [-0.78, -0.58, -0.38, 0.38, 0.58, 0.78], s = R / 300;
  xs.forEach((fx, i) => {
    const hi = o.tshirt === i;
    cwPerson(cx + fx * R, fl, s, { skin: CAB_SK[i], shirt: hi ? CW.white : CAB_SH[i], sleeve: hi });
    if (hi) { ctx.strokeStyle = cwRGBA(CW.amber, 0.85 * (0.6 + 0.4 * Math.sin(TT * 5))); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx + fx * R, fl - 44 * s, 52 * s, 0, TAU); ctx.stroke(); }
  });
  // shell outline on top
  ctx.strokeStyle = cwRGBA(CW.white, 0.92); ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.restore();
  const P = (fx, fy) => [cx + fx * R, cy + fy * R];
  return {
    fl, P,
    ceilL: cwPath(cwSpline([P(-0.10, -0.76), P(-0.40, -0.68), P(-0.74, -0.46), P(-0.90, -0.15), P(-0.91, 0.18), P(-0.87, 0.30)], 10)),
    ceilR: cwPath(cwSpline([P(0.10, -0.76), P(0.40, -0.68), P(0.74, -0.46), P(0.90, -0.15), P(0.91, 0.18), P(0.87, 0.30)], 10)),
    aisle: cwPath(cwSpline([P(0, -0.74), P(0.0, -0.3), P(0, 0.1), P(0, 0.30)], 10)),
    dropL: cwPath(cwSpline([P(-0.87, 0.31), P(-0.84, 0.48), P(-0.5, 0.62), P(-0.12, 0.66)], 10)),
    dropR: cwPath(cwSpline([P(0.87, 0.31), P(0.84, 0.48), P(0.5, 0.62), P(0.12, 0.66)], 10)),
  };
}
// ---- clouds / speed streaks for the outside view
function cwClouds(y, depth, a, o = {}) {
  const m = ctx.getTransform(); ctx.save();
  for (let i = 0; i < 7; i++) {
    const R = RNG('cl', y, i), w = R.r(220, 420), x = mod(R.f() * (W + 700) - TT * (30 + 90 * depth) , W + 700) - 350, yy = y + R.r(-30, 30);
    const g = ctx.createRadialGradient(x, yy, 0, x, yy, w); g.addColorStop(0, `rgba(190,215,240,${0.20 * a})`); g.addColorStop(1, 'rgba(190,215,240,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, yy, w, w * 0.22, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function cwStreaks(n, a, y0, y1, speed) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const R = RNG('st', i), x = mod(R.f() * (W + 500) - TT * speed * (0.6 + R.f()), W + 500) - 250, y = lerp(y0, y1, R.f()), l = 60 + 160 * R.f();
    ctx.strokeStyle = cwRGBA(CW.white, a * (0.1 + 0.18 * R.f())); ctx.lineWidth = 2 + 2 * R.f(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke();
  }
  ctx.restore();
}
// ---- the window view: wall, window to the dark sky, a passenger in a T-shirt. sip 0..1 lifts the cup; o.a = alpha
function cwWindowView(o = {}) {
  const wx = 400, wy = 770, ww = 150, wh = 215, a = o.a ?? 1;
  ctx.save(); ctx.globalAlpha *= a;
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#173456'); bg.addColorStop(1, '#0a1730'); ctx.fillStyle = bg; ctx.fillRect(-W * 2, -H * 2, W * 5, H * 5);
  ctx.strokeStyle = cwRGBA(CW.line, 0.25); ctx.lineWidth = 3; for (const x of [60, 760]) { ctx.beginPath(); ctx.moveTo(x, 260); ctx.lineTo(x, 1500); ctx.stroke(); }
  // window recess
  ctx.fillStyle = '#0b1424'; ctx.beginPath(); ctx.ellipse(wx, wy, ww + 30, wh + 30, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = CW.metal; ctx.lineWidth = 8; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(wx, wy, ww, wh, 0, 0, TAU); ctx.clip();
  const sk = ctx.createLinearGradient(0, wy - wh, 0, wy + wh); sk.addColorStop(0, '#020a16'); sk.addColorStop(1, '#0d3050'); ctx.fillStyle = sk; ctx.fillRect(wx - ww, wy - wh, ww * 2, wh * 2);
  cwStreaks(10, 0.7, wy - wh, wy + wh, 900);
  if (o.thin !== undefined) for (let i = 0; i < 9; i++) { const R = RNG('thin', i), x = mod(R.f() * 400 - TT * 60 * (0.5 + R.f()), 360) + wx - 180, y = wy + (R.f() - 0.5) * wh * 1.7; cwDot(x, y, 3.4, CW.cyan, 0.8 * ev(o.thin, 0.5)); }
  ctx.fillStyle = 'rgba(210,225,240,0.9)'; ctx.beginPath(); ctx.moveTo(wx - 20, wy + wh); ctx.lineTo(wx + 140, wy + 20); ctx.lineTo(wx + ww + 10, wy + 36); ctx.lineTo(wx + 60, wy + wh); ctx.closePath(); ctx.fill();   // wing tip
  ctx.restore();
  ctx.strokeStyle = cwRGBA(CW.hull, 0.35); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(wx, wy, ww, wh, 0, 0, TAU); ctx.stroke();
  // passenger, in profile, facing the window
  const hx = 700, hy = 690, sip = o.sip ?? 0, sk0 = CW.skin[1];
  ctx.fillStyle = '#7a8da1'; ctx.beginPath(); ctx.roundRect(610, 760, 300, 560, 40); ctx.fill();                 // seat back
  ctx.fillStyle = '#e8eff6'; ctx.beginPath(); ctx.roundRect(630, 800, 230, 330, 60); ctx.fill();                  // T-shirt torso
  ctx.fillStyle = sk0; ctx.beginPath(); ctx.roundRect(765, 760, 60, 60, 20); ctx.fill();                          // neck
  ctx.fillStyle = sk0; ctx.beginPath(); ctx.arc(hx, hy, 78, 0, TAU); ctx.fill();                                   // head
  ctx.beginPath(); ctx.moveTo(hx - 70, hy + 4); ctx.lineTo(hx - 98, hy + 30); ctx.lineTo(hx - 66, hy + 36); ctx.closePath(); ctx.fill();   // nose
  ctx.fillStyle = '#1a2230'; ctx.beginPath(); ctx.arc(hx + 6, hy - 6, 80, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); ctx.beginPath(); ctx.arc(hx + 30, hy - 10, 50, 0, TAU); ctx.fill();   // hair
  ctx.fillStyle = '#0b1424'; ctx.beginPath(); ctx.arc(hx - 40, hy - 8, 6, 0, TAU); ctx.fill();                      // eye
  // tray, cup, arm
  ctx.fillStyle = '#3c5873'; ctx.beginPath(); ctx.roundRect(520, 1100, 380, 26, 8); ctx.fill();
  const tray = [585, 1068], mouth = [hx - 70, hy + 78], cp = [lerp(tray[0], mouth[0] - 6, EZ.io(sip)), lerp(tray[1], mouth[1] + 10, EZ.io(sip))];
  const sh = [765, 880];
  ctx.strokeStyle = '#e8eff6'; ctx.lineWidth = 62; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.lineTo(lerp(sh[0], cp[0] + 46, 0.55), lerp(sh[1], cp[1] + 20, 0.5)); ctx.stroke();   // sleeve
  ctx.strokeStyle = sk0; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(lerp(sh[0], cp[0] + 46, 0.5), lerp(sh[1], cp[1] + 20, 0.48)); ctx.lineTo(cp[0] + 40, cp[1] + 6); ctx.stroke();   // forearm
  ctx.fillStyle = '#f4f8fb'; ctx.beginPath(); ctx.moveTo(cp[0] - 30, cp[1] - 40); ctx.lineTo(cp[0] + 30, cp[1] - 40); ctx.lineTo(cp[0] + 22, cp[1] + 34); ctx.lineTo(cp[0] - 22, cp[1] + 34); ctx.closePath(); ctx.fill();   // cup
  ctx.fillStyle = CW.amber; ctx.fillRect(cp[0] - 27, cp[1] - 14, 54, 12);
  ctx.strokeStyle = cwRGBA(CW.white, 0.5); ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k = 0; k <= 12; k++) { const u = k / 12, x = cp[0] - 14 + i * 14 + Math.sin(TT * 3 + i * 2 + u * 6) * 8, y = cp[1] - 48 - u * 70; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.globalAlpha *= 0.8; ctx.stroke(); ctx.globalAlpha /= 0.8; }
  ctx.restore();
}
// a warning-triangle / horn icon, an oxygen mask, a bolt
function cwBolt(x, y, s, c = CW.amber) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(-18, 6); ctx.lineTo(-2, 6); ctx.lineTo(-8, 30); ctx.lineTo(18, -8); ctx.lineTo(2, -8); ctx.closePath(); ctx.fill(); ctx.restore(); }
function cwHorn(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = CW.red; ctx.beginPath(); ctx.moveTo(-30, -14); ctx.lineTo(-8, -14); ctx.lineTo(24, -36); ctx.lineTo(24, 36); ctx.lineTo(-8, 14); ctx.lineTo(-30, 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = CW.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.globalAlpha = clamp(0.9 - ((t * 2 + i * 0.33) % 1)); ctx.beginPath(); ctx.arc(26, 0, 22 + i * 18, -0.8, 0.8); ctx.stroke(); } ctx.restore(); }
function cwMask(x, y, s, swing) { ctx.save(); ctx.translate(x, y); ctx.rotate(swing); ctx.scale(s, s); ctx.strokeStyle = cwRGBA(CW.amber, 0.9); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, 0); ctx.stroke(); ctx.fillStyle = cwRGBA(CW.white, 0.92); ctx.beginPath(); ctx.ellipse(0, 18, 26, 22, 0, 0, TAU); ctx.fill(); ctx.fillStyle = cwRGBA(CW.cyan, 0.9); ctx.beginPath(); ctx.arc(0, 18, 9, 0, TAU); ctx.fill(); ctx.restore(); }
// screen-space overlays: labels never scale with the camera
const dEF = (f) => { if (DEFER) DEFER.push(f); else f(); };
const tagD = (str, x, y, t0, o) => dEF(() => cwTag(str, x, y, t0, o));
const bigD = (str, x, y, size, c, t0, o) => dEF(() => cwBig(str, x, y, size, c, t0, o));
