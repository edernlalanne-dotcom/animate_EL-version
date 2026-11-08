// =====================================================================
//  ERAS, CAMERAS — hard cuts between the six stages (BRIDGES empty); per-scene cameras in scenes.js
//  Portrait (9:16): each scene has a wide camera that frames its action in a 1080-wide window of the world: [zoom, world x, world y]
// =====================================================================
const ERA_BG = ['#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#000000'];
const CAMFN = [null, camFound, camJack, camLift, camBlade, camFarm, null];
const WIDE_P = [[0.8, 960, 480], [1.1, 640, 560], [0.85, 1000, 560], [0.85, 1100, 470], [0.85, 1100, 470], [0.9, 1560, 480], [1, 960, 540]];
// every scene drifts in slowly (up to +4%) on top of its own camera, so no stretch of the picture is dead
function pieceCam(era, t) {
  const f = CAMFN[era], t0 = ERA_LIST[era][0], len = ERA_LIST[era][1] - t0;
  CAMBASE = PORTRAIT ? camOf({ z: WIDE_P[era][0], p: [WIDE_P[era][1], WIDE_P[era][2]], to: [960, 540] }) : null;
  let c = (f && f(t - t0)) || camBase();
  if (era === ERA_LIST.length - 1) return c;   // the end card draws on the bare canvas
  const d = 1 + 0.04 * EZ.io((t - t0) / len);
  c = { z: c.z * d, tx: c.tx * d + (1 - d) * 960, ty: c.ty * d + (1 - d) * 540 };   // drift about the landscape centre
  return PORTRAIT ? { z: c.z, tx: c.tx - 420, ty: c.ty + 420 } : c;   // portrait: that centre lands on the middle of the 1080x1920 frame
}
const BRIDGES = [];
