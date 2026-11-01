// =====================================================================
//  CAMERA — one follow camera on the sheet. Eras: a single one. No bridges.
// =====================================================================
const ERA_BG = [PAL.paper];
const BRIDGES = [];
function pieceCam() {
  setIso(ISOB);
  const hs = heroState(), z = keyTrack(ZKEYS, 1.0) * 1.38;
  const fx = hs.x + camLead(), fy = 0, fz = 80;
  return camOf({ z, p: isoP([fx, fy, fz]), to: [500, 985] });
}
