// =====================================================================
//  ERAS, CAMERAS, BRIDGES — Pheasant Island (read by kit/morph.js)
// =====================================================================
const ERA_BG = [WM.ocean, WM.ocean, WM.ocean, WM.ocean, WM.ocean, WM.ocean, WM.ocean, WM.ocean];
const DEEPC = () => camOf({ z: 9, p: ISLE, to: IC });
function pieceCam(era, t) {
  if (era === 0) {   // Europe -> the pin
    const u = EZ.io(seg(t, VL('open2').t0 + 0.1, M[0] - MD - 0.1));
    return u > 0 ? camMix(CAM0, DEEPC(), u) : null;
  }
  if (era === 4) {   // the ring slides left to make room for the court rules
    const u = EZ.io(seg(t, VL('courts').t0 - 0.2, VL('courts').t0 + 1.0));
    return u > 0 ? camMix(CAM0, camOf({ z: 1, p: IC, to: [620, 540] }), u) : null;
  }
  if (era === 6) {   // the pin, out to three places, back to the pin
    const out = EZ.io(seg(t, M[5] + MD, VL('why').t0 + 1.8)), back = EZ.io(seg(t, VL('why').t1 - 0.5, M[6] - 0.1));
    const wide = camOf({ z: 2.4, p: [1038, 420], to: [960, 560] });
    const a = camMix(DEEPC(), wide, out);
    return camMix(a, DEEPC(), back);
  }
  if (era === 7) {   // a slow push-in on the answer
    const u = EZ.io(seg(t, TIMELINE.cues.payoff, DURATION));
    return u > 0 ? camMix(CAM0, camOf({ z: 1.06, p: IC, to: IC }), u) : null;
  }
  return null;
}
const RING_SHAPE = () => ({ P: ellipsePts(IC[0], IC[1], 300, 300, 0, 72), c: WM.gold });
const BRIDGES = [
  { tc: M[0], A: () => ({ P: DOT, c: WM.gold }), B: ISL_SHAPE },     // the pin becomes the island
  { tc: M[1], A: ISL_SHAPE, B: ISL_SHAPE },                           // the island becomes the treaty island
  { tc: M[2], A: ISL_SHAPE, B: ISL_SHAPE },
  { tc: M[3], A: ISL_SHAPE, B: RING_SHAPE },                          // the island becomes the calendar ring
  { tc: M[4], A: RING_SHAPE, B: ISL_SHAPE },                          // the ring shrinks to the island
  { tc: M[5], A: ISL_SHAPE, B: () => ({ P: DOT, c: WM.gold }) },      // the island joins the map
  { tc: M[6], A: () => ({ P: DOT, c: WM.gold }), B: ISL_SHAPE },      // and back
];
