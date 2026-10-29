// =====================================================================
//  SCENES — the tunnel piece. Each scene sets its iso origin, then draws back to front (painter's order).
//  Times are the voice's: cu.<line>. Springs settle every move; the camera is still.
// =====================================================================
const SEC = { L: 42, Wd: 54, H: 36, G: 5, N: 11, MID: 5 };   // one tube section: along x, across y, high z
const secX = (i) => -250 + i * (SEC.L + SEC.G);               // x of section i's back corner
const SEC_Y = -SEC.Wd / 2;
const TUBE_BASE = 30;                                          // the tube's base, on the gravel
const SEABED_TOP = 40, TRENCH_FLOOR = 26;                      // shelves top z=40; the trench floor z=26 (14 units down)
const SHELF_DROP = 200;                                        // the seabed drops in from above at cu.trench

// the seabed: shelves either side of the trench, a floor in the trench
function seabedDrop(t) { return (1 - spring(t, cu.trench, { k: 110, damp: 0.72 })) * SHELF_DROP; }
function seabedFar(t) {
  const dd = seabedDrop(t);
  if (t < cu.trench) return;
  isoBox(-420, -300, dd, 840, 260, SEABED_TOP, { r: 6 });
  isoBox(-420, -40, dd, 840, 80, TRENCH_FLOOR, { r: 4 });
}
function seabedNear(t) {
  if (t < cu.trench) return;
  isoBox(-420, 40, seabedDrop(t), 840, 260, SEABED_TOP, { r: 6 });
}
// gravel laid in the trench, one grain at a time, left to right
function gravel(t) {
  if (t < cu.bed) return;
  const dd = seabedDrop(t);
  isoGrid(43, 4, (i, j) => {
    const s = spring(t, cu.bed + i * 0.025, { k: 200, damp: 0.8 });
    if (s < 0.02) return;
    isoBox(-300 + i * 14, -20 + j * 14, TRENCH_FLOOR + dd, 8, 8, 4 * s, { r: 2, crease: false });
  });
}
function tubeSection(i, z, x = secX(i)) {
  isoBox(x, SEC_Y, z, SEC.L, SEC.Wd, SEC.H, { r: 12 });
  return x;
}
function labelAt(p, str, dx = 16, dy = 0, a = 1) {
  const q = isoP(p);
  ctx.save(); ctx.globalAlpha = a; ctx.font = `400 34px ${SANS}`; ctx.fillStyle = PAL.text;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, q[0] + dx, q[1] + dy); ctx.restore();
}
// a caption shows from t0 until t1 only, so neighbouring captions never sit on top of each other
const capAt = (str, t0, t1) => { if (TT >= t0 && TT < t1) isoCaption(str, { y: 960, at: t0 - E0 }); };

// ---- era 0: the strait. Europe and Asia either side of the water
function sceneStrait() {
  setIso({ ox: 960, oy: 500, u: 0.95 });
  const drop = (t0) => (1 - spring(TT, t0, { k: 120, damp: 0.7 })) * 160;
  isoBox(-430, -210, drop(cu.open - 0.2), 380, 420, 60, { r: 34 });        // Europe
  if (TT > cu.open) {
    const wz = -14 + 14 * spring(TT, cu.open + 0.3, { k: 90, damp: 0.8 });
    isoBox(-50, -210, wz - 14, 200, 420, 14, { r: 0, crease: false });  // the water, lower than both shores
    for (let k = 0; k < 6; k++) {                                       // ripples on the water, one line each
      const P = []; for (let x = -40; x <= 140; x += 10) P.push([x, -190 + k * 70, wz + 2 * Math.sin(x * 0.09 + TT * 2 + k)]);
      line3(P, PAL.inner);
    }
  }
  isoBox(150, -210, drop(cu.open), 380, 420, 60, { r: 34 });                // Asia
  capAt('Istanbul: Europe and Asia, one strait apart', cu.open + 0.3, cu.ask - 0.1);
}

// ---- era 1: the dry dock. Eleven sections, dropped in one by one
function sceneBasin() {
  setIso({ ox: 960, oy: 520, u: 1.05 });
  isoBox(-330, -170, (1 - spring(TT, cu.ask, { k: 120, damp: 0.7 })) * 160, 680, 340, 12, { r: 10 });
  for (let i = 0; i < SEC.N; i++) {
    const t0 = cu.cast - 0.1 + i * 0.22;
    if (TT < t0) continue;
    const z = 12 + (1 - spring(TT, t0, { k: 150, damp: 0.6 })) * 260;
    tubeSection(i, z);
    if (i === SEC.N - 1 && TT > t0 + 1.2) {
      const fp = faceOf([secX(i), SEC_Y, z + SEC.H], [1, 0, 0], [0, 1, 0]);
      accentDot(fp, SEC.L / 2, SEC.Wd / 2, 5);
    }
  }
  capAt('a railway under the sea', cu.ask + 0.4, cu.cast + 0.3);
  capAt('eleven sections, up to 18,000 tonnes each', cu.cast + 0.3, cu.tow - 0.1);
}

// ---- era 2: the tow. A section floats out over the strait while the trench is dredged
function sceneTow() {
  setIso({ ox: 960, oy: 520, u: 1.0 });
  const x = lerp(-760, secX(SEC.MID), EZ.io(seg(TT, cu.tow, cu.trench)));
  tubeSection(SEC.MID, 40, x);
  seabedFar(TT);
  seabedNear(TT);
  capAt('towed out to the strait', cu.tow + 0.3, cu.trench + 0.3);
  capAt('a trench dredged about 14 meters deep', cu.trench + 0.3, cu.sink - 0.1);
}

// ---- era 3: the sink. The section is lowered slowly into its trench
function sceneSink() {
  setIso({ ox: 960, oy: 520, u: 1.0 });
  seabedFar(TT);
  const z = lerp(40, TUBE_BASE, EZ.io(seg(TT, cu.sink, cu.sink + 5.5)));
  tubeSection(SEC.MID, z);
  seabedNear(TT);
  capAt('lowered by filling its internal tanks', cu.sink + 0.3, cu.window + 0.3);
  capAt('only when the current runs under three knots', cu.window + 0.3, cu.bed - 0.1);
}

// ---- era 4: the bed. Gravel goes down, grout fills the gaps, and a depth gauge reads the depth
function sceneBed() {
  setIso({ ox: 960, oy: 520, u: 1.0 });
  seabedFar(TT);
  gravel(TT);
  tubeSection(SEC.MID, TUBE_BASE);
  seabedNear(TT);
  if (TT > cu.deep) {
    const a = clamp(spring(TT, cu.deep, { k: 140, damp: 0.85 }));
    const gx = -470, gy = -160;
    line3([[gx, gy, SEABED_TOP], [gx, gy, -20]], PAL.edge);
    for (const z of [SEABED_TOP, TRENCH_FLOOR, -20]) line3([[gx - 8, gy, z], [gx + 8, gy, z]], PAL.edge);
    labelAt([gx, gy, SEABED_TOP], 'surface', 16, 0, a);
    labelAt([gx, gy, TRENCH_FLOOR], '14 m', 16, 0, a);
    labelAt([gx, gy, -20], '60 m', 16, 0, a);
  }
  capAt('a gravel bed, levelled by remote machines', cu.bed + 0.3, cu.deep + 0.3);
  capAt('the deepest point sits near 60 meters', cu.deep + 0.3, cu.end - 0.1);
}

// ---- era 5: the tunnel. All eleven sections join, and a train crosses
function sceneTunnel() {
  setIso({ ox: 960, oy: 500, u: 0.95 });
  seabedFar(TT);
  gravel(TT);
  for (let i = 0; i < SEC.N; i++) {
    if (i === SEC.MID) { tubeSection(i, TUBE_BASE); continue; }
    const z = TUBE_BASE + (1 - spring(TT, cu.end + 0.05 + Math.abs(i - SEC.MID) * 0.1, { k: 120, damp: 0.7 })) * 220;
    tubeSection(i, z);
  }
  seabedNear(TT);
  const top = TUBE_BASE + SEC.H, x = lerp(-330, 330, EZ.io(seg(TT, cu.end + 1.2, DURATION - 1.2)));
  if (TT > cu.end + 1.2) {
    isoBox(x - 35, -17, top, 70, 34, 24, { r: 8 });
    const fp = faceOf([x - 35, 17, top + 24], [1, 0, 0], [0, 0, -1]);
    for (const u of [6, 27, 48]) faceRR(fp, u, 5, 16, 8, 2, { fill: PAL.face, stroke: PAL.inner });
    accentDot(fp, 64, 12, 3);
  }
  capAt('1,387 meters of tube, Europe to Asia', cu.end + 0.3, DURATION);
}
