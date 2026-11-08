// ===== scene 10: the warning =====
const WN = { w0: VS('warn', 0) + 0.3, ten: VW('warn', 'ten'), fo: VW('warn', 'fourteen'), end: VL('warn').t1 };
const warnAlt = () => {
  if (TT < WN.w0) return 7;
  if (TT < WN.end) { const k = [[WN.w0, 7], [WN.ten, 10], [WN.fo, 14], [WN.end, 14.7]]; for (let i = 1; i < k.length; i++) if (TT <= k[i][0]) return lerp(k[i - 1][1], k[i][1], EZ.io(seg(TT, k[i - 1][0], k[i][0])) * 0.6 + 0.4 * seg(TT, k[i - 1][0], k[i][0])); }
  return lerp(14.7, 7, EZ.io(seg(TT, WN.end + 0.05, WN.end + 1.0)));
};
sceneCams[9] = () => { const sh = TT > WN.ten && TT < WN.end ? 7 * Math.exp(-(TT - WN.ten) * 1.2) : 0; return cam(1, 540, 800, 540 + Math.sin(TT * 61) * sh, 800 + Math.cos(TT * 53) * sh); };
function sceneWarn() {
  cwBG({ glow: CW.red, glowA: 0.04 + 0.06 * (TT > WN.w0 && TT < WN.end ? 1 : 0), gy: 760 });
  const alt = warnAlt(), mu = EZ.io(seg(TT, WN.fo - 0.4, WN.fo + 0.6));
  const cx = lerp(540, 250, mu), cy = lerp(740, 450, mu), r = lerp(320, 150, mu);
  if (mu > 0) {
    const A = cwCabin(600, 990, 300, { a: mu });
    for (let i = 0; i < 6; i++) { const fx = [-0.78, -0.58, -0.38, 0.38, 0.58, 0.78][i], k = EZ.back(ev(WN.fo + 0.1 + i * 0.07, 0.35)), sw = Math.sin(TT * 3 + i) * 0.1 * k; if (k > 0) cwMask(600 + fx * 300, 990 - 0.6 * 300 + 120 * k - 20, 1.4, sw); }
  }
  const redZ = TT > WN.ten ? 1 : 0;
  cwGauge(cx, cy, r, alt, { lo: 0, hi: 16, step: 2, zones: [[0, 8, CW.cyan], [8, 10, CW.amber], [10, 16, CW.red]], label: 'CABIN ALT', readout: cwFmt(alt * 1000) + ' FT', readoutC: alt >= 10 ? CW.red : CW.white, needle: alt >= 10 ? CW.red : CW.white });
  if (TT > WN.ten) cwHorn(840, 470, 1.9, TT - WN.ten);
  // red edge pulse while the pressure is falling
  dEF(() => { if (TT > WN.w0 && TT < WN.end + 0.4) { const a = (0.12 + 0.12 * Math.abs(Math.sin(TT * 5))) * (1 - EZ.i2(seg(TT, WN.end, WN.end + 0.5))); const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1100); g.addColorStop(0, cwRGBA(CW.red, 0)); g.addColorStop(1, cwRGBA(CW.red, a * 2.2)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); } });
  tagD('PRESSURE DROP', 540, 330, WN.w0, { c: CW.red, size: 38, a: 1 - mu });
  tagD('HORN AT 10,000 FT', 540, 1190, WN.ten + 0.1, { c: CW.red, size: 38, a: 1 - mu });
  tagD('MASKS AT 14,000 FT', 600, 1330, WN.fo + 0.3, { c: CW.amber, size: 36 });
}

// ===== scene 11: the payoff =====
const PO = { v: VS('payoff', 1), f: VS('payoff', 2), sip: VS('payoff', 3), win: VS('payoff', 3) - 0.3 };
sceneCams[10] = () => cam(1 + 0.06 * EZ.io(seg(TT, ERA_T[10], PO.win)), 540, 800);
function insetCircle(cx, cy, r, t0, c, draw) {
  const k = popS(t0); if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = cwRGBA(CW.dark, 0.85); ctx.fill(); ctx.save(); ctx.clip(); draw(); ctx.restore(); ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.restore();
}
function scenePayoff() {
  const wv = EZ.io(seg(TT, PO.win, PO.win + 0.5));
  if (wv < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - wv;
    cwBG({ glow: CW.cyan, glowA: 0.1, gy: 850 });
    const A = cwCabin(CAB.x, 860, 340, { tshirt: 2 }), t = ERA_T[10];
    for (const [P, s] of [[A.ceilL, 1], [A.ceilR, 2]]) { cwFlow(P, { n: 9, speed: 0.12, c: CW.cyan, r: 4, spread: 14, seed: s, t0: t }); cwFlow(P, { n: 9, speed: 0.12, c: CW.teal, r: 4, spread: 14, seed: s + 10, t0: t }); }
    insetCircle(190, 480, 115, ERA_T[10] + 0.5, CW.cyan, () => { ctx.translate(-190, -480); cwGauge(190, 505, 105, 7, { lo: 0, hi: 16, step: 4, zones: [[0, 8, CW.cyan], [8, 10, CW.amber], [10, 16, CW.red]] }); });
    insetCircle(810, 480, 115, PO.v, CW.amber, () => { ctx.translate(-810, -480); const a = (8 + 14 * (0.5 + 0.5 * Math.sin(TT * 4))) * DEG; ctx.fillStyle = CW.dark; ctx.fillRect(700, 520, 220, 10); ctx.save(); ctx.translate(745, 482); ctx.rotate(a); ctx.fillStyle = CW.hull; ctx.beginPath(); ctx.roundRect(0, -5, 130, 12, 5); ctx.fill(); ctx.restore(); cwFlow(cwPath([[760, 440], [830, 520], [920, 560]]), { n: 6, speed: 0.3, c: CW.cyan, r: 3.5 }); });
    insetCircle(500, 480, 115, PO.f, CW.teal, () => { ctx.translate(-500, -480); cwDisc(500, 480, 78, { spin: 18, c: CW.teal, blades: 8 }); });
    ctx.restore();
    tagD('NORMAL', 540, 1260, ERA_T[10] + 0.8, { c: CW.cyan, size: 40, a: 1 - wv });
  }
  if (wv > 0) {
    ctx.save(); const sip = EZ.io(seg(TT, PO.sip, PO.sip + 1.1)) * (1 - EZ.io(seg(TT, PO.sip + 2.2, PO.sip + 3.2)));
    cwWindowView({ a: wv, sip, thin: 0 }); ctx.restore();
    bigD('−54°C', 400, 470, 96, CW.cyan, PO.win + 0.2, { a: wv });
  }
}

// ===== scene 12: subscribe =====
sceneCams[11] = () => null;
function sceneEnd() {
  cwBG({ glow: CW.cyan, glowA: 0.12, gy: 700, top: '#07182c', bot: '#050c18' });
  for (let i = 0; i < 40; i++) { const R = RNG('star', i); ctx.fillStyle = cwRGBA(CW.white, 0.15 + 0.5 * R.f()); ctx.beginPath(); ctx.arc(R.f() * W * 1.2 - 60, R.f() * 560 + 60, 1 + 2 * R.f(), 0, TAU); ctx.fill(); }
  cwClouds(1250, 0.5, 1); cwClouds(1380, 1.0, 1.3); cwStreaks(14, 0.9, 380, 1300, 700);
  const k = ev(ERA_T[11], 1.0), px = lerp(300, 540, EZ.o3(k)) + Math.sin(TT * 0.5) * 10;
  cwPlane(px, 640 + Math.sin(TT * 0.9) * 7, 0.85);
  cwText('WORLD IN THE', 540, 1000, 78, CW.white, { a: ev(VL('cta').t0, 0.3) }); cwText('MAKING', 540, 1090, 96, CW.amber, { a: ev(VL('cta').t0 + 0.4, 0.3) });
  const t0 = VW('cta', 'subscribe'), u = popS(t0 - 0.1);
  if (u > 0) { ctx.save(); ctx.translate(540, 1230); const press = 1 - 0.08 * flash(t0 + 0.5, 0.2); ctx.scale(u * press, u * press); ctx.fillStyle = '#ff1f2d'; ctx.beginPath(); ctx.roundRect(-250, -52, 500, 104, 52); ctx.fill(); ctx.fillStyle = CW.white; ctx.font = `900 56px ${CWF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SUBSCRIBE', 0, 4); ctx.restore();
    const rr = ev(t0 + 0.5, 0.8); if (rr > 0 && rr < 1) { ctx.save(); ctx.strokeStyle = cwRGBA('#ff1f2d', 1 - rr); ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(540 - 250 - 60 * rr, 1230 - 52 - 60 * rr, 500 + 120 * rr, 104 + 120 * rr, 52 + 60 * rr); ctx.stroke(); ctx.restore(); } }
}
