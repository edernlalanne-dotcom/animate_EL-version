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
  const t = 2.4, b = 1.6, top = base + ELEM_H, zh = ELEM_W / 2;
  m3Box([x - t / 2, top - b, -zh], [x + t / 2, top, zh], col);
  m3Box([x - t / 2, base, -zh], [x + t / 2, base + b, zh], col);
  m3Box([x - t / 2, base, -zh], [x + t / 2, top, -zh + b], col);
  m3Box([x - t / 2, base, zh - b], [x + t / 2, top, zh], col);
}


// ---- 0. Teaser (0:00): the train inside the tube, followed closely, before any question is asked
function sceneHook() {
  m3Begin();
  const tx = lerp(-690, -330, EZ.io(seg(TT, cu.hook - 0.5, cu.open - 0.2)));
  m3Look([tx - 110, 46, -95], [tx + 30, -56, 0]);
  m3Water(0.14);
  for (let i = 0; i < LENS.length; i++) m3Element(i, TUBE_BASE, 0.3);
  m3Box([tx - 30, TUBE_BASE + 0.2, -1.6], [tx + 30, TUBE_BASE + 3.6, 1.6], M3.greyL);
  m3Box([tx + 30, TUBE_BASE + 1.2, -1.2], [tx + 31, TUBE_BASE + 2.4, 1.2], M3.amber);
  m3Flush(['#17395c', '#0b1d33']);
}

// ---- 1. Istanbul from the air (0:04): the two shores and the route of the tube
function sceneAerial() {
  m3Begin();
  m3Camera([[cu.open - 0.1, -1750, 2150, -1550, -260, 0, 0], [cu.ask - 0.1, -1150, 1150, -1050, -200, 0, 0]]);
  m3Land(); m3City(); m3Water(0.55);
  const r = seg(TT, cu.open, cu.ask + 1);
  m3Line([[-700, 2, 0], [lerp(-700, 700, EZ.io(r)), 2, 0]], M3.amber, 4);   // the route of the tube
  m3Text([-640, LAND_TOP + 6, -300], 'Europe', M3.text, 44, 0, 0);
  m3Text([560, LAND_TOP + 6, 300], 'Asia', M3.text, 44, 0, 0);
  m3Flush(['#17395c', '#0b1d33']);
}

// ---- 2. Challenge one (0:08): 60 m down, the height of a 20-storey tower
function sceneDepth() {
  m3Begin();
  m3Camera([[cu.ask - 0.1, -830, 240, -700, 180, -40, -60], [cu.window - 0.1, -560, 60, -520, 200, -30, -60]]);
  m3Land(); m3Water(0.25);
  const rp = spring(TT, cu.deep - 0.2, { k: 110, damp: 0.85 });
  if (TT >= cu.deep - 0.2) {
    m3Line([[250, 0, -40], [250, lerp(0, FLOOR, rp), -40]], M3.amber, 6);     // the depth gauge in the strait
    for (let d = 10; d <= 60; d += 10) if (d / 60 <= rp + 1e-3) m3Line([[236, -d, -40], [264, -d, -40]], M3.text, 3);
    if (rp > 0.95) m3Text([250, FLOOR, -40], '60 m', M3.amber, 52, 22, 0);
  }
  // the tower on the Asian shore, 60 m tall, with a line for each storey
  const tw = spring(TT, cu.deep, { k: 90, damp: 0.8 });
  m3Box([400, LAND_TOP, -70], [430, LAND_TOP + 60 * tw, -40], M3.greyL);
  if (tw > 0.95) {
    for (let k = 1; k < 20; k++) m3Line([[400, LAND_TOP + 3 * k, -70], [430, LAND_TOP + 3 * k, -70]], M3.grey, 2);
    m3Text([430, LAND_TOP + 60, -55], '20 storeys', M3.text, 44, 18, 0);
  }
  m3Flush(['#0f3550', '#06192b']);
  m3Caption('Challenge one: 60 m, the height of a 20-storey tower', cu.ask + 0.3, cu.window - 0.1);
}

// ---- 3. Challenge two (0:15): the current, under 3 knots
function sceneCurrent() {
  m3Begin();
  m3Camera([[cu.window - 0.1, -300, -6, -610, 0, -24, -60], [cu.cast - 0.1, -190, -8, -330, 0, -24, -20]]);
  m3Water(0.25);
  for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) {
    const x = -200 + k * 130, y = -12 - j * 14, z0 = -360 + (((TT - cu.window) * 45 + j * 220 + k * 70) % 700);
    m3Arrow([x, y, z0], [x, y, z0 + 110], M3.turq, 6);
  }
  m3Flush(['#0f3550', '#06192b']);
  m3Caption('Challenge two: a current, under 3 knots', cu.window + 0.2, cu.cast - 0.1);
}

// ---- 4. Manufacture (0:19): a section beside a bus and a football pitch, for scale
function sceneCast() {
  m3Begin();
  m3Camera([[cu.cast - 0.1, -1330, 90, -520, -1200, -4, 0], [cu.tow - 0.1, -1260, 70, -420, -1200, -4, 0]]);
  m3Box([-1600, -40, -300], [-900, -6, 300], M3.greyD);                     // the dock floor
  m3Box([-1600, -6, 300], [-900, 14, 312], M3.grey);
  m3Box([-1600, -6, -312], [-900, 14, -300], M3.grey);
  m3Box([-912, -6, -300], [-900, 14, 300], M3.grey);
  m3Box([-1600, -6, -300], [-1588, 14, 300], M3.grey);
  const base = lerp(-5 + 120, -5, spring(TT, cu.cast + 0.4, { k: 110, damp: 0.8 }));   // the section is lifted into place
  m3Box([-1267.5, base, -7.65], [-1132.5, base + ELEM_H, 7.65], M3.greyL);
  const pitch = spring(TT, cu.cast + 1.5, { k: 110, damp: 0.85 });
  if (pitch > 0.01) {
    m3Box([-1252.5, -5.95, -34], [-1147.5, -5.85, 34], M3.amber, 0.35 * pitch);   // the pitch, 105 m
    m3Line([[-1252.5, -5.7, -34], [-1147.5, -5.7, -34], [-1147.5, -5.7, 34], [-1252.5, -5.7, 34], [-1252.5, -5.7, -34]], M3.amber, 4);
  }
  m3Box([-1230, -6, -22], [-1218, -2.8, -19.4], M3.grey);                    // a bus, 12 m long
  if (TT > cu.cast + 2) {
    m3Text([-1132.5, base + ELEM_H, 7.65], '135 m', M3.amber, 48, 14, -16);
    m3Text([-1147.5, -5.7, 34], '105 m pitch', M3.text, 40, 10, 10);
    m3Text([-1218, -2.8, -19.4], '12 m bus', M3.text, 36, 10, -10);
  }
  m3Flush(['#17395c', '#0b1d33']);
  m3Caption('a section is longer than a football pitch', cu.cast + 4.2, cu.tow - 0.1);
}

// ---- 5. Transport (0:25): a tug pulls a section to the strait
function sceneTow() {
  m3Begin();
  const zc = lerp(-520, 0, EZ.io(seg(TT, cu.tow, cu.trench - 0.3)));
  m3Camera([[cu.tow - 0.1, -330, 120, -800, 0, -6, -520], [cu.trench - 0.3, -260, 80, -210, 0, -6, -20]]);
  m3Water(0.25);
  m3Seabed(SEABED);
  m3Box([-67.5, -4, zc - ELEM_W / 2], [67.5, 4.75, zc + ELEM_W / 2], M3.greyL);   // floating, low in the water
  m3Box([-30, -3, zc + 125], [30, 4, zc + 175], M3.greyD);                       // a tug, pulling
  m3Box([-14, 4, zc + 140], [14, 11, zc + 160], M3.amber);
  m3Line([[0, 2, zc + ELEM_W / 2], [0, 2, zc + 125]], M3.text, 3);
  m3Flush(['#0f3550', '#06192b']);
}

// ---- 6. Trench (0:28): a close cross-section, the trench is dredged 14 m below the seabed
function sceneTrench() {
  m3Begin();
  const dredge = EZ.io(seg(TT, cu.trench, cu.trench + 3));
  m3Camera([[cu.trench - 0.1, -175, -30, -4, -120, -42, 0], [cu.sink - 0.1, -175, -32, 6, -120, -44, 0]]);
  const top = lerp(SEABED, FLOOR, dredge);
  m3Seabed(top, -125, -115, -200, 200);
  m3Water(0.2, -125, -115, -200, 200);
  if (TT > cu.trench + 3) m3Text([-120, FLOOR, -16], '14 m', M3.amber, 52, 18, 0);
  m3Flush(['#0f3550', '#06192b']);
}

// ---- 7. Sink (0:32): the section is lowered slowly, its tanks take in water
function sceneSink() {
  m3Begin();
  m3Camera([[cu.sink - 0.1, -175, -28, 0, -120, -40, 0], [cu.bed - 0.1, -175, -34, 8, -120, -46, 0]]);
  m3Seabed(FLOOR, -125, -115, -200, 200);
  m3Water(0.2, -125, -115, -200, 200);
  const base = lerp(40, TUBE_BASE, EZ.io(seg(TT, cu.sink, cu.bed - 0.3)));    // lowered on its cables
  m3Box([JOINT, base, -ELEM_W / 2], [JOINT + LENS[5], base + ELEM_H, ELEM_W / 2], M3.greyL);
  if (TT >= cu.sink && TT < cu.bed + 0.5) for (const z of [-5, 5]) m3Arrow([JOINT + 40, base + 16, z], [JOINT + 40, base + ELEM_H + 0.5, z], M3.amber, 6);
  if (TT > cu.sink + 1) m3Text([JOINT + 40, base + 17, 6], 'tanks take in water', M3.amber, 40, 14, -10);
  m3Flush(['#0f3550', '#06192b']);
}

// ---- 8. Bed (0:37): gravel is levelled, then grout fills the gaps under the tube
function sceneBed() {
  m3Begin();
  m3Camera([[cu.bed - 0.1, -175, -46, 14, -120, -56, 0], [cu.seal - 0.1, -175, -50, 20, -120, -56, 0]]);
  m3Seabed(FLOOR, -125, -115, -200, 200);
  m3Water(0.2, -125, -115, -200, 200);
  m3Box([JOINT, TUBE_BASE, -ELEM_W / 2], [JOINT + LENS[5], TUBE_BASE + ELEM_H, ELEM_W / 2], M3.greyL);
  const g = spring(TT, cu.bed, { k: 120, damp: 0.85 });
  m3Box([JOINT, FLOOR, -18], [JOINT + LENS[5], FLOOR + 1.5 * g, 18], M3.greyL);   // the gravel bed
  if (TT >= cu.bed + 1.5) for (const z of [-8, 8]) m3Arrow([JOINT + 60, FLOOR + 0.3, z], [JOINT + 60, TUBE_BASE - 0.6, z], M3.amber, 6);   // the grout
  if (TT > cu.bed + 0.5) m3Text([-120, FLOOR + 0.8, 16], 'gravel', M3.text, 40, 16, 0);
  if (TT > cu.bed + 2) m3Text([JOINT + 60, FLOOR + 0.2, 10], 'grout', M3.amber, 40, 14, 0);
  m3Flush(['#0f3550', '#06192b']);
}

// ---- 9. Joint (0:41): the gasket seals the join, then the water is pumped out
function sceneSeal() {
  m3Begin();
  m3Camera([[cu.seal - 0.1, 40, 55, 45, -55, -52, 0], [cu.connect - 0.1, 30, 40, 40, -55, -52, 0]]);
  m3Water(0.12);
  const x4 = lerp(XS[4] + 25, XS[4], EZ.io(seg(TT, cu.seal, cu.seal + 4)));  // the neighbour slides in to meet the joint
  m3Element(4, TUBE_BASE, 0.5, x4);
  m3Element(5, TUBE_BASE, 0.5);
  if (TT >= cu.seal + 2.5) m3Gasket(JOINT, TUBE_BASE);
  if (TT >= cu.seal + 3.5) m3Text([JOINT, TUBE_BASE + ELEM_H + 3, 0], 'gasket', M3.amber, 40, 14, 0);
  if (TT >= cu.seal + 2.5) for (let k = 0; k < 3; k++) {
    const x0 = JOINT - 5 - (((TT - cu.seal - 2.5) * 30 + k * 40) % 120);
    m3Arrow([x0, TUBE_BASE + 2, 0], [x0 - 30, TUBE_BASE + 2, 0], M3.amber, 6);   // the water leaves
  }
  m3Flush(['#0f3550', '#06192b']);
}

// ---- 10. Shores (0:45): land cut away, the bored tunnel runs into the hill
function sceneConnect() {
  m3Begin();
  m3Camera([[cu.connect - 0.1, -760, 90, -330, -900, -40, 0], [cu.end - 0.1, -820, 110, -250, -1000, -40, 0]]);
  m3Land(0.25); m3Water(0.12);
  for (let i = 0; i < LENS.length; i++) m3Element(i, TUBE_BASE);
  const yc = TUBE_BASE + ELEM_H / 2, g = EZ.io(seg(TT, cu.connect, cu.connect + 4));
  if (TT >= cu.connect) {
    m3Tube([XS[0] - 1.5, yc, 0], [XS[0] + 1.5, yc, 0], 9, M3.amber, 1, 16);                          // the west collar
    m3Tube([XS[10] + LENS[10] - 1.5, yc, 0], [XS[10] + LENS[10] + 1.5, yc, 0], 9, M3.amber, 1, 16);  // the east collar
    m3Tube([XS[0], yc, 0], m3Lerp([XS[0], yc, 0], [-1450, -30, 0], g), 7, M3.turq, 1);               // west bored tunnel
    m3Tube([XS[10] + LENS[10], yc, 0], m3Lerp([XS[10] + LENS[10], yc, 0], [1450, -30, 0], g), 7, M3.turq, 1);   // east bored tunnel
  }
  if (TT > cu.connect + 2.5) m3Text([-1000, -30, 0], 'bored tunnel', M3.text, 40, 14, -26);
  m3Flush(['#17395c', '#0b1d33']);
}

// ---- 11. Finish (0:49): the train runs through the tube, the camera follows it
function sceneEnd() {
  m3Begin();
  const tx = lerp(-640, 640, EZ.io(seg(TT, cu.end + 0.3, cu.title - 0.4)));
  m3Look([tx - 150, 60, -110], [tx + 40, -56, 0]);
  m3Land(0.12); m3Water(0.14);
  for (let i = 0; i < LENS.length; i++) m3Element(i, TUBE_BASE, 0.3);
  m3Box([tx - 30, TUBE_BASE + 0.2, -1.6], [tx + 30, TUBE_BASE + 3.6, 1.6], M3.greyL);
  m3Box([tx + 30, TUBE_BASE + 1.2, -1.2], [tx + 31, TUBE_BASE + 2.4, 1.2], M3.amber);
  m3Flush(['#17395c', '#0b1d33']);
  m3Caption('1,387 m, Europe to Asia', cu.end + 0.3, cu.title - 0.1);
}

// ---- 12. Title (0:55): the name, on the navy ground
function sceneTitle() {
  m3Begin();
  m3Flush(['#17395c', '#0b1d33']);
  const a = clamp(spring(TT, cu.title, { k: 100, damp: 0.9 }));
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = M3.text; ctx.font = `600 150px ${SANS}`; ctx.fillText('Marmaray', W / 2, H / 2 - 20);
  ctx.fillStyle = M3.amber; ctx.fillRect(W / 2 - 160, H / 2 + 60, 320, 4);
  ctx.restore();
}
