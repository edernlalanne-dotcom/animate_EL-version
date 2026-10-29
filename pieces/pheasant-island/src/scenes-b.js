// =====================================================================
//  SCENES (part B) — eras 4-7: the rule, today, other shared places, the answer.
// =====================================================================
const ISL_LAND = () => wmLand(ISL_P, { key: 'isl', fill: WM.land, amt: 4 });

// ---- era 4: the 1901 convention. The ring is the year. One state holds the duty for each half.
function sceneRule() {
  const r1 = VL('rule1'), cv = VL('conv'), sp = VL('spain'), fr = VL('france'), ct = VL('courts'), on = VL('only');
  riverBase(); ISL_LAND();
  const k = EZ.o3(ev(M[3] + MD - 0.1, 0.5));
  // which state holds the duty now: none until the sweep, then the lines name each half
  let duty = null, ang = null;
  const s0 = cv.t0 + 1.0, s1 = cv.t1 - 0.2;
  if (TT >= s0 && TT < sp.t0) { const f = EZ.io(seg(TT, s0, s1)); ang = mA(0) + TAU * f; duty = (f % 1) < 0.5 ? 'ES' : 'FR'; if (TT >= s1) { duty = null; ang = null; } }
  if (TT >= sp.t0 && TT < fr.t0) duty = 'ES';
  if (TT >= fr.t0 && TT < on.t0 + 0.0) duty = 'FR';
  const mv = VT('only', 'moves');
  if (TT >= on.t0) duty = TT < mv ? 'FR' : 'ES';
  drawRing(IC[0], IC[1], 300 * k, 248 * k, { letters: k > 0.95, duty, pointer: ang });
  if (k > 0.95) {
    wmText('1 Feb', IC[0], IC[1] + 300 + wmPx(46), 34, { box: WM.line });
    wmText('1 Aug', IC[0], IC[1] - 300 - wmPx(46), 34, { box: WM.line });
  }
  // flags of the state on duty, inside the ring
  const f0 = TT >= on.t0 ? (TT < mv ? fr.t0 : mv) : TT >= fr.t0 ? fr.t0 : sp.t0;
  if (duty === 'ES') pmFlag(IC[0] - 170, IC[1] + 70, f0, 'ES', 80);
  if (duty === 'FR') pmFlag(IC[0] + 100, IC[1] + 70, f0, 'FR', 80, { ph: 0.5 });
  // the dates, beside the ring, until the camera pans
  const fade = 1 - EZ.i2(ev(ct.t0 - 0.3, 0.25));
  if (fade > 0.01) {
    ctx.save(); ctx.globalAlpha = fade;
    wmBadge('Spain: 1 Feb to 31 Jul', IC[0] - 330, IC[1], sp.t0 + 0.2, { c: WM.gold, color: WM.line, size: 36, align: 'right' });
    wmBadge('France: 1 Aug to 31 Jan', IC[0] + 330, IC[1], fr.t0 + 0.2, { c: WM.rival, color: WM.line, size: 36, align: 'left' });
    ctx.restore();
  }
  // the rules on courts, to the right of the ring once it has moved left
  wmBadge('Spanish or French: own courts', 1330, 380, VT('courts', 'citizens'), { c: WM.white, color: WM.line, size: 34, align: 'left' });
  wmBadge('Anyone else: courts of the state on duty', 1330, 560, VT('courts', 'else'), { c: WM.gold, color: WM.line, size: 34, align: 'left' });
  if (TT >= on.t0) wmBadge('Owner: both', 1330, 740, VT('only', 'Ownership'), { c: WM.navy, color: WM.white, size: 36, align: 'left' });
  wmTag('1901', { x: 80, y: 90, at: capAt(cv.t0) });
  const cap = TT < cv.t0 ? 'Who enforces the law?' : TT < sp.t0 ? 'Policing passes in turns' : TT < ct.t0 ? 'Six months each' : TT < on.t0 ? 'Which courts apply?' : 'Only the duty moves';
  const at = TT < cv.t0 ? r1.t0 + 0.8 : TT < sp.t0 ? cv.t0 + 1.2 : TT < ct.t0 ? sp.t0 + 0.3 : TT < on.t0 ? ct.t0 + 0.1 : on.t0 + 0.1;
  wmCaption(cap, { hl: ['LAW?', 'TURNS', 'EACH', 'COURTS', 'DUTY'], size: 54, y: 985, max: 1500, at: capAt(at) });
  heroG(0.1, mv);
}

// ---- era 5: the island today, at scale
function sceneToday() {
  const t1 = VL('today1'), sz = VL('size');
  riverBase(); drawIsland();
  // football pitch at the same scale (105 m x 68 m at 1.57 px per metre)
  const px = 1.57, pw = 105 * px, ph = 68 * px, pcx = IC[0] - 400, pcy = IC[1] + 20, kp = popS(VT('size', 'metres'));
  if (kp > 0.01) {
    ctx.save(); ctx.translate(pcx, pcy); ctx.scale(kp, kp);
    ctx.fillStyle = WM.rival; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); wmStroke(WM.white, 4);
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph); ctx.beginPath(); ctx.moveTo(0, -ph / 2); ctx.lineTo(0, ph / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 9.15 * px, 0, TAU); ctx.stroke();
    ctx.restore();
    wmLabel('Football pitch', pcx, pcy + wmPx(100), VT('size', 'metres') + 0.2, 36, { box: WM.white, color: WM.line });
    wmLabel('105 x 68 m', pcx, pcy + wmPx(165), VT('size', 'metres') + 0.35, 30, { box: WM.white, color: WM.line });
  }
  const mL = EZ.io(ev(VT('size', 'about') - 0.1, 1.2)), mW = EZ.io(ev(VT('size', 'wide') - 0.9, 0.9));
  wmMeasure([IC[0] + 80, IC[1] + 165], [IC[0] + 80, IC[1] - 165], mL, (f) => `${Math.round(210 * f)} m`, { off: 90, size: 40 });
  wmMeasure([IC[0] - 32, IC[1] + 215], [IC[0] + 32, IC[1] + 215], mW, (f) => `${Math.round(40 * f)} m`, { off: 50, size: 34 });
  wmStamp('Closed', IC[0] + 40, IC[1] - 60, VT('today1', 'closed'), { r: 100, c: WM.crimson, rot: -10 });
  wmTag('Today', { x: 80, y: 90, at: capAt(t1.t0) });
  const cap = TT < sz.t0 - 0.2 ? 'Closed to the public' : 'About 210 m long. Nobody lives here.';
  wmCaption(cap, { hl: ['CLOSED', '210', 'NOBODY'], size: 54, y: 985, max: 1500, at: capAt(TT < sz.t0 - 0.2 ? t1.t0 + 0.1 : sz.t0 + 0.1) });
  heroG(0.1, VT('size', 'metres'));
}

// ---- era 6: Europe again. A calendar replaced a line; other places are shared too.
function sceneWhy() {
  const L = VL('why');
  drawEurope();
  wmBorder(PYR, 1, { solid: true, w: 5 });
  wmLand(DOT, { raw: true, fill: WM.gold, shadow: false });
  const z = Math.max(1, ctx.getTransform().a);
  wmPin(ISLE[0], ISLE[1], L.t0 - 5, { size: 60 });
  wmLabel('Pheasant Island', ISLE[0] + wmPx(10), ISLE[1] - wmPx(130), VT('why', 'calendar'), 38, { box: WM.gold, color: WM.line, out: L.t1 - 0.75 });
  wmPin(LAKE[0], LAKE[1], VT('why', 'Constance') - 0.3, { c: WM.navy, size: 56 });
  wmLabel('Lake Constance', LAKE[0] + wmPx(10), LAKE[1] - wmPx(120), VT('why', 'Constance'), 36, { box: WM.white, color: WM.line, out: L.t1 - 0.75 });
  wmPin(MOSEL[0], MOSEL[1], VT('why', 'Moselle') - 0.3, { c: WM.navy, size: 56 });
  wmLabel('Moselle', MOSEL[0] - wmPx(10), MOSEL[1] - wmPx(120), VT('why', 'Moselle'), 36, { box: WM.white, color: WM.line, out: L.t1 - 0.75 });
  wmTag('Shared places', { x: 80, y: 90, at: capAt(L.t0) });
  const cap = TT < VT('why', 'Lake') - 0.2 ? 'A calendar replaced a line' : 'Other places are shared too';
  wmCaption(cap, { hl: ['CALENDAR', 'SHARED'], size: 54, y: 985, max: 1500, at: capAt(TT < VT('why', 'Lake') - 0.2 ? L.t0 + 0.2 : VT('why', 'Lake') + 0.1) });
  heroG(0.1, VT('why', 'Lake'));
}

// ---- era 7: back to the island. Silence, then the answer.
function sceneClose() {
  const c1 = VL('close1'), pay = TIMELINE.cues.payoff;
  riverBase(); drawIsland();
  const duty = TT >= pay ? 'FR' : null;
  drawRing(IC[0], IC[1], 300, 248, { letters: true, duty });
  wmText('1 Feb', IC[0], IC[1] + 300 + wmPx(46), 34, { box: WM.line });
  wmText('1 Aug', IC[0], IC[1] - 300 - wmPx(46), 34, { box: WM.line });
  pmFlag(IC[0] - 170, IC[1] + 70, M[6] + 0.2, 'ES', 80);
  pmFlag(IC[0] + 100, IC[1] + 70, M[6] + 0.35, 'FR', 80, { ph: 0.5 });
  if (TT >= c1.t0 && TT < pay) wmStamp('?', 1300, 300, c1.t0, { r: 64 });
  if (TT >= pay) {
    wmBadge('Owned by both', 380, IC[1], pay, { c: WM.navy, color: WM.white, size: 46 });
    wmBadge('Policed by one', 1540, IC[1], pay + 0.15, { c: WM.gold, color: WM.line, size: 46 });
  }
  wmTag('So', { x: 80, y: 90, at: capAt(c1.t0) });
  if (TT < pay) wmCaption('So who owns it?', { hl: ['OWNS'], size: 60, y: 985, max: 1500, at: capAt(c1.t0 + 0.1) });
  else wmCaption('Owned by both. Policed by one.', { hl: ['BOTH.', 'ONE.'], size: 56, y: 985, max: 1600, at: capAt(pay + 0.1) });
  heroG(0.1, pay);
}
