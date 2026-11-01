// =====================================================================
//  STATION 4 — proof (GXO map, conveyor, counter), doubt (the chart, the zero), payoff (scale, vendor).  (e1..e4, a1..a4)
// =====================================================================
const US = [[-124.7,48.4],[-123,49],[-95.2,49],[-89.6,48],[-84.8,46.5],[-82.4,43],[-79,43.3],[-75,45],[-71,45],[-67,47.3],[-67,44.8],[-70.2,43.6],[-70.7,42],[-74,40.6],[-75.5,38],[-76,36.9],[-75.5,35.2],[-77.5,34],[-79.5,33],[-81.2,31.8],[-81.3,30],[-80,26.8],[-80.4,25.2],[-81.8,26.3],[-82.8,28],[-84,30.1],[-85.5,29.7],[-88,30.4],[-89.4,29],[-91.5,29.5],[-94,29.6],[-97.2,27.8],[-97.2,26],[-99.5,27.5],[-101.5,29.8],[-104.5,29.5],[-106.5,31.8],[-108.2,31.3],[-111,31.3],[-114.8,32.5],[-117.1,32.5],[-118.5,34],[-120.6,34.5],[-121.9,36.6],[-122.5,37.8],[-124,40.4],[-124.5,42.8],[-124,46.2]];
const mapUV = (lon, lat) => [34 + (lon + 125) / 59 * 452, 30 + (49.6 - lat) / 25.4 * 246];
const PIN = { GA: [-83.9, 34.2], NC: [-80.9, 35.8], TN: [-86.3, 36.2] };
function mapPin(f, key, t0, col, lbl, big) {
  const a = popS2(t0, { k: 190, damp: 0.5 }); if (a < 0.02) return;
  const [u, v] = mapUV(...PIN[key]), r = (big ? 9 : 8) * Math.min(1.2, a), dz = (1 - Math.min(1, a)) * 46;
  for (let i = 0; i < 2; i++) { const k = mod((TT - t0) * 0.7 + i * 0.5, 1); if (TT > t0 + 0.2) { ctx.save(); ctx.globalAlpha = (1 - k) * 0.8; faceEll(f, u, v, 8 + k * 34, 8 + k * 34, { stroke: col, w: 2.5 }); ctx.restore(); } }
  glow(col, 18, () => { faceLine(f, [[u, v - dz], [u, v - dz - 22]], col, 3); faceEll(f, u, v - dz - 26, r, r, { fill: col, stroke: '#fff', w: 1.5 }); });
  isoText(f, lbl, u + 14, v + 30, 21, { color: PAL.text, font: ISOMONO, al: smoothstep(TT, t0 + 0.2, t0 + 0.5) });
}
function stationProof(X, hx) {
  // the map board, standing at the back
  const mA = popS2(Ts('e1') - 0.25), mz = 10 - (1 - Math.min(1, mA)) * 300;
  if (mA > 0.02 && TT < Ts('a1') + 0.6) {
    const mx = X - 260, my = -345;
    isoPanelY(mx, my, mz, 520, 300, 12, { col: '#0c2c52', r: 12, edge: withA(PAL.teal, 0.6), ew: 2 });
    const f = panelFaceY(mx, my, mz, 520, 300, 12);
    facePath(f, US.map(([lo, la]) => mapUV(lo, la)), true); ctx.fillStyle = withA(PAL.teal, 0.28); ctx.fill(); hair(PAL.teal, 2.2); ctx.stroke();
    mapPin(f, 'GA', Wt('e1', 5), PAL.amber, 'GA', true);
    // arcs from GA to NC and TN, then their pins
    const e3 = Ts('e3') + 0.5;
    for (const [k, col, lbl, dt] of [['NC', PAL.teal, 'NC', 0], ['TN', PAL.teal, 'TN', 0.45]]) {
      const q = clamp((TT - e3 - dt) / 0.6);
      if (q > 0) { const a = mapUV(...PIN.GA), b = mapUV(...PIN[k]), P = []; for (let i = 0; i <= 20 * q; i++) { const s = i / 20; P.push([lerp(a[0], b[0], s), lerp(a[1], b[1], s) - Math.sin(s * Math.PI) * 44]); } if (P.length > 1) glow(col, 10, () => faceLine(f, P, withA(col, 0.9), 3)); }
      mapPin(f, k, e3 + dt + 0.55, col, lbl, false);
    }
    isoText(f, 'GXO  ×  DIGIT', 20, 24, 20, { color: PAL.textD, font: ISOMONO });
  }
  // the conveyor and the totes (e2)
  const cA = popS2(Ts('e1') + 1.6);
  if (cA > 0.02 && TT < Ts('a1') + 0.6) {
    const bx = X - 10, by = -36, bl = 360, s = Math.min(1, cA);
    isoBox(bx, by, 0, bl * s, 72, 40, { col: '#1b2f48', r: 6 });
    const top = groundFace(bx, by, 40);
    faceRR(top, 4, 6, bl * s - 8, 60, 3, { fill: '#10202f' });
    for (let k = 0; k < 14; k++) { const u = mod(k * 28 + TT * 70, 392); if (u < bl * s - 10) faceLine(top, [[u + 4, 8], [u + 4, 64]], withA('#ffffff', 0.1), 3); }
    glow(PAL.amber, 10, () => faceLine(groundFace(bx, by + 72, 40), [[6, 0], [bl * s - 6, 0]], withA(PAL.amber, 0.8), 3));
    const per = 1.3, base = Ts('e1') + 2.0;
    for (let k = 0; k < 14; k++) {
      const sp = base + k * per + per * 0.55, age = TT - sp;
      if (age < 0 || age > 2.8) continue;
      const tx = bx + 8 + age * 120;
      if (tx < bx + bl - 44) tote(tx, -15, 40, 40, 30, 20, { col: k % 2 ? PAL.blue : shade(PAL.blue, 1.1), full: k % 3 === 0 ? PAL.cash : null });
    }
    // the counter plate
    const px = X + 150, py = -190, pz = 0;
    isoBox(px - 8, py + 20, 0, 12, 12, 54, { col: PAL.steelD, r: 3 }); isoBox(px - 8, py + 170, 0, 12, 12, 54, { col: PAL.steelD, r: 3 });
    glow(PAL.amber, 16, () => isoPanelX(px, py, 54, 200, 96, 10, { col: '#0a2038', r: 10, edge: PAL.amber, ew: 2 }));
    const pf = panelFaceX(px, py, 54, 200, 96, 10);
    const cnt = Math.round(100000 * smoothstep(TT, Ts('e2') + 0.5, Te('e2') - 0.1));
    isoText(pf, cnt >= 100000 ? '100,000+' : cnt.toLocaleString('en-US'), 100, 56, 46, { align: 'center', color: PAL.amber, font: ISOMONO, glow: PAL.amber });
    isoText(pf, 'TOTES MOVED', 100, 82, 20, { align: 'center', color: PAL.text, font: ISOMONO });
  }
  // e4: a calendar board, EARLY 2027
  const kA = popS2(Ts('e4') - 0.1);
  if (kA > 0.02 && TT < Ts('a1') + 0.4) {
    const kx = X + 390, ky = 70, kz = 0, fall = dropIn(Ts('e4') - 0.1, 260, { k: 130, damp: 0.55 });
    isoBox(kx, ky - 10, 0, 12, 12, 40 + fall, { col: PAL.steelD, r: 3 }); isoBox(kx + 150, ky - 10, 0, 12, 12, 40 + fall, { col: PAL.steelD, r: 3 });
    glow(PAL.teal, 18, () => isoPanelY(kx - 10, ky, 40 + fall, 190, 120, 10, { col: '#0e3d5c', r: 10, edge: PAL.teal, ew: 2 }));
    const f = panelFaceY(kx - 10, ky, 40 + fall, 190, 120, 10);
    faceRR(f, 0, 0, 190, 30, 8, { fill: PAL.red, stroke: false });
    isoText(f, 'EARLY', 95, 22, 22, { align: 'center', color: '#fff', font: ISOMONO });
    isoText(f, '2027', 95, 94, 64, { align: 'center', color: PAL.text, glow: PAL.teal });
  }
}
// ---- doubt: the misconception chart, the zero, the scale, the vendor
function stationDoubt(X, hx) {
  const t1 = Ts('a1');
  const cA = popS2(t1 - 0.1) * (1 - smoothstep(TT, Ts('a2') - 0.2, Ts('a2') + 0.3));
  if (cA > 0.02) {
    const cx = X - 120, cy = -230, w = 300, h = 210, z = 10 - (1 - Math.min(1, cA)) * 260;
    isoPanelY(cx, cy, z, w, h, 12, { col: '#0d2f55', r: 12, edge: withA(PAL.amber, 0.7), ew: 2 });
    const f = panelFaceY(cx, cy, z, w, h, 12);
    isoText(f, 'COST PER HOUR', 16, 30, 20, { color: PAL.textD, font: ISOMONO });
    faceRR(f, 50, 70, 70, h - 100, 6, { fill: withA(PAL.teal, 0.55), stroke: PAL.teal, w: 2 }); faceRR(f, 180, 100, 70, h - 130, 6, { fill: withA(PAL.amber, 0.55), stroke: PAL.amber, w: 2 });
    isoText(f, 'ROBOT', 85, h - 10, 17, { align: 'center', color: PAL.text, font: ISOMONO }); isoText(f, 'HUMAN', 215, h - 10, 17, { align: 'center', color: PAL.text, font: ISOMONO });
    isoText(f, '?', 85, 112, 44, { align: 'center', color: '#fff' });
    const xq = smoothstep(TT, Wt('a1', 6), Wt('a1', 6) + 0.35);
    if (xq > 0) glow(PAL.red, 24, () => { faceLine(f, [[34, 50], [34 + 232 * xq, 50 + 140 * xq]], PAL.red, 11); faceLine(f, [[266, 50], [266 - 232 * xq, 50 + 140 * xq]], PAL.red, 11); });
  }
  // a2: the zero
  const zA = popS2(Ts('a2') + 0.45) * (1 - smoothstep(TT, Ts('a3') + 0.0, Ts('a3') + 0.5));
  if (zA > 0.02) {
    const zx = X - 100, zy = -240, z = 10 - (1 - Math.min(1, zA)) * 280;
    glow(PAL.red, 26, () => isoPanelY(zx, zy, z, 260, 230, 12, { col: '#2a0f22', r: 12, edge: PAL.red, ew: 2.5 }));
    const f = panelFaceY(zx, zy, z, 260, 230, 12);
    isoText(f, '0', 130, 150, 190, { align: 'center', color: PAL.red, glow: PAL.red });
    isoText(f, 'HUMANOIDS IN PRODUCTION', 130, 188, 17, { align: 'center', color: PAL.text, font: ISOMONO });
    isoText(f, 'GXO, 2026  ·  ~20,000 ROBOTS PLANNED', 130, 212, 13, { align: 'center', color: PAL.textD, font: ISOMONO });
  }
  // a3: the scale: unproven ROI (heavy, red) against risk shift (light, teal), tipping to rent
  const sA = popS2(Ts('a3') + 0.1) * (1 - smoothstep(TT, Ts('a4') - 0.1, Ts('a4') + 0.4));
  if (sA > 0.02) {
    const tilt = 0.34 * spring(TT, Ts('a3') + 0.8, { k: 55, damp: 0.5 });
    ctx.save(); ctx.globalAlpha = clamp(sA);
    balanceScale(X + 130, -110, tilt,
      (px, py, pz) => { glow(PAL.red, 14, () => isoBox(px - 28, py - 22, pz, 56, 44, 40, { col: '#8a2432', r: 6 })); isoText(groundFace(px - 28, py - 22, pz + 40), 'ROI?', 28, 28, 22, { align: 'center', color: '#fff' }); },
      (px, py, pz) => { glow(PAL.teal, 14, () => isoBox(px - 24, py - 18, pz, 48, 36, 22, { col: '#1b9aa0', r: 6 })); });
    ctx.restore();
    worldTag([X + 10, -110, 235], 'UNPROVEN ROI', PAL.red, 26); worldTag([X + 250, -110, 235], 'RISK SHIFT', PAL.teal, 26);
  }
  // a4: risk icons fly from the hero to the vendor kiosk
  const vA = popS2(Ts('a4') - 0.1);
  if (vA > 0.02) {
    const vx = X + 300, vy = -60, s = Math.min(1, vA);
    isoBox(vx, vy, 0, 130 * s, 110 * s, 90 * s, { col: '#175c78', r: 8 });
    const vf = faceOf([vx, vy + 110 * s, 90 * s], [1, 0, 0], [0, 0, -1]);
    isoText(vf, 'VENDOR', 65 * s, 38 * s, 24 * s, { align: 'center', color: PAL.text, font: ISOMONO });
    glow(PAL.teal, 12, () => faceRR(vf, 20 * s, 50 * s, 90 * s, 22 * s, 6, { fill: withA(PAL.teal, 0.8), stroke: false }));
    isoText(vf, 'MAINTENANCE', 65 * s, 66 * s, 13 * s, { align: 'center', color: '#032a2c', font: ISOMONO });
    for (let i = 0; i < 3; i++) {
      const t0 = Ts('a4') + 0.5 + i * 0.45, q = (TT - t0) / 0.9; if (q <= 0 || q >= 1) continue;
      const e = EZ.io(q), p = [lerp(hx, vx + 65, e), lerp(0, vy + 55, e), lerp(150, 120, e) + Math.sin(e * Math.PI) * 110], c = isoP(p);
      glow(PAL.red, 14, () => { ctx.beginPath(); ctx.moveTo(c[0], c[1] - 20); ctx.lineTo(c[0] + 18, c[1] + 12); ctx.lineTo(c[0] - 18, c[1] + 12); ctx.closePath(); ctx.fillStyle = PAL.red; ctx.fill(); });
      ctx.save(); ctx.fillStyle = '#fff'; ctx.font = `800 18px ${SANS}`; ctx.textAlign = 'center'; ctx.fillText('!', c[0], c[1] + 9); ctx.restore();
    }
  }
}
