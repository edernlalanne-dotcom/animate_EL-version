// =====================================================================
//  SCENES — one function per era (ERA_LIST in head.html). Satellite eras draw the map in world coords (the camera
//  from src/bridges.js zooms it); countryball eras draw in screen coords. Every time is a narration line (VT / VE).
// =====================================================================
const DC_CHYRON = DC.night;   // the dark box behind a title or a label

// a label at a world point, drawn at screen size after the camera
function dcLabelAt(lo, la, str, t0, dx = 0, dy = -40) {
  const [x, y] = toScreen(...dcXY(lo, la));
  dcTitle(str, x + dx, y + dy, 46, '#ffffff', t0, { weight: 800, box: DC_CHYRON });
}
// the cross-section: sea level as a red line, the ground 6.7 m below it, a dike, a row of two-storey houses
function dcSection(alpha, mode) {
  const SL = 470, GR = 818, sc = 52;    // sea level y, ground y (6.7 m x 52 px/m = 348 px)
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = '#e9e1cc'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2f7aa0'; ctx.fillRect(0, SL, 340, H - SL);
  ctx.fillStyle = DC.soil; ctx.fillRect(440, GR, W - 440, H - GR);
  ctx.fillStyle = DC.grass; ctx.fillRect(440, GR - 18, W - 440, 18);
  dcDike(330, 460, GR, GR - (SL - 70), 1);
  const xs = mode === 'town' ? [520, 690, 860, 1030, 1200, 1370, 1540] : [620, 880, 1140, 1400];
  xs.forEach((x, i) => {
    const w = 120 + (i % 2) * 20;
    const h = (GR - SL) - w * 0.45;
    dcHouse(x, GR, w, h, { wall: ['#e8dcc2', '#f0e3c9', '#d9cdb0'][i % 3], roof: ['#b5483b', '#8e3b30'][i % 2] });
  });
  // sea level: a dashed red line across the whole frame
  ctx.setLineDash([26, 18]); ctx.strokeStyle = DC.red; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, SL); ctx.lineTo(W, SL); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = DC.red; ctx.font = `900 40px ${DC_SANS}`; ctx.textAlign = 'right';
  ctx.fillText('SEA LEVEL', W - 60, SL - 22);
  // the depth bracket
  ctx.strokeStyle = DC.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(1840, SL); ctx.lineTo(1840, GR); ctx.moveTo(1816, SL); ctx.lineTo(1864, SL); ctx.moveTo(1816, GR); ctx.lineTo(1864, GR); ctx.stroke();
  ctx.fillStyle = DC.ink; ctx.font = `900 58px ${DC_SANS}`; ctx.textAlign = 'right';
  ctx.fillText('6.7 m', 1800, (SL + GR) / 2 + 20);
  ctx.restore();
}

// ---------------------------------------------------------------------
//  1. the cold open: the satellite view from orbit
// ---------------------------------------------------------------------
function sceneCold() {
  dcSatellite();
  dcHud(['SAT-VIEW 04   ·   NETHERLANDS', '52.30 N   5.30 E   ·   ALT 820 KM']);
  dcTitle('THE NETHERLANDS', 110, 250, 150, '#ffffff', 1.2, { box: DC_CHYRON });
  dcTitle('below the waterline', 110, 340, 64, '#cfe9f2', 2.0, { weight: 700, box: DC_CHYRON });
}

// ---------------------------------------------------------------------
//  2. the lowest point: zoom into the polder, then the cross-section of a town
// ---------------------------------------------------------------------
function sceneLow() {
  dcSatellite();
  dcPin(DC_LOW[0], DC_LOW[1], VT('low_a') + 3.5);
  dcHud(['SAT-VIEW 04   ·   ZUIDPLASPOLDER', '51.95 N   4.60 E   ·   NAP -6.76 m']);
  dcTitle('6.7 m below sea level', W / 2 + 36, H / 2 - 36, 52, '#ffffff', VT('low_a') + 4.5, { weight: 800, box: DC_CHYRON });
  dcTitle('Nieuwerkerk aan den IJssel', W / 2 + 36, H / 2 + 76, 36, '#cfe9f2', VT('low_a') + 5, { weight: 600, box: DC_CHYRON });
  const xs = VT('low_b') - 0.3;
  if (TT >= xs) dcDefer(() => dcSection(ev(xs, 0.4), 'village'));
}

// ---------------------------------------------------------------------
//  3. Jeremy and the Netherlands: two countryballs on a hill
// ---------------------------------------------------------------------
function sceneJer() {
  ctx.fillStyle = DC.sky; ctx.fillRect(0, 0, W, H);
  dcCloud(320, 170, 1.1, 18); dcCloud(1120, 120, 0.8, 12); dcCloud(1640, 240, 1.0, 16);
  const gy = H * 0.74;
  ctx.fillStyle = DC.grass; ctx.fillRect(0, gy, W, H - gy);
  const r = 170, jy = gy - 1.4 * r, ny = gy - 1.4 * r, jx = W * 0.3, nx = W * 0.7;
  const wave = TT >= VT('jer_a') && TT < VT('jer_b') + 1.5 ? -1.2 + Math.sin(TT * 7) * 0.4 : -0.7;
  dcBall(jx, jy, r, { fill: DC.jer, hat: true, face: 'happy', look: 0.6, key: 'jer', arms: [[wave, r * 0.95], [0.9, r * 0.8]] });
  dcBall(nx, ny, r, { flag: 'nl', face: 'happy', look: -0.5, key: 'nl', arms: [[-0.3, r * 0.9], [2.6, r * 0.8]] });
  dcTitle('JEREMY', jx, gy + 150, 56, DC.ink, VT('jer_a') + 0.2, { align: 'center', box: DC.paper });
  dcTitle('THE NETHERLANDS', nx, gy + 150, 56, DC.ink, VT('nl_a') + 0.2, { align: 'center', box: DC.paper });
}

// ---------------------------------------------------------------------
//  4. polders: a dike, a lake pumped dry by a windmill, the land sinks
// ---------------------------------------------------------------------
function scenePolder() {
  ctx.fillStyle = DC.sky; ctx.fillRect(0, 0, W, H);
  dcCloud(200, 150, 0.9, 10); dcCloud(1300, 210, 1.1, 8);
  const gy = H * 0.66;
  const sink = 70 * EZ.io(seg(TT, VT('pol_e'), VT('pol_e') + 9));
  // the lake, left of the dike
  ctx.fillStyle = DC.water; ctx.fillRect(0, gy, W * 0.3, H - gy);
  // the dike, growing in
  const dk = EZ.o3(ev(VT('pol_a'), 3));
  dcDike(W * 0.3, W * 0.37, gy, 190 * dk, 1);
  // the polder: fields on the drained ground, sinking with the peat
  const py = gy + sink;
  ctx.fillStyle = DC.grass; ctx.fillRect(W * 0.37, py, W * 0.63, H - py);
  ctx.strokeStyle = '#4f7d3a'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const x = W * 0.37 + i * W * 0.07; ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x - 60, H); ctx.stroke(); }
  // the windmill on the dike, sails turning
  const wx = W * 0.335;
  dcWindmill(wx, gy + 4, 300 * EZ.o2(ev(VT('pol_c') - 0.5, 1.5)) + 1, TT * 1.1);
  // water pumped up and over the dike into the polder canal
  if (TT >= VT('pol_c')) {
    const A = [W * 0.2, gy + 50], C = [wx - 20, gy - 360], Bp = [W * 0.44, gy + 30];
    ctx.fillStyle = '#6fc1e6'; ctx.strokeStyle = DC.ink; ctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      const u = (i / 14 + TT * 0.45) % 1;
      const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * Bp[0];
      const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * Bp[1];
      ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
  dcBall(W * 0.6, gy + sink - 1.4 * 150, 150, { flag: 'nl', face: 'calm', look: 0.3, key: 'nlpol', arms: [[-0.2, 120], [0.9, 110]] });
  dcBall(W * 0.1, gy - 1.4 * 150 + 10, 150, { fill: DC.jer, hat: true, face: 'happy', look: 0.8, key: 'jpol', arms: [[-0.5, 120], [1.2, 110]] });
  dcTitle('Kinderdijk', wx + 150, gy - 300, 48, DC.ink, VT('pol_d'), { box: DC.paper });
  dcTitle('PUMPS: NO DAY OFF', W * 0.8, gy - 220, 52, DC.ink, VT('pol_e') + 1, { align: 'center', box: '#f5e36a' });
  dcHud(['SAT-VIEW 04   ·   POLDER, 1612 DRAINED', '52.61 N   4.95 E   ·   DRAINED BY WIND']);
}

// ---------------------------------------------------------------------
//  5. the dam, the airport below sea level, the North Sea arrives
// ---------------------------------------------------------------------
function sceneDam() {
  dcSatellite();
  const z = 1;
  ctx.save(); ctx.strokeStyle = DC.ink; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); dcPts(DC_DAM).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]);
  ctx.beginPath(); dcPts(DC_DAM).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.restore();
  dcLabelAt(5.02, 52.99, 'AFSLUITDIJK, 1932', VT('pol_f') + 0.6, 0, -60);
  dcPin(DC_SCHIPHOL[0], DC_SCHIPHOL[1], VT('pol_g'), '#f5e36a');
  dcLabelAt(4.76, 52.31, 'SCHIPHOL: BELOW SEA LEVEL', VT('pol_g') + 0.3, 40, -40);
  // the North Sea comes in from the right, shouting nothing, very patient
  const k = EZ.o3(ev(VT('ns_a'), 2.5));
  const nsx = lerp(W + 240, W * 0.8, k);
  dcBall(nsx, H * 0.5, 200, { flag: 'waves', fill: DC.ns, face: 'angry', look: -0.6, key: 'northsea', legs: false, arms: [[-2.6 + Math.sin(TT * 3) * 0.12, 190], [2.6 - Math.sin(TT * 3) * 0.12, 180]] });
  dcTitle('THE NORTH SEA', nsx, H * 0.5 + 300, 52, DC.ink, VT('ns_a') + 0.3, { align: 'center', box: DC.paper });
}

// ---------------------------------------------------------------------
//  6. the night of 31 January 1953: the surge, the dike, the attics
// ---------------------------------------------------------------------
function sceneStorm() {
  dcSatellite();
  ctx.fillStyle = 'rgba(5,10,16,0.66)'; ctx.fillRect(0, 0, W, H);
  // the sea over the south-west, rising
  const lv = EZ.o2(ev(VT('st_b'), 9));
  if (lv > 0) {
    ctx.save(); ctx.fillStyle = 'rgba(38,110,160,0.88)'; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W * 0.58; x += 24) { const top = H * (0.95 - 0.5 * lv) + Math.sin(x * 0.02 + TT * 3) * 10; ctx.lineTo(x, top); }
    ctx.lineTo(W * 0.58, H); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  dcRain(150, 900);
  // the dike cracking open
  if (TT > VT('st_b')) {
    ctx.save(); ctx.strokeStyle = DC.red; ctx.lineWidth = 9; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(W * 0.42, H * 0.56); ctx.lineTo(W * 0.44, H * 0.61); ctx.lineTo(W * 0.41, H * 0.66); ctx.lineTo(W * 0.45, H * 0.72); ctx.stroke(); ctx.restore();
  }
  // the family on the roof
  dcHouse(W * 0.08, H * 0.86, 240, 230, { wall: '#c9b9a0', roof: '#5b3a33' });
  const rx = W * 0.08 + 120, ry = H * 0.86 - 230 - 120 * 0.45;
  dcBall(rx - 60, ry - 10, 34, { fill: DC.jer, face: 'shock', legs: false, key: 'f1', bob: false });
  dcBall(rx + 60, ry - 10, 34, { fill: DC.jer, face: 'worried', legs: false, key: 'f2', bob: false });
  // the North Sea: big, angry, fists up
  dcBall(W * 0.8, H * 0.46, 200, { flag: 'waves', fill: DC.ns, face: 'angry', look: -0.6, key: 'ns2', legs: false, arms: [[-2.5 + Math.sin(TT * 5) * 0.15, 170], [-0.7, 160]] });
  // the Netherlands: small, worried, sweating
  dcBall(W * 0.46, H * 0.68, 120, { flag: 'nl', face: 'worried', look: -0.4, key: 'nlstorm', arms: [[-0.9, 110], [2.4, 100]] });
  ctx.save(); ctx.fillStyle = '#7fd0ff'; ctx.strokeStyle = DC.ink; ctx.lineWidth = 4;
  const dx = W * 0.46 + 96, dy = H * 0.68 - 110;
  ctx.beginPath(); ctx.moveTo(dx, dy - 26); ctx.quadraticCurveTo(dx + 22, dy + 6, dx, dy + 14); ctx.quadraticCurveTo(dx - 22, dy + 6, dx, dy - 26); ctx.fill(); ctx.stroke(); ctx.restore();
  dcStat('~1,800', 'people died in the Netherlands', VT('st_c'), W * 0.25, H * 0.2);
  dcStat('~70,000', 'evacuated from their homes', VT('st_c') + 0.8, W * 0.75, H * 0.2);
  dcTitle('NEVER AGAIN', W * 0.5, H * 0.52, 150, DC.ink, VT('st_d'), { align: 'center', box: DC.paper });
  dcHud(['SAT-VIEW 04   ·   SOUTH-WEST, 31 JAN 1953', 'STORM SURGE   ·   NORTH SEA']);
}

// ---------------------------------------------------------------------
//  7. the Delta Works: the barriers close; then the red line at sea level through a town
// ---------------------------------------------------------------------
function sceneDelta() {
  dcSatellite();
  const z = ctx.getTransform().a;
  // the Oosterschelde (open to the sea) and the Maeslant gates (floating, swinging shut)
  ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 / z; ctx.setLineDash([12 / z, 8 / z]);
  ctx.beginPath(); dcPts([[3.66, 51.6], [3.78, 51.66], [3.92, 51.74]]).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.restore();
  const kc = EZ.io(ev(VT('dw_c') - 2, 6));
  const P1 = dcXY(4.12, 51.99), P2 = dcXY(4.04, 51.98), L = 26;
  ctx.save(); ctx.strokeStyle = DC.ink; ctx.lineWidth = 6 / z; ctx.lineCap = 'round';
  const a1 = lerp(-1.45, -0.1, kc), a2 = lerp(Math.PI + 1.45, Math.PI + 0.1, kc);
  ctx.beginPath(); ctx.moveTo(P1[0], P1[1]); ctx.lineTo(P1[0] + Math.cos(a1) * L, P1[1] + Math.sin(a1) * L); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(P2[0], P2[1]); ctx.lineTo(P2[0] + Math.cos(a2) * L, P2[1] + Math.sin(a2) * L); ctx.stroke();
  ctx.restore();
  dcLabelAt(3.7, 51.55, 'OOSTERSCHELDE: OPEN TO THE SEA', VT('dw_b') + 0.4, 0, 60);
  dcLabelAt(4.04, 51.98, 'MAESLANT: GATES CLOSE IN A STORM', VT('dw_c') + 0.2, -40, -54);
  dcHud(['SAT-VIEW 04   ·   DELTA WORKS', '51.80 N   3.90 E   ·   BARRIERS']);
  const xs = VT('dw_e') - 0.3;
  if (TT >= xs) dcDefer(() => dcSection(ev(xs, 0.4), 'town'));
}

// ---------------------------------------------------------------------
//  8. the twist: a chart of sea level, the future shown as a range, a countryball on the rising water
// ---------------------------------------------------------------------
function sceneRise() {
  ctx.fillStyle = DC.paper; ctx.fillRect(0, 0, W, H);
  const x0 = 220, x1 = 1640, y0 = 880, yt = 260;
  const X = (yr) => x0 + (yr - 1900) / 200 * (x1 - x0);
  const cmAt = (yr) => 20 * Math.pow(Math.max(0, yr - 1900) / 118, 1.6);
  const Y = (cm) => y0 - cm * (y0 - yt) / 60;
  // the grid and the axes
  ctx.strokeStyle = 'rgba(19,19,19,0.15)'; ctx.lineWidth = 2;
  for (let c = 10; c <= 50; c += 10) { ctx.beginPath(); ctx.moveTo(x0, Y(c)); ctx.lineTo(x1, Y(c)); ctx.stroke(); }
  ctx.strokeStyle = DC.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 + 20, y0); ctx.moveTo(x0, y0); ctx.lineTo(x0, yt - 20); ctx.stroke();
  ctx.fillStyle = DC.ink; ctx.font = `700 38px ${DC_SANS}`; ctx.textAlign = 'center';
  ctx.fillText('1900', X(1900), y0 + 56); ctx.fillText('2000', X(2000), y0 + 56); ctx.fillText('2100', X(2100), y0 + 56);
  ctx.textAlign = 'right'; ctx.fillText('0', x0 - 22, y0 + 12);
  // the sea-level curve, drawn in as the voice says it, then the future as a dashed range
  const p = EZ.io(ev(VT('tw_b'), 6));
  const yEnd = lerp(1900, 2018, p);
  ctx.strokeStyle = DC.ns; ctx.lineWidth = 10; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let yr = 1900; yr <= yEnd; yr += 2) { const X1 = X(yr), Y1 = Y(cmAt(yr)); yr === 1900 ? ctx.moveTo(X1, Y1) : ctx.lineTo(X1, Y1); }
  ctx.stroke();
  if (p >= 1) {
    ctx.setLineDash([22, 16]); ctx.strokeStyle = DC.red; ctx.lineWidth = 8;
    ctx.beginPath();
    for (let yr = 2018; yr <= 2100; yr += 2) { const c = 20 + (yr - 2018) * 0.55; yr === 2018 ? ctx.moveTo(X(yr), Y(c)) : ctx.lineTo(X(yr), Y(c)); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = DC.red; ctx.font = `700 40px ${DC_SANS}`; ctx.textAlign = 'center';
    ctx.fillText('future scenarios', X(2070), Y(20 + 52 * 0.55) + 62);
  }
  dcStat('+20 cm', 'global sea level since 1900', VT('tw_b2'), 760, 330);
  dcTitle('Adaptive planning', 820, 640, 60, DC.ink, VT('tw_d'), { weight: 900, box: '#f5e36a' });
  // the Netherlands floats on the rising water, bottom right
  const wl = H * 0.8 - 40 * p;
  ctx.fillStyle = DC.ns; ctx.fillRect(1700, wl, W - 1700, H - wl);
  dcBall(1800, wl - 120 - 20 * Math.sin(TT * 1.4), 120, { flag: 'nl', face: 'happy', look: 0.2, key: 'nlrise', legs: false, bob: false, arms: [[-0.5, 100]] });
}

// ---------------------------------------------------------------------
//  9. hope: the Sand Motor, the Benthemplein water square, floating homes
// ---------------------------------------------------------------------
function sceneHope() {
  if (TT < VT('ho_c2') - 0.3) {
    // the coast at The Hague, with the Sand Motor spreading south along it
    dcSatellite();
    const k = EZ.o3(ev(VT('ho_c') - 0.5, 5));
    const [sx, sy] = dcXY(4.2, 52.05);
    ctx.save(); ctx.fillStyle = DC.sand; ctx.strokeStyle = DC.ink; ctx.lineWidth = 4 / ctx.getTransform().a;
    ctx.beginPath(); ctx.ellipse(sx, sy, 150 * k / ctx.getTransform().a, 46 * k / ctx.getTransform().a, -0.5, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    dcLabelAt(4.2, 52.05, 'SAND MOTOR', VT('ho_c') + 0.4, 0, -40);
    dcBall(W * 0.74, H * 0.5, 170, { fill: DC.jer, face: 'happy', look: -0.6, key: 'hopej', arms: [[-1.0 + Math.sin(TT * 4) * 0.2, 150], [0.8, 130]] });
    dcTitle('ROOM FOR THE RIVER', W * 0.5, 170, 68, DC.ink, VT('ho_b') + 0.2, { align: 'center', box: DC.paper });
    return;
  }
  if (TT < VT('ho_d') - 0.3) {
    // a city square that becomes a water basin in the rain
    ctx.fillStyle = '#9da39d'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#b9bdb6'; ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 180, H * 0.62); ctx.lineTo(i * 180 - 90, H); ctx.stroke(); }
    const fill = EZ.o2(ev(VT('ho_c2'), 7));
    ctx.fillStyle = DC.water; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.86, 520, 150, 0, 0, TAU); ctx.fill();
    const h = 120 * fill;
    ctx.save(); ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.86, 520, 150, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = '#3d8fc4'; ctx.fillRect(0, H * 0.86 + 150 - h * 2.2, W, H); ctx.restore();
    ctx.strokeStyle = DC.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.86, 520, 150, 0, 0, TAU); ctx.stroke();
    dcRain(120, 800);
    dcBall(W * 0.2, H * 0.66, 150, { flag: 'nl', face: 'happy', look: 0.4, key: 'nlsq', arms: [[-0.4, 130], [0.9, 120]] });
    dcTitle('BENTHEMPLEIN, ROTTERDAM', W * 0.5, 170, 62, DC.ink, VT('ho_c2') + 0.2, { align: 'center', box: DC.paper });
    return;
  }
  // floating homes on the water
  ctx.fillStyle = DC.sky; ctx.fillRect(0, 0, W, H * 0.62);
  dcCloud(260, 160, 1.0, 14); dcCloud(1300, 110, 0.9, 10);
  ctx.fillStyle = DC.water; ctx.fillRect(0, H * 0.62, W, H * 0.38);
  for (let i = 0; i < 2; i++) {
    const bob = Math.sin(TT * 1.3 + i * 2) * 12, x = W * (0.3 + i * 0.36), base = H * 0.68 + bob;
    ctx.fillStyle = '#6b4f3a'; ctx.strokeStyle = DC.ink; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(x - 170, base, 340, 60, 10); ctx.fill(); ctx.stroke();
    dcHouse(x - 120, base, 240, 210, { wall: ['#e8dcc2', '#f0e3c9'][i], roof: ['#b5483b', '#2f5d7c'][i] });
  }
  dcBall(W * 0.3 + 150, H * 0.68 - 280, 130, { flag: 'nl', face: 'happy', look: 0.5, key: 'nlfloat', legs: false, arms: [[0.5, 110], [-0.4, 110]] });
  dcTitle('THREAT BECAME METHOD', W * 0.5, 130, 76, DC.ink, VT('ho_e') - 0.2, { align: 'center', box: '#f5e36a' });
}

// ---------------------------------------------------------------------
//  10. the question
// ---------------------------------------------------------------------
function sceneClosing() {
  ctx.fillStyle = DC.paper; ctx.fillRect(0, 0, W, H);
  const gy = H * 0.8, r = 170;
  ctx.fillStyle = DC.grass; ctx.fillRect(0, gy, W, H - gy);
  dcBall(W * 0.36, gy - 1.4 * r, r, { fill: DC.jer, hat: true, face: 'happy', look: 0.6, key: 'jend', arms: [[-1.2 + Math.sin(TT * 5) * 0.2, r * 0.95], [0.9, r * 0.8]] });
  dcBall(W * 0.64, gy - 1.4 * r, r, { flag: 'nl', face: 'happy', look: -0.6, key: 'nlend', arms: [[-1.2 + Math.sin(TT * 5 + 1) * 0.2, r * 0.95], [2.4, r * 0.8]] });
  dcTitle('If the sea came back for your town,', W * 0.5, 220, 70, '#ffffff', VT('cl_d'), { align: 'center', box: DC.night });
  dcTitle('what would you build first?', W * 0.5, 320, 70, '#ffffff', VT('cl_d') + 1.2, { align: 'center', box: DC.night });
}

// ---------------------------------------------------------------------
//  11. the channel card: the user's own logo, 2 seconds
// ---------------------------------------------------------------------
function sceneEnd() {
  ctx.fillStyle = DC.night; ctx.fillRect(0, 0, W, H);
  if (!drawAsset('subscribe.jpg', W / 2 - 480, H / 2 - 480, 960, 960, { fit: 'contain' })) {
    ctx.fillStyle = '#ffffff'; ctx.font = `900 96px ${DC_SANS}`; ctx.textAlign = 'center'; ctx.fillText('SUBSCRIBE', W / 2, H / 2);
  }
}
