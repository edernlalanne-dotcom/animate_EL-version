// ===== scene 1: hook, opens inside the cabin on the question =====
sceneCams[0] = () => cam(lg(1.22, 1.0, EZ.o3(seg(TT, 0, 3.0))), 470, 820, 470, 820);
function sceneHook() {
  cwWindowView({ a: 1, thin: VW('open', 'thin'), sip: 0 });
  const tm = VW('open', 'minus'), tt = VW('open', 'T-shirt');
  bigD('−54°C', 400, 470, 110, CW.cyan, tm);
  tagD('THIN AIR', 400, 1090, VW('open', 'thin') + 0.1, { c: CW.cyan, size: 34 });
  bigD('?', 700, 520, 190, CW.amber, tt + 0.1);
  tagD('T-SHIRT', 700, 1200, tt, { c: CW.amber, size: 34 });
}

// ===== scene 2: one breath, a quarter of the oxygen =====
sceneCams[1] = () => cam(1 + 0.06 * EZ.io(seg(TT, ERA_T[1], ERA_T[2])), 540, 800);
function cwBubble(cx, cy, r, n, seed, c) {
  ctx.save(); ctx.fillStyle = cwRGBA(CW.panel, 0.55); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.strokeStyle = cwRGBA(CW.white, 0.7); ctx.lineWidth = 5; ctx.stroke();
  for (let i = 0; i < n; i++) { const R = RNG('bb', seed, i), ang = R.f() * TAU, rr = Math.sqrt(R.f()) * (r - 30), ph = R.f() * TAU; cwDot(cx + Math.cos(ang + Math.sin(TT * 0.9 + ph) * 0.35) * rr, cy + Math.sin(ang + Math.cos(TT * 0.8 + ph) * 0.35) * rr, 6.2, c, 0.95); }
  ctx.restore();
}
function sceneBreath() {
  cwBG({ glow: CW.cyan, glowA: 0.1, gy: 780 });
  const k = EZ.o3(ev(ERA_T[1] + 0.15, 0.5));
  ctx.save(); ctx.globalAlpha *= k;
  cwBubble(290, 800, 215, 48, 1, CW.cyan); cwBubble(790, 800, 215, 12, 2, CW.cyan);
  cwText('SEA LEVEL', 290, 1110, 38, CW.white); cwText('35,000 FT', 790, 1110, 38, CW.white);
  ctx.restore();
  tagD('ONE BREATH', 540, 330, ERA_T[1] + 0.2, { c: CW.white, size: 42 });
  bigD('¼', 790, 520, 140, CW.amber, VW('breath', 'quarter') - 0.1);
  tagD('ONE QUARTER', 760, 1190, VW('breath', 'quarter') + 0.15, { c: CW.amber, size: 30 });
}

// ===== scene 3: the sealed tube and the fake mountain town =====
const SL = { s: VW('seal', 'seals'), m: VW('seal', 'mountain'), cap: VS('seal', 1) };
sceneCams[2] = () => cam(1 + 0.05 * EZ.io(seg(TT, ERA_T[2], ERA_T[3])), 540, 800);
function sceneSeal() {
  cwBG({ glow: CW.cyan, glowA: 0.1, gy: 760 });
  const cx = 540, cy = 790, R = 330, pulse = flash(SL.s, 0.9);
  ctx.save(); ctx.globalAlpha *= EZ.o3(ev(ERA_T[2] + 0.1, 0.4));
  ctx.strokeStyle = cwRGBA(CW.cyan, 0.2 + 0.7 * pulse); ctx.lineWidth = 16 + 30 * pulse; ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, TAU); ctx.stroke();
  cwCabin(cx, cy, R, {});
  for (let i = 0; i < 46; i++) { const Rr = RNG('in', i), ang = Rr.f() * TAU, rr = Math.sqrt(Rr.f()) * (R - 36), ph = Rr.f() * TAU; cwDot(cx + Math.cos(ang + Math.sin(TT * 0.8 + ph) * 0.25) * rr, cy + Math.sin(ang + Math.cos(TT * 0.7 + ph) * 0.25) * rr * 0.96, 4.4, CW.cyan, 0.85); }
  ctx.restore();
  // a small mountain with a town: the cabin feels like this
  const mu = EZ.o3(ev(SL.m - 0.2, 0.5));
  if (mu > 0) {
    ctx.save(); ctx.globalAlpha *= mu; ctx.translate(540, 1290);
    ctx.fillStyle = '#35566f'; ctx.strokeStyle = cwRGBA(CW.white, 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-190, 0); ctx.lineTo(-40, -110); ctx.lineTo(10, -150); ctx.lineTo(60, -110); ctx.lineTo(190, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f4f8fb'; ctx.beginPath(); ctx.moveTo(-14, -128); ctx.lineTo(10, -150); ctx.lineTo(36, -126); ctx.lineTo(10, -118); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) { const x = -78 + i * 20, y = -52 + Math.abs(i - 2) * -2; ctx.fillStyle = '#d8e4ee'; ctx.fillRect(x - 6, y - 14, 12, 14); ctx.fillStyle = CW.red; ctx.beginPath(); ctx.moveTo(x - 8, y - 14); ctx.lineTo(x, y - 22); ctx.lineTo(x + 8, y - 14); ctx.fill(); }
    ctx.restore();
  }
  tagD('SEALED TUBE', 540, 330, SL.s, { c: CW.white, size: 42 });
  tagD('6,000 TO 8,000 FT', 540, 1345, SL.m + 0.3, { c: CW.cyan, size: 30 });
  tagD('MAX 8,000 FT', 540, 400, SL.cap + 0.3, { c: CW.red, size: 40 });
}
