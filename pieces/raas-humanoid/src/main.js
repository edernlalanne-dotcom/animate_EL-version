// =====================================================================
//  MAIN — sceneAll draws the whole warehouse sheet once per frame, back to front; the camera frames it.
//  The last 2.9s: the subscribe card (the user's logo) over black.
// =====================================================================
const near = (cx, X, r = 950) => Math.abs(cx - X) < r;
const CARD_T = () => Te('q') + 0.35;
function sceneAll() {
  setIso(ISOB);
  const hs = heroState(), cx = hs.x + camLead();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d2a52'); g.addColorStop(0.55, '#0a2146'); g.addColorStop(1, '#05122a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  drawFloor(cx);
  drawBackWall(cx);
  if (near(cx, ST.fork)) { stationFork(ST.fork, 0, Ts('l1') + 0.1); stationHook(ST.fork); }
  if (near(cx, ST.end)) stationFork(ST.end, 1, 0);
  if (near(cx, ST.capex)) stationMoney(ST.capex, hs.x);
  if (near(cx, ST.proof)) stationProof(ST.proof, hs.x);
  if (near(cx, ST.doubt)) stationDoubt(ST.doubt, hs.x);
  if (near(cx, ST.upg)) stationUpgrade(ST.upg, hs.x);
  // ---- the hero: one robot all the way; its pose follows the line being spoken
  const pose = {};
  const inRange = (a, b) => TT >= Ts(a) && TT < Te(b) + 0.2;
  if (TT < Te('h2')) pose.point = smoothstep(TT, Ts('h1') + 0.3, Ts('h1') + 0.8);
  if (inRange('l2', 'l2')) pose.wave = smoothstep(TT, Ts('l2') + 0.3, Ts('l2') + 0.7) * (1 - smoothstep(TT, Te('l2') - 0.3, Te('l2') + 0.1));
  if (inRange('s1a', 's1a')) pose.point = smoothstep(TT, Ts('s1a'), Ts('s1a') + 0.5) * (1 - smoothstep(TT, Te('s1a') - 0.3, Te('s1a') + 0.2));
  if (TT > Ts('e1') + 1.9 && TT < Te('e2') + 0.2) pose.carry = mod(TT - Ts('e1') - 2.0, 1.3) < 0.65;
  if (inRange('a4', 'a4')) pose.point = smoothstep(TT, Ts('a4') + 0.1, Ts('a4') + 0.5);
  if (TT >= Ts('q')) pose.wave = smoothstep(TT, Ts('q') + 0.2, Ts('q') + 0.8);
  robot(hs.x, 0, 0, 1.4, { phase: hs.phase, moving: hs.moving, ...pose });
  const heroSpark = SPARK_AT;
  questionMark(hs.x + 14, 0, 215, 100, smoothstep(TT, Ts('l1') + 0.7, Ts('l1') + 1.1) * (1 - smoothstep(TT, Te('l2') - 0.1, Te('l2') + 0.4)));
  questionMark(hs.x + 14, 0, 215, 100, smoothstep(TT, Ts('q') + 0.1, Ts('q') + 0.6) * (1 - smoothstep(TT, CARD_T(), CARD_T() + 0.3)));
  SPARK_AT = heroSpark;
  for (const [id, tag, text, col] of CAPS) caption(text, Ts(id) + 0.12, Te(id) + 0.3, { tag, color: col || PAL.amber });
  // ---- the subscribe card: the channel logo, on black, for the last ~2.5 seconds
  const f = () => {
    const t0 = CARD_T(), a = smoothstep(TT, t0, t0 + 0.35); if (a <= 0.001) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const s = 0.88 + 0.12 * Math.min(1.05, spring(TT, t0 + 0.05, { k: 110, damp: 0.55 })), sz = 840 * s;
    ctx.globalCompositeOperation = 'lighten';   // the logo's black ground never darkens the fade
    drawAsset('subscribe.jpg', CX - sz / 2, 840 - sz / 2, sz, sz, { fit: 'contain' });
    ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}
// [line id, tag, caption, colour]: captions add a fact the voice does not say
const CAPS = [
  ['h1', 'GXO, 2026', '45 HUMANOID PILOTS', PAL.amber],
  ['h2', 'GXO CEO', '0 IN PRODUCTION THIS YEAR', PAL.red],
  ['l1', 'THE QUESTION', 'SO WHY STILL RENT?', PAL.amber],
  ['l2', '2 REASONS', 'THE 2ND ONE SURPRISES', PAL.amber],
  ['s1a', 'REASON 1', 'CASH LOCKED UP', PAL.red],
  ['s1b', 'REASON 1', 'THE ROBOT LOSES VALUE', PAL.red],
  ['s1c', 'RENT', 'PAY MONTHLY', PAL.teal],
  ['s1d', 'RENT', 'NO LONG COMMITMENT', PAL.teal],
  ['s2a', 'REASON 2', 'THE NEXT MODEL SHIPS', PAL.amber],
  ['s2b', 'SEPTEMBER 2026', 'DIGIT 5 UNVEILED', PAL.amber],
  ['s2c', 'OWN DIGIT 4', 'YOU OWN THE OLD ONE', PAL.red],
  ['s2d', 'GXO NEW SITES', 'DIGIT 4 → DIGIT 5', PAL.teal],
  ['e1', 'JUNE 2024', 'RENTED IN GEORGIA', PAL.amber],
  ['e2', 'FLOWERY BRANCH, GA', '100,000+ TOTES', PAL.amber],
  ['e3', 'ANNOUNCED OCT 2026', 'NC + TN NEXT', PAL.teal],
  ['e4', 'DEPLOYMENTS START', 'EARLY 2027', PAL.teal],
  ['a1', 'BUT', 'NO RETURN YET', PAL.red],
  ['a2', 'GXO CEO', 'PRODUCTION ~2 YEARS OUT', PAL.red],
  ['a3', 'SO', 'RENTING IS NOT A BET', PAL.teal],
  ['a4', 'IT IS', 'A TEST', PAL.teal],
  ['q', 'YOU DECIDE', 'RENT OR BUY?', PAL.amber],
];
