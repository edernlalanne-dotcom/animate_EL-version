// =====================================================================
//  SCENES — one continuous top-down flight over two lock lanes. World: 2 px per foot.
//  Lane 1 (y = 0):   original lock chamber 1,050 x 110 ft  -> 2100 x 220 px, a Panamax ship 965 x 106 ft -> 1930 x 212.
//  Lane 2 (y = 900): Neopanamax chamber 1,400 x 180 ft     -> 2800 x 360 px, a ship 1,200 x 168 ft     -> 2400 x 336.
//  Gap each side: lane 1 (220 - 212) / 2 = 4 px = 2 ft. Lane 2 (360 - 336) / 2 = 12 px = 6 ft.
//  Structure: cold open on the gap, globe zoom, football fields, hull drift and mules, gates, full-width cutaway,
//  staircase, size comparison with the new locks, payoff, subscribe card.
// =====================================================================
const OLD = { len: 2100, wid: 220, y: 0 }, NEO = { len: 2800, wid: 360, y: 900 };
const OSHIP = { len: 1930, beam: 212 }, NSHIP = { len: 2400, beam: 336 };
const frac = (L, f) => L.t0 + (L.t1 - L.t0) * f;       // a moment inside a line (word times are estimated, so cues use line fractions)
const T_ = {
  hook: VL('hook'), box: VL('box'), park: VL('park'), mules: VL('mules'), gates: VL('gates'), guess: VL('guess'), water: VL('water'), lift: VL('lift'),
  neo: VL('neo'), eiffel: VL('eiffel'), pay: VL('payoff'), teaser: VL('teaser'), cta: VL('cta'),
};
const fh = (x) => frac(T_.hook, x), fb = (x) => frac(T_.box, x), fm = (x) => frac(T_.mules, x), fn = (x) => frac(T_.neo, x), fp = (x) => frac(T_.pay, x), fw = (x) => frac(T_.water, x), fk = (x) => frac(T_.park, x);

// ---- ship positions
const oldShipX = (t) => lerp(235, 1050, EZ.o3(seg(t, 0, G1 - 0.4)));
const neoShipX = (t) => (t < T_.pay.t0 + 1.0 ? lerp(-1500, 1400, EZ.o3(seg(t, T_.neo.t0 - 0.6, T_.neo.t0 + 3.6))) : lerp(1400, 3600, EZ.i2(seg(t, T_.pay.t0 + 1.0, END_T - 0.3))));
// the hull drifts toward the top wall until the gap is almost gone, then the mules' cables pull it back (exaggerated for the demonstration: the real gap is 4 px)
function driftY(t) {
  const up = EZ.io(seg(t, fm(0.10), fm(0.28))), back = EZ.o3(seg(t, fm(0.38), fm(0.54))), t1 = fm(0.38);
  const ring = t > t1 ? Math.exp(-3 * (t - t1)) * Math.sin((t - t1) * 9) * 0.35 : 0;
  return -3.4 * up * (1 - back) + ring * back;
}

// ---- camera keys: [t, zoom, worldX, worldY, screenY fraction]
const CAMK = [
  [G0 + 0.5, 0.72, 1050, -120, 0.5],
  [T_.box.t0 + 0.8, 0.76, 1050, -170, 0.5],
  [T_.box.t1 - 0.2, 0.84, 1050, -170, 0.5],
  [T_.mules.t0 + 0.15, 0.84, 1050, -170, 0.5],
  [fm(0.10), 4.2, 1700, -125, 0.5],
  [fm(0.62), 4.2, 1700, -125, 0.5],
  [fm(0.80), 1.15, 1050, 0, 0.5],
  [T_.mules.t1 - 0.3, 1.15, 1050, 0, 0.5],
  [T_.gates.t0 - 0.1, 1.5, 180, 0, 0.5],
  [T_.gates.t1 + 0.4, 1.5, 180, 0, 0.5],
  [T_.gates.t1 + 1.0, 0.62, 1050, 0, 0.5],
  [T_.lift.t1 - 0.2, 0.62, 1050, 0, 0.5],
  [T_.neo.t0 + 1.2, 0.62, 1400, 900, 0.5],
  [fn(0.50), 0.66, 1400, 900, 0.5],
  [fn(0.60), 5.2, 2000, 726, 0.5],
  [fn(0.76), 5.2, 2020, 726, 0.5],
  [fn(0.92), 1.9, 2420, 900, 0.5],
  [T_.neo.t1 + 0.1, 1.9, 2420, 900, 0.5],
  [T_.eiffel.t0 + 0.5, 0.48, 1400, 1150, 0.5],
  [T_.pay.t0 + 0.2, 0.48, 1400, 1150, 0.5],
  [T_.pay.t0 + 2.8, 0.30, 1500, 470, 0.5],
  [END_T, 0.30, 1500, 470, 0.5],
];
function camState(t) {
  let i = 0; while (i < CAMK.length - 2 && t >= CAMK[i + 1][0]) i++;
  const [t0, z0, x0, y0, s0] = CAMK[i], [t1, z1, x1, y1, s1] = CAMK[Math.min(i + 1, CAMK.length - 1)];
  const u = t1 > t0 ? EZ.io(seg(t, t0, t1)) : 1;
  return { z: Math.exp(lerp(Math.log(z0), Math.log(z1), u)), x: lerp(x0, x1, u), y: lerp(y0, y1, u), s: lerp(s0, s1, u) };
}
const hookCamX = (t) => oldShipX(t) + OSHIP.len / 2 - 150;
function pieceCam(era, t) {
  if (t < G0 + 0.46) return camOf({ z: 5.8, p: [hookCamX(t), -95], to: [W / 2, H * 0.5] });   // the cold open tracks the bow along the wall
  const c = camState(t), dive = lerp(2.4, 1, EZ.o3(seg(t, G1 - 1.0, G1 + 2.0)));
  const sh = Math.sin(seg(t, fm(0.24), fm(0.40)) * Math.PI) * 1.6;   // the frame shakes as the gap closes
  return camOf({ z: c.z * dive, p: [c.x + sh * Math.sin(t * 61), c.y + sh * Math.cos(t * 53)], to: [W / 2, H * c.s] });
}
const ERA_BG = [DR.ground];
const BRIDGES = [];

// ---- a lock lane's static structure: banks, walls with rails, water
function lockLane(L, x0, x1, wallT) {
  const top = L.y - L.wid / 2, bot = L.y + L.wid / 2;
  drWater(-3400, top, 8400, L.wid, { turb: 0, flow: 0.3 });
  ctx.fillStyle = '#12181c'; ctx.fillRect(-3400, top - wallT, x0 + 3400, wallT); ctx.fillRect(x1, top - wallT, 5000 - x1, wallT);
  ctx.fillRect(-3400, bot, x0 + 3400, wallT); ctx.fillRect(x1, bot, 5000 - x1, wallT);
  drConcrete(x0, top - wallT, x1 - x0, wallT); drConcrete(x0, bot, x1 - x0, wallT);
  ctx.strokeStyle = DR.concreteD; ctx.lineWidth = drHair(3);
  for (const ry of [top - wallT * 0.42, top - wallT * 0.58, bot + wallT * 0.42, bot + wallT * 0.58]) { ctx.beginPath(); ctx.moveTo(x0, ry); ctx.lineTo(x1, ry); ctx.stroke(); }
}
function gatePair(x, L, sgn, closed) {          // hinges on the walls; apex points to +x when closed
  const hy = L.wid / 2, len = Math.hypot(hy, L.wid * 0.27), aClosed = Math.atan2(hy, L.wid * 0.27), aOpen = Math.PI * 0.985;
  const a = lerp(aOpen, aClosed, closed);
  drLeaf(x, L.y - hy, 1, a, len, L.wid * 0.07); drLeaf(x, L.y + hy, -1, a, len, L.wid * 0.07);
}

// ---- cutaway panels, drawn in screen space (DEFER) ---------------------------------------------
const fmtInt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function drShipSide(cx, wl, len, hgt, draft) {
  ctx.save();
  ctx.fillStyle = '#1d3b5c'; ctx.strokeStyle = '#6f93b5'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - len / 2, wl - hgt); ctx.lineTo(cx + len / 2 + 14, wl - hgt); ctx.lineTo(cx + len / 2 - 26, wl + draft); ctx.lineTo(cx - len / 2 + 10, wl + draft); ctx.closePath(); ctx.fill(); ctx.stroke();
  const R = RNG('sideboxes');
  for (let x = cx - len / 2 + len * 0.26; x < cx + len / 2 - 20; x += len * 0.032) for (let r = 0; r < 3; r++) { ctx.fillStyle = R.pick(DR.box); ctx.fillRect(x, wl - hgt - (r + 1) * hgt * 0.34, len * 0.03, hgt * 0.32); }
  ctx.fillStyle = '#e8edf1'; ctx.fillRect(cx - len / 2 + len * 0.1, wl - hgt - hgt * 1.15, len * 0.07, hgt * 1.15);
  ctx.restore();
}
// one chamber filling, full width: the counter climbs to 26,000,000 as the water rises under the ship
function cutawayFill(t) {
  const slide = EZ.o3(seg(t, T_.gates.t1 + 0.15, T_.guess.t0)), out = 1 - EZ.o2(seg(t, T_.lift.t0 - 0.45, T_.lift.t0 - 0.05));
  if (slide <= 0 || out <= 0) return;
  const py = lerp(H, 0, slide), u = EZ.io(seg(t, T_.water.t0 + 0.2, fw(0.55))), poolsU = seg(t, fw(0.50), fw(0.97)), guessing = t < T_.water.t0 + 0.2;
  ctx.save(); ctx.globalAlpha = out;
  ctx.beginPath(); ctx.rect(0, py, W, H - py); ctx.clip();
  ctx.fillStyle = '#06101a'; ctx.fillRect(0, py, W, H - py);
  const floor = H - 170, xL = 300, xR = 1620, lo = floor - 250, hi = floor - 560, lv = lerp(lo, hi, u), pyOff = py;
  ctx.translate(0, pyOff);   // the whole panel rides up as one piece
  ctx.fillStyle = DR.water; ctx.fillRect(0, lo, xL, floor - lo); ctx.fillStyle = '#0d3140'; ctx.fillRect(xR, hi, W - xR, floor - hi);
  ctx.fillStyle = '#0f3a4d'; ctx.fillRect(xL, lv, xR - xL, floor - lv);
  ctx.strokeStyle = 'rgba(140,220,240,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xL, lv); ctx.lineTo(xR, lv); ctx.stroke();
  ctx.fillStyle = DR.concrete; ctx.fillRect(0, floor, W, H); ctx.fillStyle = '#06101a'; ctx.fillRect(xL - 10, floor + 36, xR - xL + 20, 26);
  ctx.fillStyle = DR.concreteD; ctx.fillRect(0, hi - 40, 170, 40); ctx.fillRect(W - 170, hi - 40, 170, 40);
  ctx.fillStyle = DR.steel; ctx.fillRect(xL - 14, hi - 30, 28, floor - hi + 30); ctx.fillRect(xR - 14, hi - 30, 28, floor - hi + 30);
  ctx.strokeStyle = 'rgba(120,220,245,0.9)'; ctx.lineWidth = 5; ctx.setLineDash([26, 20]); ctx.lineDashOffset = -(t * 190);
  ctx.globalAlpha = out * (u > 0 && u < 1 ? 1 : 0.2); ctx.beginPath(); ctx.moveTo(xR + 10, floor + 49); ctx.lineTo(xL - 10, floor + 49); ctx.stroke(); ctx.setLineDash([]);
  for (let k = 0; k < 9; k++) {
    const px = xL + 110 + k * (xR - xL - 220) / 8, R = RNG('boil', k);
    for (let b = 0; b < 7; b++) {
      const ph0 = (t * 0.9 + R.f() + b / 7) % 1, by = floor - ph0 * (floor - lv) * 0.92, bx = px + Math.sin(ph0 * 9 + b + k) * 12 * ph0;
      ctx.globalAlpha = out * (u > 0 && u < 1 ? (1 - ph0) * 0.85 : 0); ctx.fillStyle = DR.foam; ctx.beginPath(); ctx.arc(bx, by, 2.5 + ph0 * 5, 0, TAU); ctx.fill();
    }
  }
  ctx.globalAlpha = out;
  drShipSide(960, lv, 900, 92, 50);
  const lab = seg(slide, 0.85, 1);
  drText('SIDE CUTAWAY  ·  ONE CHAMBER', 70, 92, 32, DR.cyan, { track: 3, alpha: 0.9 * lab * out });
  const num = guessing ? Math.floor(RNG('spin', Math.floor(t * 24)).f() * 99999999) : 26e6 * u;   // the counter spins while the viewer guesses
  drText(fmtInt(num), W - 70, 140, 108, guessing ? DR.amber : DR.white, { align: 'right', font: DR_MONO, glow: guessing ? 'rgba(240,168,28,0.6)' : 'rgba(95,227,255,0.6)', blur: 24, alpha: lab * out });
  drText(guessing ? 'GUESS?' : 'GALLONS IN', W - 70, 190, guessing ? 44 : 32, guessing ? DR.amber : DR.cyan, { align: 'right', track: 4, alpha: lab * out * (guessing ? 0.6 + 0.4 * Math.sin(t * 10) : 1) });
  // forty Olympic pools, filled one by one as the voice says it
  const lit = Math.floor(40 * poolsU);
  if (poolsU > 0.01) {
    drText('= ABOUT 40 OLYMPIC POOLS', 70, 236, 24, DR.cyan, { track: 2, alpha: out * seg(poolsU, 0.02, 0.15) });
    for (let i = 0; i < 40; i++) {
      const px = 70 + (i % 4) * 56, py2 = 256 + Math.floor(i / 4) * 33, on = i < lit;
      ctx.fillStyle = on ? '#2b8fb8' : 'rgba(40,70,90,0.35)'; ctx.fillRect(px, py2, 46, 25);
      ctx.strokeStyle = on ? '#bfeaf7' : 'rgba(120,170,190,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(px, py2, 46, 25);
      if (on) { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(px + 3, py2 + k * 5); ctx.lineTo(px + 43, py2 + k * 5); ctx.stroke(); } }
    }
  }
  drText('GRAVITY FED  ·  NO PUMPS', W / 2, floor + 118, 36, DR.white, { align: 'center', track: 4, alpha: seg(t, T_.water.t0 + 0.2, T_.water.t0 + 1.0) * out });
  if (guessing && t > T_.guess.t0) drText('?', 960, 700, 380, DR.amber, { align: 'center', alpha: out * lab * (0.22 + 0.1 * Math.sin(t * 8)), weight: 900 });
  ctx.restore();
}
function cutawayLift(t) {
  const inn = EZ.io(seg(t, T_.lift.t0 - 0.4, T_.lift.t0 + 0.3)), out = 1 - EZ.o2(seg(t, T_.lift.t1 - 0.2, T_.lift.t1 + 0.6));
  if (inn <= 0 || out <= 0) return;
  ctx.save(); ctx.globalAlpha = out * inn;
  ctx.fillStyle = '#06101a'; ctx.fillRect(0, 0, W, H);
  const yb = H * 0.80, dy = H * 0.15, s = EZ.io(seg(t, T_.lift.t0 + 0.2, T_.lift.t1 - 0.1)) * 3;
  const cw = 520, x0 = 150, cx = (k) => x0 + cw * k + cw / 2, pk = (k) => EZ.io(seg(s - k, 0, 0.65));
  const level = (k) => yb - dy * (k + pk(k)), floorY = (k) => yb + 50 - dy * k;
  ctx.fillStyle = DR.water; ctx.fillRect(0, yb, x0, H);
  for (let k = 0; k < 3; k++) {
    const lx = x0 + cw * k, lv = level(k), fl = floorY(k);
    ctx.fillStyle = '#0f3a4d'; ctx.fillRect(lx, lv, cw, fl - lv);
    ctx.strokeStyle = 'rgba(140,220,240,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, lv); ctx.lineTo(lx + cw, lv); ctx.stroke();
    ctx.fillStyle = DR.concrete; ctx.fillRect(lx, fl, cw, H - fl);
    ctx.fillStyle = DR.steel; ctx.fillRect(lx - 11, yb - dy * (k + 1) - 22, 22, fl - (yb - dy * (k + 1) - 22));
  }
  const lakeY = yb - dy * 3, lx0 = x0 + cw * 3;
  ctx.fillStyle = '#0d3140'; ctx.fillRect(lx0, lakeY, W - lx0, floorY(3) - lakeY); ctx.fillStyle = DR.concrete; ctx.fillRect(lx0, floorY(3), W - lx0, H - floorY(3));
  ctx.fillStyle = DR.steel; ctx.fillRect(lx0 - 11, lakeY - 22, 22, floorY(2) - lakeY + 22);
  ctx.fillStyle = DR.concrete; ctx.fillRect(0, yb + 50, x0, H);
  const k = Math.min(2, Math.floor(s)), local = s - k, mv = EZ.io(seg(local, 0.7, 1));
  const sx = lerp(cx(k), k === 2 ? lx0 + 200 : cx(k + 1), mv) + (s >= 3 ? 220 * EZ.o2(seg(s, 3, 3.01)) : 0), sy = local >= 0.7 ? yb - dy * (k + 1) : level(k);
  drShipSide(sx, sy, 330, 40, 22);
  const prog = (pk(0) + pk(1) + pk(2)) / 3;
  drText('GATUN LOCKS  ·  3 STEPS', 70, 110, 44, DR.white, { track: 3 });
  drText('not to scale', 70, 152, 26, DR.cyan, { track: 2, alpha: 0.7 });
  drText('+' + Math.round(85 * prog) + ' FT', W - 70, 134, 120, DR.white, { align: 'right', font: DR_MONO, glow: 'rgba(95,227,255,0.6)', blur: 22 });
  drText('ABOVE SEA LEVEL', W - 70, 180, 30, DR.cyan, { align: 'right', track: 3 });
  ctx.restore();
}

// ---- football fields laid along the chamber: 3.5 fields = 1,050 ft (a field is 300 ft between goal lines)
function fieldsLayer(t) {
  const a0 = seg(t, fb(0.30), fb(0.34)) * (1 - EZ.o2(seg(t, T_.park.t0 + 0.1, T_.park.t0 + 0.7)));
  if (a0 <= 0.001) return;
  const n = [fb(0.36), fb(0.43), fb(0.50), fb(0.57)];
  for (let i = 0; i < 4; i++) {
    const pop = EZ.o3(seg(t, n[i], n[i] + 0.35)); if (pop <= 0) continue;
    const w = i < 3 ? 600 : 300, x = i * 600, y0 = -570, h = 320, off = (1 - pop) * 60;
    ctx.save(); ctx.globalAlpha = a0 * pop;
    ctx.fillStyle = i % 2 ? 'rgba(34,120,66,0.70)' : 'rgba(40,138,76,0.70)'; ctx.fillRect(x + 4, y0 + off, w - 8, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = drHair(3); ctx.strokeRect(x + 4, y0 + off, w - 8, h);
    ctx.lineWidth = drHair(2); ctx.beginPath();
    for (let k = 1; k < (w / 60); k++) { ctx.moveTo(x + k * 60, y0 + off); ctx.lineTo(x + k * 60, y0 + off + h); }
    ctx.stroke();
    ctx.restore();
    drText(i < 3 ? String(i + 1) : '½', x + w / 2, y0 + off + h * 0.66, 190, DR.white, { align: 'center', alpha: 0.9 * a0 * pop });
  }
}

// ---- parallel parking: a 15 ft car beside a 965 ft ship, both to scale
function parkLayer(t) {
  const a = EZ.o2(seg(t, T_.park.t0 + 0.3, T_.park.t0 + 0.9)) * (1 - EZ.o2(seg(t, T_.mules.t0 - 0.5, T_.mules.t0 + 0.1)));
  if (a <= 0.01) return;
  const ox = oldShipX(t), left = ox - OSHIP.len / 2, car = EZ.o3(seg(t, fk(0.30), fk(0.40)));
  ctx.save(); ctx.globalAlpha = a;
  drCar(left + 15 + (1 - car) * -200, -390);
  ctx.restore();
  drDim(left, -330, left + OSHIP.len, -330, 'SHIP  965 FT', { alpha: a * seg(t, fk(0.18), fk(0.28)), size: 24 });
  drTag(left + 15, -390, 'CAR  15 FT', { dy: -52, dx: 60, alpha: a * car, size: 22, color: DR.amber });
}

// ---- the ship against the Eiffel Tower, lying down beside it on the same scale (1,083 ft = 2,166 px, base 410 ft = 820 px)
function eiffelLayer(t) {
  const a = EZ.o2(seg(t, T_.eiffel.t0 + 0.4, T_.eiffel.t0 + 1.2)) * (1 - EZ.o2(seg(t, T_.pay.t0 - 0.2, T_.pay.t0 + 0.3)));
  if (a <= 0.01) return;
  const x0 = 1400 - 1083, yc = 1750, N = 64, hw = (s2) => 410 * Math.pow(1 - s2, 2.4) + 5 * (1 - s2) + 1;
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) { const s2 = i / N; ctx.lineTo(x0 + s2 * 2166, yc - hw(s2)); }
  for (let i = N; i >= 0; i--) { const s2 = i / N; ctx.lineTo(x0 + s2 * 2166, yc + hw(s2)); }
  ctx.closePath(); ctx.fillStyle = 'rgba(240,168,28,0.22)'; ctx.fill(); ctx.strokeStyle = DR.amber; ctx.lineWidth = drHair(4); ctx.stroke();
  ctx.fillStyle = 'rgba(5,8,11,0.92)'; ctx.beginPath(); ctx.ellipse(x0 - 20, yc, 330, 250, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();   // the base arch
  ctx.strokeStyle = DR.amber; ctx.lineWidth = drHair(6);
  for (const s2 of [0.17, 0.35, 0.84]) { ctx.beginPath(); ctx.moveTo(x0 + s2 * 2166, yc - hw(s2)); ctx.lineTo(x0 + s2 * 2166, yc + hw(s2)); ctx.stroke(); }
  ctx.lineWidth = drHair(2); ctx.beginPath();
  for (let k = 0; k < 14; k++) { const s2 = 0.04 + k * 0.065, s3 = s2 + 0.065; ctx.moveTo(x0 + s2 * 2166, yc - hw(s2)); ctx.lineTo(x0 + s3 * 2166, yc + hw(s3)); ctx.moveTo(x0 + s2 * 2166, yc + hw(s2)); ctx.lineTo(x0 + s3 * 2166, yc - hw(s3)); }
  ctx.stroke();
  ctx.restore();
  const dimA = a * seg(t, T_.eiffel.t0 + 0.9, T_.eiffel.t0 + 1.6);
  drDim(200, 1262, 2600, 1262, 'SHIP  1,200 FT', { alpha: dimA, size: 28, dy: -44 });
  drDim(x0, 1310, x0 + 2166, 1310, 'EIFFEL TOWER  1,083 FT', { alpha: dimA * seg(t, T_.eiffel.t0 + 1.6, T_.eiffel.t0 + 2.2), size: 28, color: DR.amber, dy: 44 });
}

// ---- the clearance meter: the gap per side, live
function meterState(t) {
  if (t > 0.4 && t < G0 + 0.3) return { ft: 2.0, max: 2.5, label: 'CLEARANCE PER SIDE', a: seg(t, 0.4, 0.9) * (1 - seg(t, fh(0.98), G0 + 0.3)) * seg(t, fh(0.66), fh(0.74)) };
  const m0 = fm(0.06), m1 = fm(0.80);
  if (t > m0 && t < m1) return { ft: Math.max(0.1, (4 + driftY(t)) / 2), max: 2.5, label: 'CLEARANCE, TOP SIDE', a: seg(t, m0, m0 + 0.4) * (1 - seg(t, m1 - 0.4, m1)), live: true };
  const n0 = fn(0.58), n1 = fn(0.84);
  if (t > n0 && t < n1) return { ft: 6.0, max: 7.0, label: 'CLEARANCE PER SIDE', a: seg(t, n0, n0 + 0.4) * (1 - seg(t, n1 - 0.4, n1)), calm: true };
  return null;
}
function meterLayer(t) {
  const m = meterState(t); if (!m || m.a <= 0.01) return;
  const danger = m.live && m.ft < 0.7, safe = m.live && t > fm(0.54), col = danger ? DR.red : safe ? '#3bff7a' : (m.calm ? DR.cyan : DR.white);
  const pulse = danger ? (0.55 + 0.45 * Math.abs(Math.sin(t * 14))) : 1;
  const f = () => {
    ctx.save(); ctx.globalAlpha = m.a;
    ctx.fillStyle = 'rgba(2,6,10,0.74)'; ctx.beginPath(); ctx.roundRect(W - 540, 50, 480, 190, 12); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = danger ? 26 * pulse : 10; ctx.stroke(); ctx.shadowBlur = 0;
    drText(m.label, W - 510, 92, 24, DR.cyan, { track: 3 });
    drText(m.ft.toFixed(1) + ' FT', W - 510, 176, 92, col, { font: DR_MONO, glow: col, blur: danger ? 24 : 12, alpha: pulse });
    ctx.fillStyle = 'rgba(80,100,115,0.5)'; ctx.fillRect(W - 510, 202, 420, 14);
    ctx.fillStyle = col; ctx.fillRect(W - 510, 202, 420 * clamp(m.ft / m.max), 14);
    if (danger) drText('SCRAPE RISK', W - 570, 150, 40, DR.red, { align: 'right', track: 3, alpha: pulse, glow: 'rgba(255,43,58,0.7)', blur: 18 });
    if (safe) drText('SAFE', W - 570, 150, 40, '#3bff7a', { align: 'right', track: 4 });
    ctx.restore();
  };
  DEFER.push(f);
}

// ---- small life: bird shadows crossing the frame, workers on the walls
function birdsLayer(t) {
  const f = () => {
    const R = RNG('birds');
    for (let i = 0; i < 7; i++) {
      const sp = 90 + R.f() * 80, off = R.f() * (W + 400), by = 120 + R.f() * (H - 240), sc = 0.9 + R.f() * 0.9, ph = R.f() * TAU;
      const x = ((t * sp + off) % (W + 400)) - 200, y = by + 40 * Math.sin(t * 0.5 + ph) + (x - W / 2) * 0.05, flap = Math.sin(t * 13 + ph) * 0.7;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.beginPath(); ctx.ellipse(0, 0, 9, 3.4, 0, 0, TAU); ctx.fill();
      for (const sg of [-1, 1]) { ctx.save(); ctx.rotate(sg * (0.5 + flap * 0.5)); ctx.beginPath(); ctx.ellipse(0, sg * 11, 3.2, 12, 0, 0, TAU); ctx.fill(); ctx.restore(); }
      ctx.restore();
    }
  };
  DEFER.push(f);
}
function workersLayer(t) {
  drWorker(1620 + 10 * (t - 28), -205); drWorker(1800 - 8 * (t - 28), -214);
  drWorker(900 + 9 * (t - 40), 205); drWorker(2000 + 9 * (t - 56), NEO.y + 232);
}

// ---- the scene ----------------------------------------------------------------------------------
function scenePanama() {
  const t = TT, ox = oldShipX(t), nx = neoShipX(t), dy = driftY(t);
  drGround(-3600, -1300, 5000, 2200);
  // ===== lane 1: the original lock
  lockLane(OLD, -700, 2800, 120);
  gatePair(0, OLD, 1, EZ.io(seg(t, T_.gates.t0 + 0.3, T_.gates.t0 + 1.7)));
  gatePair(OLD.len, OLD, 1, 1);
  const speed = Math.abs(oldShipX(t + 0.05) - oldShipX(t - 0.05)) / 0.1;
  drShip(ox, OLD.y + dy, OSHIP.len, OSHIP.beam, { wake: clamp(speed / 200) });
  // the neon gap lines, pulsing from the first second: 2 ft = 4 px each side
  const gapA = EZ.o2(seg(t, 0.3, 1.0));
  drNeon(ox - OSHIP.len / 2 + 30, -108, ox + OSHIP.len / 2 - 40, -108, { alpha: gapA, w: 2.6, ticks: false });
  drNeon(ox - OSHIP.len / 2 + 30, 108, ox + OSHIP.len / 2 - 40, 108, { alpha: gapA, w: 2.6, ticks: false });
  // cold open: ship, lock and gap
  if (t < G0 + 0.5) {
    const cx_ = hookCamX(t), keep = 1 - seg(t, fh(0.80), fh(0.98));
    drTag(cx_, -95, 'SHIP  106 FT', { dy: 170, dx: -160, alpha: seg(t, fh(0.06), fh(0.12)) * keep, size: 26, color: DR.cyan });
    drTag(cx_, -95, 'LOCK  110 FT', { dy: -190, dx: -160, alpha: seg(t, fh(0.36), fh(0.42)) * keep, size: 26, color: DR.cyan });
    const a = seg(t, fh(0.70), fh(0.76));
    drNeon(cx_ + 110, -110, cx_ + 110, -106, { alpha: a, w: 2.6, tick: 26 });
    drTag(cx_ + 110, -108, '2 FT  /  60 CM', { dy: -80, alpha: a, size: 32 });
  }
  // the chamber as football fields, then the car gag
  fieldsLayer(t);
  parkLayer(t);
  workersLayer(t);
  const boxA = EZ.o2(seg(t, fb(0.04), fb(0.12))) * (1 - EZ.o2(seg(t, T_.park.t0 - 0.2, T_.park.t0 + 0.4)));
  if (boxA > 0.01) {
    drDim(0, -640, OLD.len, -640, 'CHAMBER  1,050 FT  =  3.5 FIELDS', { alpha: boxA * seg(t, fb(0.52), fb(0.60)), size: 24 });
    const fit = EZ.o2(seg(t, fb(0.70), fb(0.76))) * (1 - EZ.o2(seg(t, fb(0.95), fb(1.0))));
    if (fit > 0.01) {
      ctx.save(); ctx.globalAlpha = fit * (0.7 + 0.3 * Math.sin(t * 5)); ctx.strokeStyle = DR.cyan; ctx.lineWidth = drHair(3.5); ctx.strokeRect(-6, -116, OLD.len + 12, 232); ctx.restore();
      drTag(1050, -116, 'SHIPS ARE BUILT TO FIT THIS BOX', { dy: -70, alpha: fit, size: 24, color: DR.cyan });
    }
  }
  // mules: they appear after the hull has drifted, and pull it back with cables that glow when they tighten
  const mA = EZ.o2(seg(t, fm(0.34), fm(0.42))) * (1 - EZ.o2(seg(t, T_.gates.t0 - 0.6, T_.gates.t0 - 0.1)));
  if (mA > 0.01) {
    const offs = [-840, -640, 640, 840], ten = clamp(-dy / 3.4);
    for (const sgn of [-1, 1]) for (const [i, o] of offs.entries()) {
      const mx = ox + o, wy = sgn * 148, hy = sgn * 106 + (sgn < 0 ? dy : dy);
      const taut = sgn < 0 ? ten : 0;
      ctx.save(); ctx.globalAlpha = mA;
      drMule(mx, wy, o > 0 ? 1 : -1, { color: DR.amber });
      drCable(mx + (o > 0 ? -22 : 22), wy - sgn * 13, mx + (o > 0 ? -150 : 150), hy, { ph: i * 1.7 + sgn, sag: 2 * (1 - taut), color: taut > 0.08 ? DR.red : '#e9edf0', w: 2.4 + taut * 3 });
      ctx.restore();
    }
  }
  // the demonstration's labels
  const driftA = seg(t, fm(0.14), fm(0.20)) * (1 - seg(t, fm(0.34), fm(0.38)));
  if (driftA > 0.01) drTag(ox + 640, -106, 'HULL DRIFTS TOWARD THE WALL', { dy: 100, alpha: driftA, size: 22, color: DR.red });
  const pullA = seg(t, fm(0.46), fm(0.52)) * (1 - seg(t, fm(0.64), fm(0.70)));
  if (pullA > 0.01) drTag(ox + 640, -110, 'CABLES PULL IT BACK', { dy: 100, alpha: pullA, size: 22, color: DR.amber });
  const muleA = seg(t, fm(0.40), fm(0.46)) * (1 - seg(t, fm(0.62), fm(0.68)));
  if (muleA > 0.01) drTag(ox + 640, -148, 'MULE', { dy: -50, alpha: muleA, size: 24, color: DR.amber });
  drTag(180, 0, 'GATES CLOSE', { dy: -170, alpha: seg(t, T_.gates.t0 + 0.2, T_.gates.t0 + 0.7) * (1 - seg(t, T_.gates.t1 + 0.4, T_.gates.t1 + 0.9)), size: 30, color: DR.cyan });

  // ===== lane 2: the Neopanamax lock
  if (t > T_.neo.t0 - 3) {
    lockLane(NEO, -900, 3700, 140);
    gatePair(0, NEO, 1, 0.0); gatePair(NEO.len, NEO, 1, 1);
    drShip(nx, NEO.y, NSHIP.len, NSHIP.beam, { wake: clamp(Math.abs(neoShipX(t + 0.05) - neoShipX(t - 0.05)) / 0.1 / 200), hull: '#28394d', deck: '#364a5f' });
    // size comparison: the old chamber and the old ship, as amber outlines inside the new chamber
    const ghost = EZ.o2(seg(t, fn(0.36), fn(0.42))) * (1 - EZ.o2(seg(t, fn(0.52), fn(0.58))));
    if (ghost > 0.01) {
      ctx.save(); ctx.globalAlpha = ghost; ctx.setLineDash([24, 14]); ctx.strokeStyle = DR.amber; ctx.lineWidth = drHair(3.5);
      ctx.strokeRect(1400 - OLD.len / 2, NEO.y - 110, OLD.len, 220);
      ctx.beginPath(); ctx.roundRect(1400 - OSHIP.len / 2, NEO.y - OSHIP.beam / 2, OSHIP.len, OSHIP.beam, [24, 120, 120, 24]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      drTag(1400 - OSHIP.len / 2 + 330, NEO.y, 'PANAMAX  965 FT', { alpha: ghost, size: 22, color: DR.amber });
    }
    const sA = EZ.o2(seg(t, fn(0.30), fn(0.36))) * (1 - EZ.o2(seg(t, fn(0.52), fn(0.58))));
    if (sA > 0.01) drTag(nx + 300, NEO.y - 200, 'NEW SHIP  1,200 FT', { alpha: sA, size: 24, color: DR.cyan });
    // the new gap: about 6 ft each side (12 px)
    const gA = EZ.o2(seg(t, fn(0.58), fn(0.64))) * (1 - EZ.o2(seg(t, fn(0.78), fn(0.84))));
    if (gA > 0.01) {
      drNeon(nx - NSHIP.len / 2 + 80, NEO.y - 174, nx + NSHIP.len / 2 - 240, NEO.y - 174, { alpha: gA, w: 2.6, ticks: false });
      drNeon(nx - NSHIP.len / 2 + 80, NEO.y + 174, nx + NSHIP.len / 2 - 240, NEO.y + 174, { alpha: gA, w: 2.6, ticks: false });
      drNeon(2000, NEO.y - 180, 2000, NEO.y - 168, { alpha: gA, w: 2.6, tick: 22 });
      drTag(2000, NEO.y - 174, '6 FT  /  1.9 M', { dy: -80, alpha: gA, size: 32 });
    }
    // tugboats at bow and stern, with cables
    const tugA = EZ.o2(seg(t, fn(0.80), fn(0.86)));
    if (tugA > 0.01) {
      ctx.save(); ctx.globalAlpha = tugA;
      drCable(nx + NSHIP.len / 2 + 6, NEO.y, nx + NSHIP.len / 2 + 62, NEO.y, { ph: 0.4, sag: 1.5 });
      const tw = clamp(Math.abs(neoShipX(t + 0.05) - neoShipX(t - 0.05)) / 0.1 / 200);
      drTug(nx + NSHIP.len / 2 + 105, NEO.y, { rot: 0, wake: tw });
      drCable(nx - NSHIP.len / 2 - 6, NEO.y, nx - NSHIP.len / 2 - 62, NEO.y, { ph: 2.4, sag: 1.5 });
      drTug(nx - NSHIP.len / 2 - 105, NEO.y, { rot: Math.PI, wake: tw });
      ctx.restore();
      drTag(nx + NSHIP.len / 2 + 105, NEO.y, 'TUGBOAT', { dy: -80, alpha: tugA * (1 - seg(t, T_.neo.t1 - 0.2, T_.neo.t1 + 0.3)), size: 26, color: DR.tug });
    }
  }
  eiffelLayer(t);
  // ===== HUD (screen space)
  birdsLayer(t);
  meterLayer(t);
  DEFER.push(() => introGlobe(t));
  hud(t);
  DEFER.push(() => cutawayFill(t)); DEFER.push(() => cutawayLift(t)); DEFER.push(() => endCard(t));
}

function hud(t) {
  const f = () => {
    const b = EZ.o2(seg(t, fb(0.04), fb(0.12))) * (1 - EZ.o2(seg(t, T_.park.t0 - 0.2, T_.park.t0 + 0.3)));
    const b2 = EZ.o2(seg(t, T_.park.t0 + 0.2, T_.park.t0 + 0.8)) * (1 - EZ.o2(seg(t, T_.mules.t0 - 0.5, T_.mules.t0 - 0.1)));
    if (b2 > 0) { drText('PARALLEL PARKING', 70, H - 150, 80, DR.white, { alpha: b2, track: 4 }); drText('BUT THE CAR IS 965 FT LONG', 70, H - 100, 32, DR.cyan, { alpha: b2, track: 5 }); }
    if (b > 0) { drText('ORIGINAL LOCKS', 70, H - 150, 80, DR.white, { alpha: b, track: 4 }); drText('PANAMAX SIZE  ·  1914', 70, H - 100, 32, DR.cyan, { alpha: b, track: 5 }); }
    const c = EZ.o2(seg(t, T_.neo.t0 + 0.4, T_.neo.t0 + 1.0)) * (1 - EZ.o2(seg(t, fn(0.52), fn(0.58))));
    if (c > 0) { drText('NEOPANAMAX', 70, 110, 78, DR.white, { alpha: c, track: 4 }); drText('NEW LOCKS  ·  2016', 70, 156, 32, DR.cyan, { alpha: c, track: 5 }); }
    // payoff: the opening number, then the two feet, then the channel
    const p1 = EZ.o2(seg(t, fp(0.02), fp(0.08))) * (1 - EZ.o2(seg(t, fp(0.46), fp(0.50))));
    if (p1 > 0) { drText('1 SHIP  /  38 MIN', W / 2, H - 120, 86, DR.white, { align: 'center', alpha: p1, track: 6, glow: 'rgba(95,227,255,0.5)', blur: 20 }); }
    const p2 = EZ.o2(seg(t, fp(0.52), fp(0.58))) * (1 - EZ.o2(seg(t, T_.pay.t1 + 0.1, T_.pay.t1 + 0.4)));
    if (p2 > 0) { drText('2 FT AT A TIME', W / 2, H - 120, 86, DR.white, { align: 'center', alpha: p2, track: 6, glow: 'rgba(255,43,58,0.6)', blur: 22 }); }
    // the teaser for the next video
    const tz = EZ.o2(seg(t, T_.teaser.t0, T_.teaser.t0 + 0.4)) * (1 - EZ.o2(seg(t, T_.cta.t0 - 0.1, T_.cta.t0 + 0.2)));
    if (tz > 0) {
      drText('NEXT TIME', W / 2, H - 196, 34, DR.cyan, { align: 'center', alpha: tz, track: 8 });
      drText('WHEN THE LAKE RUNS DRY', W / 2, H - 120, 74, DR.white, { align: 'center', alpha: tz, track: 4 });
      drText('2023 DROUGHT: TRANSITS FELL 20% IN FY2024, TO 11,240', W / 2, H - 70, 26, DR.amber, { align: 'center', alpha: tz * seg(t, T_.teaser.t0 + 1.0, T_.teaser.t0 + 1.6), track: 2 });
    }
    const d = EZ.o2(seg(t, T_.cta.t0, T_.cta.t0 + 0.3)) * (1 - seg(t, END_T - 0.4, END_T));
    if (d > 0) { drText('WORLD IN THE MAKING', W / 2, H - 120, 60, DR.white, { align: 'center', alpha: d, track: 8 }); drText('@WorldInTheMakingStudio', W / 2, H - 74, 28, DR.cyan, { align: 'center', alpha: d, track: 3 }); }
  };
  DEFER.push(f);
}

function endCard(t) {
  if (t < END_T) return;
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);   // a hard cut onto the card
  const s = H; if (!drawAsset('subscribe.jpg', (W - s) / 2, 0, s, s, { fit: 'contain' })) drText('SUBSCRIBE', W / 2, H / 2, 120, DR.white, { align: 'center' });
  ctx.restore();
}
