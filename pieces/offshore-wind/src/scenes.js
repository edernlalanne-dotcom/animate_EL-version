// =====================================================================
//  SCENES — How offshore wind turbines are assembled at sea. Side-view 2.5D, world = 1920x1080 screen units.
//  Each scene reads local time t = TT - E0 (seconds since its cut). Hard cuts between scenes (BRIDGES = []).
//  Shared world: waterline per scene, jack-up vessel w=700 with the crane on the stern (right), foundation to its right.
// =====================================================================
const FACT = { tip: 'OVER 200 m TALL', blade: '100 m+' };   // rotors reach 236 m on the Vestas V236 (vestas.com); tip height then exceeds 200 m   // checked against sources before the build (see brief.md)
const tr = (t, a, b) => ofEase(seg(t, a, b));
const TOWER_H = 187, VW = 700, CRANE_DX = 190, CRANE_H = 190, BOOM = 620;
const FOUND_X = 1560;

// the foundation: monopile from y0 to y1, transition piece with its bottom at yb. Returns the tower seat y (top of the transition piece).
function foundation(x, wl, o = {}) {
  const pt = wl - 40, seat = wl - 40 + 70 - 120;   // pile top, seat = transition top
  ofMonopile(x, pt, o.y1 ?? wl + 520, 38);
  ofTransition(x, wl - 40 + 70, 38);
  return seat;
}
// a one-time ring pulse and a bolt ring
function bolts(x, y, w, t0, n = 7) {
  const a = ev(t0, 0.5); if (a <= 0) return;
  for (let i = 0; i < n; i++) { const bx = x - w / 2 + 4 + (w - 8) * i / (n - 1); ctx.fillStyle = a < 1 ? `rgba(47,227,255,${0.4 + 0.6 * (1 - a)})` : '#30373f'; ctx.beginPath(); ctx.arc(bx, y, 3.2, 0, TAU); ctx.fill(); }
  if (a < 1) { ctx.strokeStyle = `rgba(47,227,255,${1 - a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, w * (0.5 + a), 8 + 14 * a, 0, 0, TAU); ctx.stroke(); }
}
// the guide badge: Atlas in a ring with a short line, screen space (call through DEFER)
function badge(str, t0, t1, x = W - 230, y = 190) {
  const f = () => {
    const a = clamp(Math.min(ev(E0 + t0, 0.35), 1 - ev(E0 + t1 - 0.3, 0.3))); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; const s = 0.85 + 0.15 * a;
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(6,18,36,0.9)'; ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.fill(); ctx.strokeStyle = OF.cyan; ctx.lineWidth = 4; ctx.stroke();
    ofAtlas(0, 6, 60, { look: -1 });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = a; ctx.font = `700 32px ${OFONT}`; const w = ctx.measureText(str).width + 44;
    ctx.fillStyle = 'rgba(6,18,36,0.9)'; ctx.beginPath(); ctx.roundRect(x - 110 - w, y - 36, w, 72, 16); ctx.fill(); ctx.strokeStyle = OF.cyan; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = OF.white; ctx.textBaseline = 'middle'; ctx.fillText(str, x - 110 - w + 22, y + 2); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}
const screenChip = (str, x, y, o = {}) => { const f = () => ofChip(str, x, y, o); if (DEFER) DEFER.push(f); else f(); };

// ---------------------------------------------------------------------
//  1. the impossible construction site
// ---------------------------------------------------------------------
function sceneOpen() {
  const t = TT - E0, len = SC.open[1] - SC.open[0], u = ofEase(t / (len - 0.6)), HY = 720;
  ofBounds(-400, W + 400);
  ofSky(-800, HY, { sunX: W * 0.2 });
  ofSeaBack(HY, H + 300);
  // the far shore (left): dark headland that the pull-back reveals
  const sa = 0.25 + 0.75 * u;
  ctx.fillStyle = `rgba(14,30,52,${sa})`; ctx.beginPath(); ctx.moveTo(-60, HY + 2); ctx.lineTo(-60, HY - 40);
  for (let x = -60; x <= 420; x += 20) ctx.lineTo(x, HY - 34 - 30 * Math.sin(x * 0.012 + 1) - 20 * Math.sin(x * 0.035) * (1 - x / 520));
  ctx.lineTo(430, HY + 2); ctx.closePath(); ctx.fill();
  const s = lerp(1.15, 0.36, u), x = lerp(1190, 1130, u), by = HY - 80 * s + 6;
  ctx.save(); ctx.translate(x, HY + 40 * s); ctx.scale(s, s); ofTransition(0, 0, 38); ctx.restore();
  const T = ofTurbine(x, by, s, { rot: TT * 0.45 });
  ofSeaFront(HY, { amp: 9, layers: 2 });
  // service boat for scale
  const ba = ev(E0 + 2.6, 0.8); if (ba > 0) { ctx.save(); ctx.globalAlpha = ba; ofShip(x + 150 + 190 * s, HY + 36 + Math.sin(TT * 1.4) * 3, 0.9); ctx.restore(); }
  // distance and height markers
  ofDim(440, HY - 14, x - 70 * s, HY - 14, 'FAR FROM SHORE', { p: tr(t, 3.3, 4.8), dy: -34, size: 28 });
  ofDim(x + 230 * s + 40, by + 10 * s, x + 230 * s + 40, T.top - 250 * s - 30 * s, FACT.tip, { p: tr(t, 2.2, 3.6), dx: 78, size: 28 });
  ofTag('01', 'The impossible site');
  ofCaption('HOW DO YOU BUILD THIS AT SEA?', { at: len - 3.2 });
  badge('Good question.', len - 3.4, len - 0.2);
}

// ---------------------------------------------------------------------
//  2. building the underwater foundation (a cutaway: sky, sea, seabed in one frame)
// ---------------------------------------------------------------------
const F2 = { wl: 380, sb: 900, px: 960, plen: 640, hit0: 4.9, hitN: 7, hitDt: 0.6 };
function f2pile(t) {
  // bottom y of the pile: lowered (1.8-4.8), then driven in with a hammer blow every 0.6s (4.9-10.3)
  let pb = lerp(230, F2.sb - 2, tr(t, 1.8, 4.8)), pen = 0;
  if (t >= F2.hit0) { const k = Math.min(F2.hitN, Math.floor((t - F2.hit0) / F2.hitDt) + 1); for (let i = 0; i < k; i++) { const th = F2.hit0 + i * F2.hitDt; pen += 9 * (1 - Math.exp(-(t - th) * 14)); } }
  return { pb: pb + pen, pen };
}
function sceneFound() {
  const t = TT - E0, { wl, sb, px } = F2, P = f2pile(t);
  ofBounds(-400, W + 400);
  ofSky(-900, wl, { sunX: W * 0.82 });
  ofSeabed(sb, -400, W + 400, 400);
  ofSeaBack(wl, sb + 2, { glitter: true });
  // the installation vessel behind the action: legs on the seabed, hull above the waves
  const vx = 520, deckY = 250, J = ofJackup(vx, deckY, { w: VW, leg: sb - (deckY + 70), legTop: deckY - 300 });
  const crx = vx + CRANE_DX, A = Math.acos(clamp((px - crx) / BOOM, -1, 1)) / DEG;
  const ca = lerp(Math.min(A + 18, 80), A, tr(t, 0.4, 1.8));
  const C = ofCrane(crx, deckY, ca, BOOM, { dir: 1, h: CRANE_H });
  const topY = P.pb - F2.plen;
  // the pile hangs from the hook until it stands on the seabed, then the hammer drives it
  const hooked = t < F2.hit0 - 0.1;
  const hookY = hooked ? topY - 30 : lerp(topY - 30, topY - 330, tr(t, F2.hit0 - 0.1, F2.hit0 + 1.4));
  const hx = hooked || t < F2.hit0 + 1.4 ? lerp(C.tip[0], px, 1) : px;
  ofMonopile(px, topY, P.pb, 38);
  if (t < F2.hit0 + 1.6) ofHook(px, C.tip[1], hookY);
  // the hammer on the pile top, with a hit every 0.6s
  const hs = tr(t, F2.hit0 - 0.3, F2.hit0 + 0.2);
  if (hs > 0 && t < 9.6) {
    const ph = mod(t - F2.hit0, F2.hitDt) / F2.hitDt, lift = t < F2.hit0 ? 90 * (1 - hs) : 34 * Math.sin(Math.min(ph, 1) * Math.PI) ** 0.6 * (1 - ph * 0.0);
    const hy = topY - 100 - lift * (ph < 0.5 ? 1 : 0.2);
    ofRect(px - 44, hy, 88, 74, '#ffd24d', '#c78d08', { line: 'rgba(0,0,0,0.4)' }); ofRect(px - 20, hy - 30, 40, 30, '#8a97a4', '#46515d');
  }
  // shockwaves in the soil on every hit
  for (let i = 0; i < F2.hitN; i++) { const th = F2.hit0 + i * F2.hitDt, a = (t - th) / 0.55; if (a > 0 && a < 1) { ctx.strokeStyle = `rgba(47,227,255,${0.8 * (1 - a)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, P.pb + 4, 30 + 120 * a, 8 + 26 * a, 0, 0, Math.PI); ctx.stroke(); } }
  // sea surface laps the vessel, pile and pile top; waves over everything above the seabed
  ofSeaFront(wl, { amp: 12, layers: 2, bottom: sb });
  // cross-section annotation (10.3 - 12.4): the buried length of the pile and the soil it grips
  const ann = tr(t, 8.4, 9.0) * (1 - tr(t, 9.9, 10.5));
  if (ann > 0) {
    ctx.save(); ctx.globalAlpha = ann; ctx.fillStyle = 'rgba(47,227,255,0.12)'; ctx.fillRect(px - 150, sb, 300, 140); ctx.setLineDash([10, 8]); ctx.strokeStyle = OF.cyan; ctx.lineWidth = 2.5; ctx.strokeRect(px - 150, sb, 300, 140); ctx.setLineDash([]);
    ofDim(px + 190, sb, px + 190, P.pb + 4, 'DRIVEN DEEP', { p: tr(t, 8.5, 9.4), dx: 100, size: 28 });
    ofChip('SEABED', px - 250, sb + 70, { size: 26 }); ctx.restore();
  }
  if (t > 2 && t < 8.4) { ofChip('MONOPILE', px - 230, 700, { size: 28, a: tr(t, 2.2, 2.8) * (1 - tr(t, 7.8, 8.4)) }); }
  // transition piece and the first tower section (12.6 - 15), seen close up
  const seat = wl - 40 + 70 - 120, tpy = lerp(wl - 40 - 380, wl - 40 + 70, tr(t, 10.0, 11.2));
  if (t > 9.9) { ofTransition(px, tpy, 38); if (t < 11.5) ofHook(px, C.tip[1], tpy - 120 - 20); }
  if (t > 11.6) {
    const ty = lerp(seat - 330, seat, tr(t, 11.6, 12.6)); ofTowerSection(px, ty, TOWER_H, 36, 33);
    if (t > 12.5) bolts(px, seat, 38, E0 + 12.5);
  }
  ofTag('02', 'The foundation');
  ofCaption(t < 8.4 ? 'THE MONOPILE: A STEEL TUBE' : 'TRANSITION PIECE AND TOWER BASE', { at: t < 8.4 ? 0.8 : 9.2 });
}
function camFound(t) {
  if (t < 2.0) return { z: 1, tx: 0, ty: 330 * (1 - ofEase(t / 1.8)) };
  const u = tr(t, 9.4, 10.4); if (u > 0) return camMix(CAM0, camOf({ z: 1.9, p: [F2.px, 330], to: [F2.px, 620] }), u);
  return null;
}

// ---------------------------------------------------------------------
//  3. the ship that stands on the seabed
// ---------------------------------------------------------------------
const F3 = { wl: 520, sb: 960, x1: 1000 };
function j3(t) {   // deck y, x, leg reach
  const base = F3.wl - 40, bob = (1 - tr(t, 5.0, 8.0)) * (Math.sin(TT * 1.3) * 9 + Math.sin(TT * 2.9) * 3);
  const x = lerp(-500, F3.x1, ofEase(seg(t, 0.0, 5.0)) ** 0.9);
  const rise = 190 * tr(t, 8.2, 12.0), deckY = base + bob - rise;
  const bot = deckY + 70, touch = F3.sb - (base + 70);
  const leg = t < 5.2 ? 0 : (t < 8.2 ? touch * tr(t, 5.2, 8.0) : F3.sb - bot);
  return { x, deckY, bot, leg };
}
function sceneJack() {
  const t = TT - E0, { wl, sb } = F3, J = j3(t);
  ofBounds(-400, W + 400);
  ofSky(-900, wl, { sunX: W * 0.82 });
  ofSeabed(sb, -400, W + 400, 300);
  ofSeaBack(wl, sb + 2);
  foundation(FOUND_X, wl, { y1: sb + 90 });
  const V = ofJackup(J.x, J.deckY, { w: VW, leg: J.leg, legTop: J.deckY - 300 });
  // crane stowed along the deck until the lift (boom up and out)
  const crx = J.x + CRANE_DX; ofCrane(crx, J.deckY, lerp(72, 56, tr(t, 11.5, 14.0)), BOOM, { dir: 1, h: CRANE_H });
  ofSeaFront(wl, { amp: 24, layers: 3, bottom: sb });
  // the contrast: sea level line, air gap, stable platform
  const gap = tr(t, 9.0, 11.0);
  if (gap > 0) {
    ctx.save(); ctx.globalAlpha = gap; ctx.setLineDash([14, 10]); ctx.strokeStyle = OF.cyan; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(J.x - 520, wl); ctx.lineTo(J.x + 520, wl); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ofDim(J.x - 400, wl, J.x - 400, J.bot, 'ABOVE THE WAVES', { p: tr(t, 10.0, 11.4), dx: -150, size: 28 });
  }
  if (t > 12.2) { const a = tr(t, 12.2, 13.0); ctx.save(); ctx.globalAlpha = a; ofChip('STABLE LIFTING PLATFORM', J.x + 30, J.deckY - 230, { size: 30 }); ctx.restore(); }
  if (t > 5.4 && t < 8.6) ofChip('LEGS DOWN', J.x - 270, sb - 110, { size: 28, a: tr(t, 5.4, 6.0) * (1 - tr(t, 8.0, 8.6)) });
  ofTag('03', 'The jack-up vessel');
  ofCaption(t < 8.0 ? 'A SHIP THAT PARKS ON LEGS' : 'IT LIFTS ITSELF OUT OF THE SEA', { at: t < 8.0 ? 2.0 : 8.4 });
  badge('Watch the hull rise.', 8.3, 12.2);
}
function camJack(t) {
  const u = tr(t, 5.2, 7.0) * (1 - tr(t, 8.0, 9.4));
  return u > 0 ? camMix(CAM0, camOf({ z: 1.35, p: [F3.x1 - 100, 790], to: [900, 700] }), u) : null;
}

// ---------------------------------------------------------------------
//  4. the giant assembly operation (tower sections, then the nacelle)
// ---------------------------------------------------------------------
const F4 = { wl: 760, sb: 1160, x: 1000, deck: 510 };
const SX = [1250, 1295, 1340];                                     // the tower sections stand on deck, right of the crane
const SEAT = (k) => F4.wl - 40 + 70 - 120 - TOWER_H * k;           // bottom y where section k sits
const secTravel = [129, 80, -50];                                  // hook y while travelling
// keys: [time, hookX, hookY] — one hook track for the whole operation. Section k is attached between its pick and its release.
function hookKeys() {
  const dTop = F4.deck - TOWER_H - 14, K = [[0, 1250, 60], [1.5, 1250, dTop]];
  const sec = (k, tp, tl, ts, tw, tr_, tl2, tu) => {   // pick(tp), lift to tl, swing to ts, lower to tw, release tr_, rise to tl2, return to tu
    K.push([tp, SX[k], dTop], [tl, SX[k], secTravel[k]], [ts, FOUND_X, secTravel[k]], [tw, FOUND_X, SEAT(k) - TOWER_H - 14], [tr_, FOUND_X, SEAT(k) - TOWER_H - 14]);
  };
  K.push([2.2, 1250, 129]); K.length = 2; K.push([2.2, 1250, dTop], [3.6, 1250, 129], [4.8, FOUND_X, 129], [5.8, FOUND_X, SEAT(0) - TOWER_H - 14], [6.1, FOUND_X, SEAT(0) - TOWER_H - 14], [6.9, FOUND_X, 100]);
  K.push([7.4, SX[1], dTop], [8.2, SX[1], 80], [9.2, FOUND_X, 80], [10.0, FOUND_X, SEAT(1) - TOWER_H - 14], [10.3, FOUND_X, SEAT(1) - TOWER_H - 14], [11.0, FOUND_X, 60]);
  K.push([11.4, SX[2], dTop], [12.2, SX[2], -50], [13.2, FOUND_X, -50], [14.0, FOUND_X, SEAT(2) - TOWER_H - 14], [14.3, FOUND_X, SEAT(2) - TOWER_H - 14], [14.9, 1295, -20]);
  // nacelle: stands on deck at x 1295 (sling above it), lifted, swung and lowered onto the tower top (y 110)
  K.push([15.3, 1295, F4.deck - 62 - 70], [16.3, 1295, -170], [17.4, FOUND_X, -170], [18.4, FOUND_X, 110 - 62 - 70], [19.0, FOUND_X, 110 - 62 - 70]);
  return K;
}
const HK = hookKeys();
function hookAt(t) {
  if (t <= HK[0][0]) return [HK[0][1], HK[0][2]];
  for (let i = 1; i < HK.length; i++) if (t <= HK[i][0]) { const a = HK[i - 1], b = HK[i], u = ofEase((t - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
  const l = HK[HK.length - 1]; return [l[1], l[2]];
}
const SEC_WIN = [[2.2, 6.1], [7.4, 10.3], [11.4, 14.3]];      // [pick, release]
const K4 = 0.8;   // scene 4's timeline is written in 'internal' seconds; it plays at 0.8x length
function sceneLift() {
  const t = (TT - E0) / K4, { wl, sb } = F4;
  ofBounds(-400, W + 400);
  ofSky(-1400, wl, { sunX: W * 0.82 });
  ofSeabed(sb, -400, W + 400, 300);
  ofSeaBack(wl, sb + 2);
  foundation(FOUND_X, wl, { y1: sb + 90 });
  const V = ofJackup(F4.x, F4.deck, { w: VW, leg: sb - (F4.deck + 70), legTop: F4.deck - 300 });
  const hk = hookAt(t), crx = F4.x + CRANE_DX;
  const ca = Math.acos(clamp((hk[0] - crx) / BOOM, -1, 1)) / DEG;
  // sections: on deck, in the air (attached), or seated on the tower
  const seated = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const [tp, trl] = SEC_WIN[k];
    if (t < tp) { ofTowerSection(SX[k], F4.deck, TOWER_H, lerp(36, 33, 0.5), lerp(36, 33, 0.5)); continue; }
    if (t < trl) { ofTowerSection(hk[0], hk[1] + 14 + TOWER_H, TOWER_H, 36, 33); continue; }
    seated[k] = 1; ofTowerSection(FOUND_X, SEAT(k), TOWER_H, lerp(36, 22, k / 3), lerp(36, 22, (k + 1) / 3));
    bolts(FOUND_X, SEAT(k), lerp(36, 22, k / 3), E0 + trl * K4);
  }
  // the nacelle
  const nT = [15.3, 18.6];
  const nacX = t < nT[0] ? 1295 : (t < nT[1] ? hk[0] : FOUND_X), nacY = t < nT[0] ? F4.deck : (t < nT[1] ? hk[1] + 70 + 62 : 110);
  if (t < 19.5) {
    const N = ofNacelle(nacX, nacY, 1);
    if (t >= nT[1]) { ofHub(N.hubX, N.hubY, 17); ofHub(N.hubX, N.hubY, 12); bolts(FOUND_X, 110, 22, E0 + nT[1] * K4); }
  }
  ofCrane(crx, F4.deck, ca, BOOM, { dir: 1, h: CRANE_H });
  const tip = ofCraneTip(crx, F4.deck, ca, BOOM, { dir: 1, h: CRANE_H });
  const holding = (t > 2.2 && t < 6.9) || (t > 7.4 && t < 11.0) || (t > 11.4 && t < 14.9) || (t > 15.3 && t < 19.0);
  // rigging: slings from the hook to the load
  ofHook(hk[0], tip[1], hk[1]);
  const lift = SEC_WIN.some(([a, b]) => t > a && t < b);
  if (lift) { const ax = hk[0], ay = hk[1] + 14; ofSling(ax, hk[1] + 4, ax - 18, ay + 22, ax + 18, ay + 22); }
  if (t > nT[0] && t < nT[1]) { ofSling(hk[0], hk[1] + 4, nacX - 66, nacY - 62 - 2, nacX + 38, nacY - 62 - 2); }
  ofSeaFront(wl, { amp: 5, layers: 2, bottom: sb });
  // counters
  const n = seated.reduce((a, b) => a + b, 0);
  if (t > 6.1) screenChip(t < 18.6 ? `TOWER  ${n} / 3` : 'NACELLE  ON', 1720, 100, { size: 30 });
  ofTag('04', 'The assembly');
  const cap = t < 2 ? 'THE CRANE STARTS WITH THE TOWER' : (t < 14.9 ? 'EACH FLANGE IS ALIGNED AND BOLTED' : 'THEN THE NACELLE GOES UP');
  ofCaption(cap, { at: (t < 2 ? 0.4 : (t < 14.9 ? 2.4 : 15.4)) * K4 });
}
function camLift(t) {
  t = t / K4;
  let u = tr(t, 1.5, 2.6) * (1 - tr(t, 3.2, 4.2));
  if (u > 0) return camMix(CAM0, camOf({ z: 2.4, p: [1250, 330], to: [960, 600] }), u);
  u = tr(t, 4.4, 5.2) * (1 - tr(t, 6.3, 7.1));
  if (u > 0) return camMix(CAM0, camOf({ z: 2.3, p: [FOUND_X, 620], to: [960, 600] }), u);
  u = tr(t, 17.0, 17.8) * (1 - tr(t, 18.9, 19.0));
  if (u > 0) return camMix(CAM0, camOf({ z: 2.2, p: [FOUND_X - 40, 110], to: [960, 560] }), u);
  return null;
}

// ---------------------------------------------------------------------
//  5. the most delicate lift: one blade, one gust, one weather window
// ---------------------------------------------------------------------
const F5 = { wl: 760, sb: 1160, x: 1000, deck: 510, hub: [FOUND_X - 99, 79], L: 250 };
function windAt(t) { return 0.34 + 0.05 * Math.sin(t * 2.1) + 0.62 * Math.exp(-(((t - 8.4) / 0.7) ** 2)) + 0.18 * Math.exp(-(((t - 10.0) / 0.6) ** 2)); }
function bladeRoot(t) {   // root position of the hoisted blade
  const rx0 = 1330, ry0 = F5.deck - 30;
  const hx = F5.hub[0], hy = F5.hub[1];
  const lift = tr(t, 3.0, 6.4), slide = tr(t, 11.0, 13.4);
  return [lerp(rx0, hx - 70, lift) + 70 * slide, lerp(ry0, hy, lift)];
}
function sceneBlade() {
  const t = TT - E0, { wl, sb } = F5, hub = F5.hub, L = F5.L;
  ofBounds(-400, W + 400);
  ofSky(-1400, wl, { sunX: W * 0.82 });
  ofSeabed(sb, -400, W + 400, 300);
  ofSeaBack(wl, sb + 2);
  foundation(FOUND_X, wl, { y1: sb + 90 });
  ofJackup(F5.x, F5.deck, { w: VW, leg: sb - (F5.deck + 70), legTop: F5.deck - 300 });
  const gust = windAt(t), sway = Math.sin(t * 3.1) * 0.065 * Math.max(0, gust - 0.36) * 2.2 * (1 - tr(t, 10.8, 12.2));
  const root = bladeRoot(t), ang = Math.PI + sway;
  // turbine with tower and nacelle; rotor blades 2 and 3 arrive after the first is bolted
  const rotStep = tr(t, 13.6, 14.4), done = t > 13.6;
  ofTurbine(FOUND_X, 110 + TOWER_H * 3 - 0.0, 1, { sections: 0, blades: 0 });   // (tower drawn below, to keep one code path)
  for (let k = 0; k < 3; k++) ofTowerSection(FOUND_X, SEAT(k), TOWER_H, lerp(36, 22, k / 3), lerp(36, 22, (k + 1) / 3));
  const N = ofNacelle(FOUND_X, 110, 1); ofHub(N.hubX, N.hubY, 17);
  const hubX = N.hubX, hubY = N.hubY;
  if (done) {   // blade 1 stays at its mounted angle; blades 2 and 3 grow in as the rotor turns
    const rot = Math.PI + rotStep * TAU / 3 + (t > 15.8 ? (t - 15.8) * 0.5 : 0);
    ofBlade(hubX, hubY, L, rot);
    const a2 = tr(t, 14.8, 15.3), a3 = tr(t, 15.5, 16.0);
    if (a2 > 0) ofBlade(hubX, hubY, L * a2, rot + TAU / 3);
    if (a3 > 0) ofBlade(hubX, hubY, L * a3, rot + 2 * TAU / 3);
  } else ofBlade(root[0], root[1], L, ang);
  ofHub(hubX, hubY, 12);
  // crane and hook
  const cx = hubX - L * 0.5 + 6 * 0 + (t < 3 ? 0 : 0), rootMid = [root[0] - L * 0.5 * Math.cos(sway), root[1] + L * 0.5 * Math.sin(-sway) * -1];
  const hx = done ? hubX - 100 : rootMid[0], crx = F5.x + CRANE_DX;
  const hy = done ? lerp(hubY - 110, hubY - 330, tr(t, 13.4, 14.4)) : (t < 3.0 ? lerp(80, F5.deck - 30 - 90, tr(t, 0.5, 2.4)) : rootMid[1] - 90);
  const ca = Math.acos(clamp((hx - crx) / BOOM, -1, 1)) / DEG;
  ofCrane(crx, F5.deck, ca, BOOM, { dir: 1, h: CRANE_H });
  const tip = ofCraneTip(crx, F5.deck, ca, BOOM, { dir: 1, h: CRANE_H });
  ofHook(hx, tip[1], hy);
  if (!done) { const a = t > 2.0; if (a) ofSling(hx, hy + 4, hx - 62, rootMid[1] + 2, hx + 62, rootMid[1] + 2); }
  // tag lines pulled by crew on the deck keep the blade from swinging (two thin lines)
  if (!done && t > 3.2) { ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(root[0] - L, root[1]); ctx.lineTo(F5.x + 80, F5.deck - 6); ctx.stroke(); }
  // alignment bolts
  bolts(hubX, hubY + 4, 40, E0 + 13.4);
  ofSeaFront(wl, { amp: 6, layers: 2, bottom: sb });
  // wind streaks
  const ws = clamp((gust - 0.34) * 2.4); if (ws > 0.02) for (let i = 0; i < 26; i++) { const y = 80 + ofRand('ws', i) * 700, x = mod(ofRand('wx', i) * 2400 + TT * (900 + 600 * ws) * 1, 2400) - 240; ctx.strokeStyle = `rgba(255,255,255,${0.35 * ws})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 90 + 120 * ws, y + 6); ctx.stroke(); }
  // the weather gauge: wind against the lift limit
  const gx = 1560, gy = 905, gw = 300;
  const f = () => {
    const a = tr(t, 2.6, 3.4) * (1 - tr(t, 13.4, 14.2)); if (a <= 0) return; const lim = 0.7, over = gust > lim;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,18,36,0.88)'; ctx.beginPath(); ctx.roundRect(gx - 24, gy - 74, gw + 48, 150, 16); ctx.fill(); ctx.strokeStyle = over ? OF.red : OF.cyan; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = OF.white; ctx.font = `700 24px ${OFONT}`; ctx.fillText('WIND', gx, gy - 40);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(gx, gy - 24, gw, 22); ctx.fillStyle = over ? OF.red : OF.cyan; ctx.fillRect(gx, gy - 24, gw * Math.min(1, gust), 22);
    ctx.fillStyle = OF.yellow; ctx.fillRect(gx + gw * lim - 2, gy - 34, 4, 42); ctx.font = `700 20px ${OFONT}`; ctx.fillText('LIFT LIMIT', gx + gw * lim - 46, gy + 32);
    ctx.fillStyle = over ? OF.red : OF.cyan; ctx.font = `800 26px ${OFONT}`; ctx.fillText(over ? 'HOLD THE LIFT' : (t > 11.0 ? 'WINDOW OPEN' : 'WATCHING'), gx, gy + 62 - 6); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
  if (done) screenChip(t < 14.8 ? 'BLADE  1 / 3' : (t < 15.5 ? 'BLADE  2 / 3' : 'BLADE  3 / 3'), 1720, 100, { size: 30 });
  ofTag('05', 'The delicate lift');
  ofCaption(t < 7.8 ? 'ONE BLADE, LIFTED ALONE' : (t < 11.0 ? 'A GUST CAN STOP THE JOB' : (t < 13.6 ? 'WAIT FOR THE WEATHER WINDOW' : 'THREE BLADES. DONE.')), { at: t < 7.8 ? 0.8 : (t < 11.0 ? 7.9 : (t < 13.6 ? 11.1 : 13.7)) });
  badge('Too windy? We wait.', 8.2, 11.4);
}
function camBlade(t) {
  const u = tr(t, 10.8, 11.7) * (1 - tr(t, 13.6, 14.4));
  return u > 0 ? camMix(CAM0, camOf({ z: 2.3, p: [F5.hub[0] - 70, F5.hub[1] + 6], to: [960, 540] }), u) : null;
}

// ---------------------------------------------------------------------
//  6. from construction to electricity
// ---------------------------------------------------------------------
const F6 = { wl: 700, sb: 1030 };
const FARM = [[1560, 1, 0], [2260, 0.78, -14], [2840, 0.62, -24], [3330, 0.5, -30], [880, 0.82, -16], [260, 0.66, -24], [-260, 0.53, -30], [-760, 0.43, -34], [1900, 0.4, -40], [1250, 0.38, -42], [2500, 0.34, -44], [-80, 0.32, -46]];
const SUBX = 3760, SHOREX = 4420;
function cablePath() {   // along the seabed: from the westmost turbine to the substation, then the export cable up to the shore
  const sb = F6.sb + 6, P = [[-760, sb]]; for (const x of [-260, -80, 260, 880, 1250, 1560, 1900, 2260, 2500, 2840, 3330, SUBX - 40]) P.push([x, sb]);
  P.push([SUBX, sb], [SHOREX - 100, sb], [SHOREX - 20, F6.wl + 40]);
  return P;
}
function sceneFarm() {
  const t = TT - E0, { wl, sb } = F6;
  ofBounds(-3200, 6400);
  ofSky(-2200, wl, { sunX: 1560, clouds: 6 });
  ofSeabed(sb, -3200, 6400, 1500);
  ofSeaBack(wl, sb + 2, { glitter: false });
  // shore on the right: land, houses, a pylon
  ctx.fillStyle = '#16293f'; ctx.beginPath(); ctx.moveTo(SHOREX - 160, wl + 60); ctx.lineTo(SHOREX - 40, wl - 10); for (let x = SHOREX; x <= SHOREX + 1200; x += 60) ctx.lineTo(x, wl - 60 - 50 * Math.sin(x * 0.004) - 30 * Math.sin(x * 0.011)); ctx.lineTo(SHOREX + 1200, sb + 40); ctx.lineTo(SHOREX - 160, sb + 40); ctx.closePath(); ctx.fill();
  const glow = tr(t, 8.5, 10.5);
  for (let i = 0; i < 7; i++) { const hx = SHOREX + 120 + i * 105, hy = wl - 46 - 30 * Math.sin(hx * 0.004) - 12; ofRect(hx, hy, 58, 40, '#1d3552', '#142a45'); ctx.fillStyle = `rgba(255,${190 + 20 * (i % 2)},110,${0.15 + 0.85 * glow})`; ctx.fillRect(hx + 12, hy + 12, 14, 14); ctx.fillRect(hx + 34, hy + 12, 14, 14); }
  { const px = SHOREX + 40, py = wl - 16; ctx.strokeStyle = '#28435f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px - 26, py); ctx.lineTo(px, py - 190); ctx.lineTo(px + 26, py); ctx.moveTo(px - 60, py - 150); ctx.lineTo(px + 60, py - 150); ctx.moveTo(px - 48, py - 112); ctx.lineTo(px + 48, py - 112); ctx.stroke(); }
  // the farm, back to front. Foreground turbine = the one we just built (same pose as the last scene)
  const rows = FARM.slice().sort((a, b) => a[1] - b[1]);
  rows.forEach(([x, s, off], i) => {
    const wy = wl + off, k = s;
    ctx.strokeStyle = 'rgba(70,90,110,0.9)'; ctx.lineWidth = Math.max(5, 22 * s); ctx.beginPath(); ctx.moveTo(x, wy); ctx.lineTo(x, sb); ctx.stroke();
    ctx.save(); ctx.translate(x, wy + 40 * k); ctx.scale(k, k); ofTransition(0, 0, 38); ctx.restore();
    ofTurbine(x, wy - 80 * k, k, { rot: TT * (0.5 + 0.1 * (i % 3)) + i * 1.3 });
  });
  ofSeaFront(wl, { amp: 10, layers: 2, bottom: sb });
  // the substation platform: legs to the seabed, deck, modules
  { const x = SUBX, dy = wl - 150; ctx.strokeStyle = '#6b7885'; ctx.lineWidth = 16; for (const dx of [-70, 70]) { ctx.beginPath(); ctx.moveTo(x + dx, dy + 30); ctx.lineTo(x + dx, sb); ctx.stroke(); }
    ofRect(x - 140, dy, 280, 36, '#ffd24d', '#c78d08', { line: 'rgba(0,0,0,0.35)' }); ofRect(x - 110, dy - 100, 130, 100, '#e8eef3', '#a9b6c3'); ofRect(x + 40, dy - 70, 80, 70, '#dfe6ec', '#9eacb9');
    ofRect(x - 40, dy - 190, 8, 90, '#8795a3'); ctx.fillStyle = OF.red; ctx.beginPath(); ctx.arc(x - 36, dy - 192, 6 + 2 * Math.sin(TT * 5), 0, TAU); ctx.fill(); }
  // electricity: cyan cables trace along the seabed from the turbines to the substation and on to shore, with pulses
  const P = cablePath(), lens = [0]; for (let i = 1; i < P.length; i++) lens.push(lens[i - 1] + dist(P[i - 1], P[i]));
  const total = lens[lens.length - 1], grow = tr(t, 4.6, 8.4) * total;
  const at = (d) => { for (let i = 1; i < P.length; i++) if (d <= lens[i]) { const u = (d - lens[i - 1]) / (lens[i] - lens[i - 1]); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; } return P[P.length - 1]; };
  if (grow > 0) {
    ctx.save(); ctx.strokeStyle = OF.cyan; ctx.lineWidth = 9; ctx.shadowColor = 'rgba(47,227,255,0.9)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(...P[0]);
    for (let i = 1; i < P.length; i++) { if (lens[i] <= grow) ctx.lineTo(...P[i]); else { const q = at(grow); ctx.lineTo(...q); break; } } ctx.stroke(); ctx.restore();
    // stubs from each foundation down to the cable
    ctx.strokeStyle = OF.cyan; ctx.lineWidth = 5; for (const [x] of FARM) { if (x <= at(grow)[0]) { ctx.beginPath(); ctx.moveTo(x, sb - 120); ctx.lineTo(x, sb + 6); ctx.stroke(); } }
    if (t > 6) for (let i = 0; i < 22; i++) { const d = mod(i * total / 22 + t * 520, total); if (d < grow) { const q = at(d); ctx.fillStyle = '#fff'; ctx.shadowColor = OF.cyan; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; } }
  }
  ofTag('06', 'From steel to power');
  ofCaption(t < 4.6 ? 'ONE TURBINE BECOMES A WIND FARM' : (t < 8.6 ? 'POWER RUNS THROUGH THE SEABED' : 'A SUBSTATION SENDS IT TO SHORE'), { at: t < 4.6 ? 0.6 : (t < 8.6 ? 4.8 : 8.8) });
}
function camFarm(t) {
  const len = SC.farm[1] - SC.farm[0], u = tr(t, 1.2, len - 1.6), z = lerp(1, 0.3, u);
  return camOf({ z, p: [lerp(FOUND_X, 2300, u * 0.0 + 0), lerp(500, 500, u)], to: [lerp(FOUND_X * 1, 950, u), lerp(500, 540, u)] });
}

// ---------------------------------------------------------------------
//  7. the subscribe end card: the user's own picture, 2s
// ---------------------------------------------------------------------
function sceneEnd() {
  const t = TT - E0, a = clamp(t / 0.15);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = a;
  if (!drawAsset('subscribe.png', 0, 0, W, H, { fit: 'contain' })) { ctx.fillStyle = OF.yellow; ctx.font = `700 46px ${OFONT}`; ctx.textAlign = 'center'; ctx.fillText('assets/subscribe.png is missing', W / 2, H / 2); }
  ctx.restore();
}
