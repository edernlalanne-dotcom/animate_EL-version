// =====================================================================
//  WORLD — stations along +x, the hero's walk, the camera's focus, the floor and the shelves.
//  World units ~ px at zoom 1. ISO fixed; the camera (pieceCam) puts the focus on the screen.
// =====================================================================
const ISOB = { ox: 540, oy: 960, u: 1 };
const ST = { fork: 0, aisle: 630, capex: 1200, upg: 1800, proof: 2450, doubt: 3100, end: 3800 };
const STAND = (x) => x - 70;   // where the hero stands at a station
// the hero's walk: [t0, t1, target x] in sequence
const WALKS = [
  [Ts('c1') - 0.2, Te('c1') + 0.1, STAND(ST.aisle)],
  [Ts('c3') + 1.0, Ts('s1a') + 0.6, STAND(ST.capex)],
  [Ts('s1d') + 1.6, Ts('s2a') + 1.0, STAND(ST.upg)],
  [Ts('s2d') + 2.0, Ts('e1') + 1.0, STAND(ST.proof)],
  [Ts('e4') + 0.6, Ts('a1') + 0.8, STAND(ST.doubt)],
  [Ts('a4') + 1.9, Ts('q') + 0.4, STAND(ST.end)],
];
function heroXat(t) {
  let v = STAND(ST.fork), prev = v;
  for (const [a, b, to] of WALKS) { v += (to - prev) * smoothstep(t, a, b); prev = to; }
  return v;
}
function heroState() {
  const x = heroXat(TT), sp = (heroXat(TT + 0.05) - heroXat(TT - 0.05)) * 10;
  return { x, moving: clamp(Math.abs(sp) / 110), phase: x * 0.046 };
}
// camera zoom keys: [t, zoom]; eased over 1s from each key time
const ZKEYS = [[0, 1.0], [Ts('hook') + 2.4, 1.1], [Ts('c1'), 1.0], [Ts('s1b') - 0.3, 1.1], [Ts('s1c'), 1.0], [Ts('s2c') - 0.2, 1.1], [Ts('s2d'), 1.0],
  [Ts('e2') - 0.2, 1.16], [Ts('e3') - 0.2, 1.0], [Ts('a2') - 0.3, 1.14], [Ts('a3'), 1.0], [Ts('q') - 0.2, 0.84]];
const LEADKEYS = [[0, 150], [Ts('e1') - 1.6, 240], [Ts('a1') - 0.8, 150]];   // the camera looks this far ahead of the hero
const camLead = () => keyTrack(LEADKEYS, 1.2);

// a stand-alone helper: a drop-in from above on a spring
const dropIn = (t0, h = 220, o = {}) => (1 - spring(TT, t0, { k: o.k ?? 150, damp: o.damp ?? 0.6 })) * h;
const popS2 = (t0, o = {}) => clamp(spring(TT, t0, { k: o.k ?? 170, damp: o.damp ?? 0.6 }), 0, 1.25);
const fadeOut = (t0, d = 0.4) => 1 - smoothstep(TT, t0, t0 + d);

// ---- the floor, the back wall and the shelves
function drawFloor(cx) {
  isoBox(-700, -430, -34, 5800, 1500, 34, { col: PAL.floor, cap: 1.0, l: 0.8, rr: 0.5, edge: 'rgba(160,230,240,0.22)' });
  const gf = groundFace(0, 0, 0);
  for (let y = -400; y <= 1000; y += 100) faceLine(gf, [[cx - 1100, y], [cx + 1100, y]], PAL.grid, 1.4);
  for (let x = Math.floor((cx - 1100) / 100) * 100; x <= cx + 1100; x += 100) faceLine(gf, [[x, -430], [x, 1000]], PAL.grid, 1.4);
  for (let x = Math.floor((cx - 1100) / 100) * 100; x <= cx + 1100; x += 100) faceLine(gf, [[x + 20, 0], [x + 70, 0]], withA(PAL.amber, 0.45), 3);   // a guide lane
}
function drawBackWall(cx) {
  isoPanelY(-700, -450, 0, 5800, 330, 14, { col: '#0f2f55', l: 0.9, rr: 0.9, cap: 0.9 });
  const x0 = Math.floor((cx - 1000) / 190) * 190;
  for (let x = x0; x < cx + 1000; x += 190) shelfUnit(x, -430, 170, Math.round(x / 190) + 50);
  const gw = panelFaceY(-700, -450, 0, 5000, 330, 14);
  for (let x = Math.floor((cx - 1000) / 300) * 300; x < cx + 1000; x += 300) faceLine(gw, [[x, 20], [x, 310]], withA('#ffffff', 0.05), 2);
  // ceiling lights as a strip of lit panels high on the wall
  for (let x = Math.floor((cx - 1000) / 380) * 380; x < cx + 1000; x += 380) glow(PAL.teal, 20, () => faceRR(gw, x + 60, 14, 120, 8, 4, { fill: withA(PAL.teal, 0.75) }));
}
