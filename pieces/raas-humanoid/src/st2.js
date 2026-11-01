// =====================================================================
//  STATION 2 — money: a vault empties into a crate (CapEx), value falls, then monthly tiles (OpEx), then the scale.
// =====================================================================
function bill(x, y, z, a = 1) { isoBox(x, y, z, 40, 22, 4, { col: PAL.cash, r: 3, l: 0.95, rr: 0.7 }); faceRR(groundFace(x, y, z + 4), 14, 5, 12, 12, 6, { stroke: withA('#05301f', 0.7) }); }
function balanceScale(x, y, tilt, drawL, drawR) {
  const zt = 170, hl = 120, sn = Math.sin(tilt), cs = Math.cos(tilt);
  isoBox(x - 50, y - 40, 0, 100, 80, 14, { col: PAL.steelD, r: 10 });
  isoCyl(x, y, 14, 8, zt - 14, { col: PAL.steel });
  const L = [x - hl * cs, y, zt - hl * sn * -1 + 0], R = [x + hl * cs, y, zt + hl * sn * -1 + 0];
  // tilt > 0: the LEFT end goes down
  L[2] = zt - hl * sn; R[2] = zt + hl * sn;
  const panZ = (P) => P[2] - 80;
  const pan = (P, draw) => {
    line3([P, [P[0] - 40, P[1], panZ(P) + 6]], withA(PAL.steel, 0.5), 2); line3([P, [P[0] + 40, P[1], panZ(P) + 6]], withA(PAL.steel, 0.5), 2);
    isoCyl(P[0], P[1], panZ(P), 52, 7, { col: shade(PAL.steelD, 1.1), r: 52 });
    if (draw) draw(P[0], P[1], panZ(P) + 7);
  };
  pan(L, drawL);
  limb([L, [x, y, zt], R], 8, PAL.steel);
  ball([x, y, zt], 11, PAL.amber);
  pan(R, drawR);
  return { L, R };
}
function stationMoney(X, hx) {
  const vx = X + 40, vy = -280, vw = 170, vd = 140, vh = 150;
  const tOpen = Ts('s1a'), tClose = Ts('s1c') + 0.1;
  const doorOpen = smoothstep(TT, tOpen, tOpen + 0.4) * (1 - smoothstep(TT, tClose, tClose + 0.4));
  const rise = (t0) => dropIn(t0, 240, { k: 120, damp: 0.7 });
  // ---- s1b: the value chart stands behind the hero (drawn first, it is the farthest)
  const cT = Ts('s1b') - 0.25, cA = popS2(cT) * (1 - smoothstep(TT, Ts('s1c') + 0.1, Ts('s1c') + 0.6));
  if (cA > 0.02) {
    const cx = X - 330, cy = -340, cw = 330, ch = 230, z = 14 - (1 - Math.min(1, cA)) * 260;
    isoPanelY(cx, cy, z, cw, ch, 12, { col: '#0d2f55', r: 12, edge: withA(PAL.red, 0.7), ew: 2 });
    const f = panelFaceY(cx, cy, z, cw, ch, 12);
    isoText(f, 'ROBOT VALUE', 18, 34, 22, { color: PAL.textD, font: ISOMONO });
    faceLine(f, [[30, 52], [30, ch - 30], [cw - 22, ch - 30]], withA('#ffffff', 0.35), 3);
    const p = clamp((TT - cT - 0.2) / 2.2), pts = []; for (let i = 0; i <= 40 * p; i++) { const q = i / 40; pts.push([34 + q * (cw - 70), 62 + (ch - 100) * (1 - Math.exp(-3.1 * q)) * 0.98]); }
    if (pts.length > 1) { glow(PAL.red, 16, () => faceLine(f, pts, PAL.red, 6)); const e = pts[pts.length - 1]; glow(PAL.red, 18, () => faceEll(f, e[0], e[1], 8, 8, { fill: PAL.red })); }
    isoText(f, 'DEPRECIATION', cw - 20, 62, 21, { color: PAL.red, align: 'right', font: ISOMONO, al: smoothstep(TT, cT + 0.8, cT + 1.2) });
  }
  // ---- the vault
  isoBox(vx, vy, 0, vw, vd, vh, { col: '#2b3f5c', r: 12 });
  const vf = faceOf([vx, vy + vd, vh], [1, 0, 0], [0, 0, -1]);
  const dc = doorOpen > 0.5 ? PAL.red : PAL.teal;
  glow(dc, 18, () => faceEll(vf, vw / 2, vh / 2, 46, 46, { fill: '#162840', stroke: dc, w: 3 }));
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + doorOpen * 2; faceLine(vf, [[vw / 2 + Math.cos(a) * 12, vh / 2 + Math.sin(a) * 12], [vw / 2 + Math.cos(a) * 36, vh / 2 + Math.sin(a) * 36]], dc, 3); }
  isoText(vf, 'CASH', vw / 2, 26, 22, { align: 'center', color: PAL.text, font: ISOMONO });
  // ---- the crate (hardware) and the bills flying into it; it fades out when renting starts
  const crA = popS2(tOpen - 0.1) * (1 - smoothstep(TT, Ts('s1c') + 0.0, Ts('s1c') + 0.5));
  const dep = smoothstep(TT, Ts('s1b'), Ts('s1b') + 2.4);
  if (crA > 0.02) {
    const cs = Math.min(1, crA), cx2 = X + 70, cy2 = 30;
    ctx.save();
    isoBox(cx2, cy2, 0, 150 * cs, 110 * cs, 100 * cs, { col: mixC('#a86f2a', '#6b6f78', dep), r: 6, l: 0.9 });
    const top = groundFace(cx2, cy2, 100 * cs), cf = faceOf([cx2, cy2 + 110 * cs, 100 * cs], [1, 0, 0], [0, 0, -1]);
    for (const u of [20, 128]) faceLine(cf, [[u * cs, 0], [u * cs, 100 * cs]], withA('#2a1a08', 0.55), 5);
    isoText(cf, 'HUMANOID', 75 * cs, 44 * cs, 20 * cs, { align: 'center', color: '#f4e2c0', font: ISOMONO });
    faceRR(cf, 32 * cs, 54 * cs, 86 * cs, 30 * cs, 5, { fill: withA(PAL.red, 0.9), stroke: false });
    isoText(cf, '$100K', 75 * cs, 77 * cs, 26 * cs, { align: 'center', color: '#fff' });
    ctx.restore();
    worldTag([cx2 + 75, cy2 + 55, 118], 'ILLUSTRATIVE', PAL.textD, 22);
    // bills arc from the vault door into the crate
    for (let i = 0; i < 10; i++) {
      const t0 = tOpen + 0.3 + i * 0.13, q = (TT - t0) / 0.75;
      if (q <= 0 || q >= 1) continue;
      const sx = vx + 60 + (i % 3) * 14, sy = vy + vd + 8, ex = cx2 + 55 + (i % 2) * 12, ey = cy2 + 40, e = EZ.io(q);
      bill(lerp(sx, ex, e), lerp(sy, ey, e), lerp(70, 112, e) + Math.sin(e * Math.PI) * 110);
    }
  }
  // ---- s1c: monthly tiles (OpEx)
  const hy = 60;
  for (let i = 0; i < 4; i++) {
    const t0 = Ts('s1c') + 0.35 + i * 0.4, a = popS2(t0) * (1 - smoothstep(TT, Ts('s1d') - 0.05, Ts('s1d') + 0.35));
    if (a < 0.02) continue;
    const s = Math.min(1, a), px = X - 40 + i * 78, pz = dropIn(t0, 200, { k: 160, damp: 0.55 });
    isoBox(px, hy, pz, 66 * s, 66 * s, 10 * s, { col: '#176b86', r: 7 });
    const tp = groundFace(px, hy, pz + 10 * s);
    faceRR(tp, 6, 6, 54, 14, 3, { fill: PAL.amber }); isoText(tp, 'MO ' + (i + 1), 33, 17, 11, { align: 'center', color: '#3a2200', font: ISOMONO });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) faceRR(tp, 8 + c * 13, 28 + r * 14, 9, 9, 2, { fill: withA('#ffffff', 0.35), stroke: false });
    glow(PAL.amber, 12, () => faceEll(tp, 33, 47, 6, 6, { fill: PAL.amber }));
  }
  const bA = popS2(Ts('s1c') + 0.3) * (1 - smoothstep(TT, Ts('s1d') - 0.05, Ts('s1d') + 0.35));
  if (bA > 0.02) worldTag([X + 60, hy + 20, 60], '$8.5K / MO  ILLUSTRATIVE', PAL.amber, 26);
  // ---- s1d: the balance scale, cash against rented AI, settling level
  const sA = popS2(Ts('s1d') + 0.2), fade = 1 - smoothstep(TT, Ts('s2a') - 0.3, Ts('s2a') + 0.4);
  if (sA * fade > 0.02) {
    const tilt = 0.32 * (1 - spring(TT, Ts('s1d') + 0.9, { k: 60, damp: 0.5 }));
    ctx.save(); ctx.globalAlpha = clamp(sA * fade);
    balanceScale(X + 20, 150, tilt, (px, py, pz) => { for (let k = 0; k < 4; k++) bill(px - 20, py - 11, pz + k * 5); }, (px, py, pz) => { robotMini(px, py, pz, 0.34); });
    ctx.restore();
  }
}
// a little robot (scaled hero) for icons, pedestals and pans
function robotMini(x, y, z, s, o = {}) { robot(x, y, z, s, { moving: 0, ...o }); }
