// =====================================================================
//  MAIN — sceneAll draws the whole warehouse sheet once per frame, back to front; the camera frames it.
// =====================================================================
const near = (cx, X, r = 950) => Math.abs(cx - X) < r;
function sceneAll() {
  setIso(ISOB);
  const hs = heroState(), cx = hs.x + camLead();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d2a52'); g.addColorStop(0.55, '#0a2146'); g.addColorStop(1, '#05122a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  drawFloor(cx);
  drawBackWall(cx);
  // ---- back-of-hero scenery
  if (near(cx, ST.fork)) stationFork(ST.fork, 0);
  if (near(cx, ST.end)) stationFork(ST.end, 1);
  if (near(cx, ST.capex)) stationMoney(ST.capex, hs.x);
  if (near(cx, ST.proof)) stationProof(ST.proof, hs.x);
  if (near(cx, ST.doubt)) stationDoubt(ST.doubt, hs.x);
  if (near(cx, ST.upg)) stationUpgrade(ST.upg, hs.x);
  if (near(cx, ST.aisle)) stationAisle(ST.aisle, hs.x);
  // ---- the hero: one robot all the way; its pose follows the line being spoken
  const pose = {};
  const inRange = (a, b) => TT >= Ts(a) && TT < Te(b) + 0.2;
  if (TT < Te('hook')) pose.point = smoothstep(TT, Ts('hook') + 0.6, Ts('hook') + 1.2);
  if (inRange('c2', 'c2')) pose.wave = smoothstep(TT, Ts('c2') + 0.3, Ts('c2') + 0.8) * (1 - smoothstep(TT, Te('c2') - 0.4, Te('c2') + 0.1));
  if (inRange('s1a', 's1a')) pose.point = smoothstep(TT, Ts('s1a'), Ts('s1a') + 0.5) * (1 - smoothstep(TT, Te('s1a') - 0.3, Te('s1a') + 0.2));
  if (TT > Ts('e1') + 1.9 && TT < Te('e2') + 0.2) { pose.carry = mod(TT - Ts('e1') - 2.0, 1.3) < 0.65; }
  if (inRange('a4', 'a4')) pose.point = smoothstep(TT, Ts('a4') + 0.5, Ts('a4') + 0.9);
  if (TT >= Ts('q')) pose.wave = smoothstep(TT, Ts('q') + 0.2, Ts('q') + 0.8);
  robot(hs.x, 0, 0, 1.3, { phase: hs.phase, moving: hs.moving, ...pose });
  const heroSpark = SPARK_AT;
  questionMark(hs.x + 14, 0, 232, 100, smoothstep(TT, Wt('hook', 3), Wt('hook', 3) + 0.4) * (1 - smoothstep(TT, Te('hook'), Te('hook') + 0.5)));
  questionMark(hs.x + 14, 0, 232, 100, smoothstep(TT, Ts('q') + 0.1, Ts('q') + 0.6));
  SPARK_AT = heroSpark;
  // ---- captions, one per spoken line, from the cue sheet
  for (const [id, tag, text, col] of CAPS) caption(text, Ts(id) + 0.12, Te(id) + 0.3, { tag, color: col || PAL.amber });
}
// [line id, tag, caption, colour]
const CAPS = [
  ['hook', 'WHY RENT HUMANOID ROBOTS?', 'BUY VS. RENT?'],
  ['c1', 'HUMANOID ROBOT', 'BUILT FOR HUMAN SPACES', PAL.teal],
  ['c2', 'RAAS', 'ROBOTICS AS A SERVICE', PAL.teal],
  ['c3', 'RENT = SUBSCRIPTION', 'LEASE ROBOTIC LABOR', PAL.teal],
  ['s1a', 'CAPEX', 'HEAVY UPFRONT CASH', PAL.red],
  ['s1b', 'CAPEX', 'A DEPRECIATING ASSET', PAL.red],
  ['s1c', 'OPEX', 'A FLEXIBLE EXPENSE', PAL.teal],
  ['s1d', 'RAAS', 'NO LONG-TERM COMMITMENT', PAL.teal],
  ['s2a', 'REASON 2', 'DODGE OBSOLESCENCE', PAL.amber],
  ['s2b', 'NEW MODELS KEEP COMING', 'DIGIT 4 → DIGIT 5', PAL.amber],
  ['s2c', 'BUY IT AND', 'IT GETS OUTDATED', PAL.red],
  ['s2d', 'RENT IT AND', 'VENDORS SWAP MODELS', PAL.teal],
  ['e1', 'JUNE 2024', 'GXO + DIGIT, GEORGIA', PAL.amber],
  ['e2', 'FLOWERY BRANCH, GA', '100,000+ TOTES MOVED', PAL.amber],
  ['e3', 'OCTOBER 2026 · ANNOUNCED', 'NC + TN RENTALS', PAL.teal],
  ['e4', 'DEPLOYMENTS START', 'EARLY 2027', PAL.teal],
  ['a1', 'MISCONCEPTION', 'NOT PROVEN CHEAPER YET', PAL.red],
  ['a2', 'GXO CEO, 2026', '0 HUMANOIDS IN PRODUCTION', PAL.red],
  ['a3', 'UNPROVEN ROI', '= RENT FIRST', PAL.teal],
  ['a4', 'RENT TO TEST', 'RISK SHIFTS TO VENDORS', PAL.teal],
  ['q', 'YOU DECIDE', 'WOULD YOU RENT OR BUY?', PAL.amber],
];
