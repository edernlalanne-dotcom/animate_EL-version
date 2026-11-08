// ===== scene 1: hook =====
const HK = { d0: VS('open', 2) - 0.35 };
HK.d1 = HK.d0 + 1.7;
sceneCams[0] = (s) => {
  if (TT >= HK.d1) return null;
  const u1 = EZ.io(seg(TT, 3.6, HK.d1)), uD = EZ.io(seg(TT, HK.d0, HK.d1));
  const z = TT < HK.d0 ? 1 + 0.32 * EZ.io(seg(TT, 3.6, HK.d0)) : lg(1.32, 27, uD);
  return cam(z, lerp(530, 627, u1), lerp(780, 757, u1), lerp(540, 400, uD), lerp(800, 770, uD));
};
function sceneHook() {
  const out = 1 - EZ.io(seg(TT, HK.d1 - 0.55, HK.d1));
  if (out > 0) {
    ctx.save(); ctx.globalAlpha = out;
    cwBG({ glow: CW.cyan, glowA: 0.12, gy: 700, top: '#07182c', bot: '#050c18' });
    for (let i = 0; i < 40; i++) { const R = RNG('star', i); ctx.fillStyle = cwRGBA(CW.white, 0.15 + 0.5 * R.f()); ctx.beginPath(); ctx.arc(R.f() * W * 1.2 - 60, R.f() * 560 + 60, 1 + 2 * R.f(), 0, TAU); ctx.fill(); }
    cwClouds(1180, 0.5, 1); cwClouds(1320, 1.0, 1.3);
    cwStreaks(18, 0.9, 380, 1250, 760);
    cwPlane(530, 780 + Math.sin(TT * 0.9) * 7, 0.9);
    // cruise label and outside temperature, in screen space
    const fade = 1 - EZ.o2(seg(TT, HK.d0 - 0.1, HK.d0 + 0.3));
    dEF(() => { ctx.save(); ctx.globalAlpha *= fade; cwTag('35,000 FT', 330, 470, VW('open', 'thirty-five'), { c: CW.cyan, size: 42 }); cwBig('−54°C', 540, 1130, 160, CW.cyan, VW('open', 'minus')); ctx.restore(); });
    ctx.restore();
  }
  if (out < 1) {
    ctx.save(); const inn = 1 - out; if (TT < HK.d1) screen();
    cwWindowView({ a: inn, thin: VS('open', 2) + 0.4, sip: 0 });
    ctx.restore();
    dEF(() => {
      ctx.save(); ctx.globalAlpha *= inn;
      cwBig('−54°C', 400, 470, 96, CW.cyan, HK.d1 - 0.3);
      cwTag('THIN AIR', 400, 1090, VS('open', 2) + 0.6, { c: CW.cyan, size: 34 });
      cwBig('?', 700, 520, 190, CW.amber, VS('open', 3) + 0.25);
      cwTag('T-SHIRT', 700, 1200, VS('open', 3) + 0.1, { c: CW.amber, size: 34 });
      ctx.restore();
    });
  }
}

// ===== scene 2: pressure and the sealed tube =====
const TB = { b: VS('tube', 1) - 0.2, c: VS('tube', 2) - 0.15 };
sceneCams[1] = () => cam(1 + 0.07 * EZ.io(seg(TT, ERA_T[1], ERA_T[2])), 540, 800);
function cwBox(cx, y0, w, h, n, seed, a, c) {   // a box of molecules, n of them
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = cwRGBA(CW.panel, 0.55); ctx.beginPath(); ctx.roundRect(cx - w / 2, y0, w, h, 22); ctx.fill(); ctx.strokeStyle = cwRGBA(CW.white, 0.55); ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < n; i++) {
    const R = RNG('bx', seed, i), px = R.f(), py = R.f(), fx = R.r(0.5, 1.4), fy = R.r(0.5, 1.4), ph = R.f() * TAU;
    const x = cx - w / 2 + 24 + (w - 48) * (0.5 + 0.5 * Math.sin(TT * fx + ph + px * 6)), y = y0 + 24 + (h - 48) * (0.5 + 0.5 * Math.sin(TT * fy + ph * 1.7 + py * 6));
    cwDot(x, y, 4.6, c, 0.9);
  }
  ctx.restore();
}
function sceneTube() {
  cwBG({ glow: CW.cyan, glowA: 0.10, gy: 760 });
  const a = 1 - EZ.io(seg(TT, TB.b - 0.35, TB.b + 0.35)), r = 1 - a;
  if (a > 0.01) {
    cwBox(300, 380, 360, 640, 120, 1, a, CW.cyan); cwBox(780, 380, 360, 640, 28, 2, a, CW.cyan);
    ctx.save(); ctx.globalAlpha *= a; cwText('SEA LEVEL', 300, 1090, 40, CW.white); cwText('35,000 FT', 780, 1090, 40, CW.white); ctx.restore();
    bigD('¼', 780, 330, 150, CW.amber, VW('tube', 'quarter') - 0.1, { a });
    tagD('ABOUT A QUARTER', 780, 1170, VW('tube', 'quarter') + 0.1, { c: CW.amber, size: 32 });
  }
  if (r > 0.01) {
    const cx = 540, cy = 790, R = 340; ctx.save(); ctx.globalAlpha *= r;
    const pulse = flash(TB.c, 0.9);
    ctx.save(); ctx.strokeStyle = cwRGBA(CW.cyan, 0.2 + 0.7 * pulse); ctx.lineWidth = 16 + 30 * pulse; ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, TAU); ctx.stroke(); ctx.restore();
    cwCabin(cx, cy, R, {});
    // dense air inside, thin air outside
    for (let i = 0; i < 46; i++) { const Rr = RNG('in', i), ang = Rr.f() * TAU, rr = Math.sqrt(Rr.f()) * (R - 36), ph = Rr.f() * TAU; cwDot(cx + Math.cos(ang + Math.sin(TT * 0.8 + ph) * 0.25) * rr, cy + Math.sin(ang + Math.cos(TT * 0.7 + ph) * 0.25) * rr * 0.96, 4.4, CW.cyan, 0.85); }
    for (let i = 0; i < 22; i++) { const Rr = RNG('out', i), ang = Rr.f() * TAU + TT * 0.06 * (i % 2 ? 1 : -1), w = Rr.r(0.6, 1.2), rr = R + 34 + 170 * Math.abs(Math.sin(TT * w + Rr.f() * TAU)); cwDot(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 4.2, CW.cyan, 0.8); }
    // pressure arrows after the seal: long from inside, short from outside
    const ar = ev(TB.c, 0.5);
    if (ar > 0) for (let i = 0; i < 10; i++) {
      const ang = i / 10 * TAU + 0.3, c = Math.cos(ang), s = Math.sin(ang), L = 80 * EZ.o3(ar);
      ctx.save(); ctx.strokeStyle = cwRGBA(CW.cyan, 0.9); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + c * (R - 90 - L), cy + s * (R - 90 - L)); ctx.lineTo(cx + c * (R - 90), cy + s * (R - 90)); ctx.stroke();
      ctx.strokeStyle = cwRGBA(CW.white, 0.75); ctx.lineWidth = 3.5; const l2 = 24 * EZ.o3(ar); ctx.beginPath(); ctx.moveTo(cx + c * (R + 70), cy + s * (R + 70)); ctx.lineTo(cx + c * (R + 70 - l2), cy + s * (R + 70 - l2)); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
    tagD('SEALED TUBE', 540, 330, TB.b + 0.25, { c: CW.white, size: 44 });
    tagD('AIR STAYS IN', 330, 1250, TB.c + 0.15, { c: CW.cyan, size: 32 });
    tagD('THIN AIR STAYS OUT', 760, 1250, TB.c + 0.5, { c: CW.white, size: 32 });
  }
}

// ===== scene 3: cabin altitude =====
const LV = { s1: VS('level', 1), s2: VS('level', 2) };
sceneCams[2] = () => cam(1 + 0.05 * EZ.io(seg(TT, ERA_T[2], ERA_T[3])), 540, 800);
const lvY = (ft) => 1250 - ft * 0.09;   // px for feet
const RIDGE = [[200, 1250], [330, 1130], [450, 1000], [560, 860], [660, 700], [740, 520], [790, 400], [830, 350], [880, 450], [930, 600], [980, 760], [1100, 900], [1100, 1250]];
const ridgeY = (x) => { for (let i = 1; i < RIDGE.length; i++) if (x <= RIDGE[i][0]) { const a = RIDGE[i - 1], b = RIDGE[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return 1250; };
function sceneLevel() {
  cwBG({ glow: CW.cyan, glowA: 0.08, gx: 700, gy: 800 });
  // mountain
  const g = ctx.createLinearGradient(0, 330, 0, 1250); g.addColorStop(0, '#5f7f9d'); g.addColorStop(0.35, '#30506f'); g.addColorStop(1, '#142a45');
  ctx.save(); ctx.beginPath(); ctx.moveTo(RIDGE[0][0], RIDGE[0][1]); RIDGE.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = cwRGBA(CW.white, 0.7); ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = 'rgba(244,248,251,0.9)'; ctx.beginPath(); ctx.moveTo(740, 520); ctx.lineTo(790, 400); ctx.lineTo(830, 350); ctx.lineTo(880, 450); ctx.lineTo(850, 470); ctx.lineTo(820, 440); ctx.lineTo(790, 480); ctx.closePath(); ctx.fill(); ctx.restore();
  // town on the slope around 6,500 ft
  const tk = ev(ERA_T[2] + 0.6, 0.5);
  for (let i = 0; i < 6; i++) { const x = 662 + i * 17, y = ridgeY(x) + 4, h = 18 + (i % 3) * 5; ctx.save(); ctx.globalAlpha = tk; ctx.fillStyle = '#d8e4ee'; ctx.fillRect(x - 8, y - h, 16, h); ctx.fillStyle = CW.red; ctx.beginPath(); ctx.moveTo(x - 10, y - h); ctx.lineTo(x, y - h - 12); ctx.lineTo(x + 10, y - h); ctx.fill(); ctx.fillStyle = CW.amber; ctx.fillRect(x - 3, y - h + 5, 6, 6); ctx.restore(); }
  // ruler
  ctx.save(); ctx.strokeStyle = cwRGBA(CW.white, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, lvY(0)); ctx.lineTo(150, lvY(10000)); ctx.stroke();
  for (let ft = 0; ft <= 10000; ft += 2000) { ctx.beginPath(); ctx.moveTo(150, lvY(ft)); ctx.lineTo(176, lvY(ft)); ctx.stroke(); cwText(cwFmt(ft), 128, lvY(ft) + 11, 30, CW.white, { align: 'right', weight: 700 }); }
  ctx.restore();
  // the cabin band, 6,000 to 8,000
  const bu = EZ.o3(ev(LV.s1, 0.9)), top = lerp(lvY(6000), lvY(8000), bu);
  if (bu > 0) { ctx.save(); ctx.fillStyle = cwRGBA(CW.cyan, 0.22); ctx.fillRect(150, top, 880, lvY(6000) - top); ctx.strokeStyle = cwRGBA(CW.cyan, 0.9); ctx.lineWidth = 4; ctx.strokeRect(150, top, 880, lvY(6000) - top); ctx.restore(); }
  // the cap at 8,000
  const cu = EZ.o3(ev(LV.s2, 0.5));
  if (cu > 0) { ctx.save(); ctx.strokeStyle = CW.red; ctx.lineWidth = 8; ctx.setLineDash([26, 14]); ctx.beginPath(); ctx.moveTo(150, lvY(8000)); ctx.lineTo(lerp(150, 1030, cu), lvY(8000)); ctx.stroke(); ctx.restore(); }
  tagD('MOUNTAIN TOWN', 400, 800, VS('level', 0) + 0.7, { c: CW.white, size: 34 });
  dEF(() => { const k = ev(VS('level', 0) + 0.7, 0.4); if (k > 0) cwLeader(560, 812, 686, ridgeY(686) - 12, VS('level', 0) + 0.9); });
  tagD('CABIN', 330, 628, LV.s1 + 0.5, { c: CW.cyan, size: 36 });
  tagD('6,000 TO 8,000 FT', 520, 1330, LV.s1 + 0.2, { c: CW.cyan, size: 36 });
  tagD('MAX 8,000 FT', 560, 470, LV.s2 + 0.25, { c: CW.red, size: 40 });
}
