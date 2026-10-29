
// =====================================================================
//  CAMERAS AND ERAS — read by kit/morph.js. Every era is a hard cut (BRIDGES = []).
//  pieceCam(era, t): a push-in on the satellite map: the map's point p lands on the screen point `to`.
//  The lowest point (Zuidplaspolder) is zoomed to after the cold open; the Delta Works zoom to Zeeland.
// =====================================================================
const ERA_BG = [DC.night, DC.sky, DC.sky, DC.sky, DC.sea, DC.night, DC.sea, DC.paper, DC.water, DC.paper, DC.night];
function pieceCam(era, t) {
  if (era === 0) return push(t, 0, EB[1], { z: 1.35, p: dcXY(5.2, 52.2), to: [W * 0.5, H * 0.5] });
  if (era === 1) return push(t, EB[1], EB[1] + 4.5, { z: 6.5, p: dcXY(DC_LOW[0], DC_LOW[1]), to: [W * 0.5, H * 0.5] });
  if (era === 6) return push(t, EB[6], EB[6] + 5, { z: 3.0, p: dcXY(3.95, 51.72), to: [W * 0.5, H * 0.5] });
  return null;
}
const BRIDGES = [];
