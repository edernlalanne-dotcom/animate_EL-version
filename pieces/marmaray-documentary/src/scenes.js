// =====================================================================
//  SCENES — the Marmaray documentary. One concept per scene, cut on the voice-over.
//  Geometry is in metres: X east (Europe is west of the strait, Asia east), Y up (sea surface Y = 0), Z north.
//  Scale: a section is 135 m long and 15.3 m wide, the immersed tube is 1,387 m end to end.
// =====================================================================
const SEAX = [-350, 350];                        // the strait, west shore to east shore
const LAND_TOP = 15, SEABED = -46, FLOOR = -60;  // natural seabed; the trench floor is 14 m lower than the seabed
const TUBE_BASE = FLOOR + 1.5;                   // the tube sits on 1.5 m of gravel
const ELEM_H = 8.75, ELEM_W = 15.3;
const LENS = [98.5, 135, 135, 135, 135, 135, 135, 135, 135, 98.5, 110];   // eleven elements, 1,387 m
const XS = [];                                   // the west end of each element
{ let x = -693.5; for (const L of LENS) { XS.push(x); x += L; } }
const JOINT = XS[5];                             // where the sinking section meets its neighbour

// a seeded layout for the buildings on each shore
let M3_SEED = 11;
const m3Rnd = () => (M3_SEED = (M3_SEED * 16807) % 2147483647) / 2147483647;
const CITY = [];
for (let i = 0; i < 300; i++) {
  const side = i % 2 ? 1 : -1;
  CITY.push({ x: side * (360 + m3Rnd() * 300), z: (m3Rnd() * 2 - 1) * 900, w: 18 + m3Rnd() * 30, d: 18 + m3Rnd() * 30, h: 8 + m3Rnd() * m3Rnd() * 70 });
}

// ---- the parts of the world
function m3Land(a = 1) {
  m3Box([-2000, -70, -1300], [SEAX[0], LAND_TOP, 1300], M3.grey, a);
  m3Box([SEAX[1], -70, -1300], [2000, LAND_TOP, 1300], M3.grey, a);
}
function m3City(a = 1) {
  for (const b of CITY) m3Box([b.x - b.w / 2, LAND_TOP, b.z - b.d / 2], [b.x + b.w / 2, LAND_TOP + b.h, b.z + b.d / 2], M3.greyL, a);
}
function m3Water(a, x0 = SEAX[0], x1 = SEAX[1], z0 = -1300, z1 = 1300) {
  m3Box([x0, FLOOR - 10, z0], [x1, 0, z1], M3.turq, a);
}
// the seabed: two shelves either side of a trench, and the trench floor between them (top = its height)
function m3Seabed(top, x0 = SEAX[0], x1 = SEAX[1], z0 = -1300, z1 = 1300) {
  const TR = 20;
  m3Box([x0, -70, z0], [x1, SEABED, -TR], M3.greyD);
  m3Box([x0, -70, TR], [x1, SEABED, z1], M3.greyD);
  m3Box([x0, -70, -TR], [x1, top, TR], M3.greyD);
}
function m3Element(i, base, a = 1, x0 = XS[i]) {
  m3Box([x0, base, -ELEM_W / 2], [x0 + LENS[i], base + ELEM_H, ELEM_W / 2], M3.greyL, a);
}
// the four bars of a gasket frame on a joint face at x
function m3Gasket(x, base, col = M3.amber) {
  const t = 1.2, top = base + ELEM_H, zh = ELEM_W / 2;
  m3Box([x - t / 2, top - 0.9, -zh], [x + t / 2, top, zh], col);
  m3Box([x - t / 2, base, -zh], [x + t / 2, base + 0.9, zh], col);
  m3Box([x - t / 2, base, -zh], [x + t / 2, top, -zh + 0.9], col);
  m3Box([x - t / 2, base, zh - 0.9], [x + t / 2, top, zh], col);
}

// ---- 1. Istanbul from the air: the strait between two shores
function sceneAerial() {
  m3Begin();
  m3Camera([[0, -1750, 2150, -1550, -260, 0, 0], [cu.ask + 2.5, -1150, 1150, -1050, -200, 0, 0], [cu.deep - 0.1, -830, 380, -700, -120, -10, 0]]);
  m3Land(); m3City(); m3Water(0.55);
  const r = seg(TT, cu.ask, cu.ask + 6);
  m3Line([[-700, 2, 0], [lerp(-700, 700, EZ.io(r)), 2, 0]], M3.amber, 3);   // the route of the tube
  if (TT > cu.ask + 1) m3Arrow([0, 260, 0], [0, 26, 0], M3.amber, 4);       // the crossing
  m3Flush(['#17395c', '#0b1d33']);
  m3Caption('Istanbul, split by the Bosphorus', cu.open + 0.3, cu.ask + 2.5);
  m3Caption('a railway under the sea', cu.ask + 2.5, cu.deep - 0.1);
}

// ---- 2. Two challenges under the water: depth, then current
function sceneChallenge() {
  m3Begin();
  m3Camera([[cu.deep - 0.1, -830, 240, -700, 180, -40, -60], [cu.window + 1, -430, -20, -860, 0, -40, -40], [cu.cast - 0.1, -200, -8, -820, 0, -40, 0]]);
  m3Water(0.25);
  const rp = spring(TT, cu.deep, { k: 110, damp: 0.85 });
  if (TT >= cu.deep) {
    m3Line([[250, 0, -40], [250, lerp(0, FLOOR, rp), -40]], M3.amber, 4);   // a depth gauge in the strait
    for (let d = 10; d <= 60; d += 10) if (d / 60 <= rp + 1e-3) m3Line([[240, -d, -40], [260, -d, -40]], M3.text, 2);
    if (rp > 0.95) m3Text([250, FLOOR, -40], '60 m', M3.amber, 40, 18, 0);
  }
  if (TT >= cu.window) {                                                    // the current, one line of arrows at a time
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) {
      const x = -200 + k * 130, y = -12 - j * 14, z0 = -360 + (((TT - cu.window) * 45 + j * 220 + k * 70) % 700);
      m3Arrow([x, y, z0], [x, y, z0 + 110], M3.turq, 4);
    }
  }
  m3Flush(['#0f3550', '#06192b']);
  m3Caption('Challenge one: depth, about 60 meters', cu.deep + 0.2, cu.window - 0.1);
  m3Caption('Challenge two: a current, under 3 knots', cu.window + 0.2, cu.cast - 0.1);
}

// ---- 3. Manufacture: a section cast in a dry dock, next to a football pitch
function sceneCast() {
  m3Begin();
  m3Camera([[cu.cast - 0.1, -1480, 170, -820, -1200, -4, 0], [cu.tow - 0.1, -1040, 90, -640, -1200, -4, 0]]);
  m3Box([-1600, -40, -300], [-900, -6, 300], M3.greyD);                     // the dock floor
  m3Box([-1600, -6, 300], [-900, 14, 312], M3.grey);
  m3Box([-1600, -6, -312], [-900, 14, -300], M3.grey);
  m3Box([-912, -6, -300], [-900, 14, 300], M3.grey);
  m3Box([-1600, -6, -300], [-1588, 14, 300], M3.grey);
  const base = lerp(-5 + 120, -5, spring(TT, cu.cast + 0.5, { k: 110, damp: 0.8 }));   // the section is lifted into place
  m3Element(5, base, 1, -1267.5);
  if (TT > cu.cast + 4) {                                                   // a football pitch, 105 m long, for scale
    const x0 = -1252.5, x1 = -1147.5;
    m3Line([[x0, -5.7, -34], [x1, -5.7, -34], [x1, -5.7, 34], [x0, -5.7, 34], [x0, -5.7, -34]], M3.amber, 4);
  }
  m3Flush(['#17395c', '#0b1d33']);
  m3Caption('eleven sections, cast in a dry dock', cu.cast + 0.3, cu.cast + 4.5);
  m3Caption('one section is longer than a football pitch', cu.cast + 4.6, cu.tow - 0.1);
}

// ---- 4. Transport: the section floats out, two tugs bring it to the strait
function sceneTow() {
  m3Begin();
  const zc = lerp(-640, 0, EZ.io(seg(TT, cu.tow, cu.trench - 0.3)));   // the section's centre, moving north to south
  m3Camera([[cu.tow - 0.1, -420, 150, -900, 0, -6, -600], [cu.trench - 0.3, -330, 90, -200, 0, -6, -20]]);
  m3Water(0.25);
  m3Seabed(SEABED);
  m3Box([-67.5, -4, zc - ELEM_W / 2], [67.5, 4.75, zc + ELEM_W / 2], M3.greyL);   // floating, low in the water
  m3Box([-30, -3, zc + 125], [30, 4, zc + 175], M3.greyD);                       // a tug, ahead, pulling
  m3Box([-14, 4, zc + 140], [14, 11, zc + 160], M3.amber);
  m3Line([[0, 2, zc + ELEM_W / 2], [0, 2, zc + 125]], M3.text, 2);              // the tow line
  m3Flush(['#0f3550', '#06192b']);
  m3Caption('tested, then towed to the strait', cu.tow + 0.3, cu.trench - 0.1);
}

// ---- 5. Trench, sinking and bed: a cross-section through the strait, looking along the tube
function sceneTrench() {
  m3Begin();
  const dredge = EZ.io(seg(TT, cu.trench, cu.trench + 4));
  const top = lerp(SEABED, FLOOR, dredge);
  m3Camera([[cu.trench - 0.1, -640, -14, 0, -120, -40, 0], [cu.bed + 6, -560, -30, 70, -120, -48, 0]]);
  const SX = [-125, -115];                                                  // the cut: a thin slice of the strait
  m3Seabed(top, SX[0], SX[1], -200, 200);
  m3Water(0.2, SX[0], SX[1], -200, 200);
  const base = lerp(40, TUBE_BASE, EZ.io(seg(TT, cu.sink, cu.bed)));         // the section is lowered on its cables
  m3Box([JOINT, base, -ELEM_W / 2], [JOINT + LENS[5], base + ELEM_H, ELEM_W / 2], M3.greyL);
  if (TT >= cu.sink && TT < cu.bed + 2) for (const z of [-5, 5]) m3Arrow([JOINT + 40, base + 14, z], [JOINT + 40, base + ELEM_H + 0.5, z], M3.amber, 4);   // tanks take in water
  if (TT >= cu.bed) {
    const g = spring(TT, cu.bed, { k: 120, damp: 0.85 });
    m3Box([JOINT, FLOOR, -18], [JOINT + LENS[5], FLOOR + 1.5 * g, 18], M3.greyL);   // the gravel bed
    if (TT >= cu.bed + 2) for (const z of [-8, 8]) m3Arrow([JOINT + 60, FLOOR + 0.3, z], [JOINT + 60, TUBE_BASE - 0.6, z], M3.amber, 4);   // grout
  }
  m3Flush(['#0f3550', '#06192b']);
  m3Caption('a trench dredged about 14 meters down', cu.trench + 0.3, cu.sink - 0.1);
  m3Caption('lowered slowly as its tanks take in water', cu.sink + 0.3, cu.bed - 0.1);
  m3Caption('gravel bed, then grout under the tube', cu.bed + 0.3, cu.seal - 0.1);
}

// ---- 6. The joint: gaskets seal the join, then the water is pumped out
function sceneSeal() {
  m3Begin();
  m3Camera([[cu.seal - 0.1, -300, 40, -200, -60, -52, 0], [cu.connect - 0.1, -230, -10, -90, -70, -56, 0]]);
  m3Water(0.12);
  const x4 = lerp(XS[4] + 25, XS[4], EZ.io(seg(TT, cu.seal, cu.seal + 6)));  // the neighbour slides in to meet the joint
  m3Element(4, TUBE_BASE, 0.35, x4);
  m3Element(5, TUBE_BASE, 0.35);
  if (TT >= cu.seal + 5) m3Gasket(JOINT, TUBE_BASE);
  if (TT >= cu.seal + 8) for (let k = 0; k < 3; k++) {
    const x0 = JOINT - 5 - (((TT - cu.seal - 8) * 30 + k * 40) % 120);
    m3Arrow([x0, TUBE_BASE + 2, 0], [x0 - 30, TUBE_BASE + 2, 0], M3.amber, 4);   // the water leaves
  }
  m3Flush(['#0f3550', '#06192b']);
  m3Caption('rubber gaskets seal each joint', cu.seal + 4, cu.seal + 8.5);
  m3Caption('then the water is pumped out', cu.seal + 8.6, cu.connect - 0.1);
}

// ---- 7. The shores: the tube ends link to bored tunnels that run into the land
function sceneConnect() {
  m3Begin();
  m3Camera([[cu.connect - 0.1, -1150, 720, -1250, -693, -40, 0], [cu.end - 0.1, -1380, 520, -760, -693, -45, 0]]);
  m3Land(0.2); m3Water(0.12);
  for (let i = 0; i < LENS.length; i++) m3Element(i, TUBE_BASE);
  const yc = TUBE_BASE + ELEM_H / 2, g = EZ.io(seg(TT, cu.connect, cu.connect + 6));
  if (TT >= cu.connect) {
    m3Tube([XS[0] - 1.5, yc, 0], [XS[0] + 1.5, yc, 0], 8, M3.amber, 1, 16);                    // the west collar
    m3Tube([XS[10] + LENS[10] - 1.5, yc, 0], [XS[10] + LENS[10] + 1.5, yc, 0], 8, M3.amber, 1, 16); // the east collar
    m3Tube([XS[0], yc, 0], m3Lerp([XS[0], yc, 0], [-1450, -30, 0], g), 4.5, M3.turq, 1);           // west bored tunnel
    m3Tube([XS[10] + LENS[10], yc, 0], m3Lerp([XS[10] + LENS[10], yc, 0], [1450, -30, 0], g), 4.5, M3.turq, 1);   // east bored tunnel
  }
  m3Flush(['#17395c', '#0b1d33']);
  m3Caption('bored tunnels carry the line into each shore', cu.connect + 0.3, cu.end - 0.1);
}

// ---- 8. The finish: a cross-section of the whole tube, and a train crossing under the water
function sceneEnd() {
  m3Begin();
  m3Camera([[cu.end - 0.1, -980, 240, -860, -200, -70, 0], [DURATION - 0.3, -330, 120, -640, 200, -70, 0]]);
  m3Land(0.18); m3Water(0.2);
  for (let i = 0; i < LENS.length; i++) m3Element(i, TUBE_BASE, 0.3);
  if (TT > cu.end + 1) {
    const tx = lerp(-640, 640, EZ.io(seg(TT, cu.end + 1, DURATION - 2)));
    m3Box([tx - 30, TUBE_BASE + 0.2, -1.6], [tx + 30, TUBE_BASE + 3.6, 1.6], M3.greyL);   // the train, inside the tube
    m3Box([tx + 30, TUBE_BASE + 1.2, -1.2], [tx + 31, TUBE_BASE + 2.4, 1.2], M3.amber);     // its lamp
  }
  m3Flush(['#17395c', '#0b1d33']);
  m3Caption('1,387 meters, Europe to Asia', cu.end + 0.3, DURATION);
}
