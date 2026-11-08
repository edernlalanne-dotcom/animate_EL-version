// =====================================================================
//  ERAS, CAMERAS — hard cuts between the six stages (BRIDGES empty); per-scene cameras in scenes.js
// =====================================================================
const ERA_BG = ['#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#000000'];
const CAMFN = [null, camFound, camJack, camLift, camBlade, camFarm, null];
// every scene drifts in slowly (up to +4%) on top of its own camera, so no stretch of the picture is dead
function pieceCam(era, t) {
  const f = CAMFN[era], t0 = ERA_LIST[era][0], len = ERA_LIST[era][1] - t0;
  const c = (f && f(t - t0)) || CAM0;
  if (era === ERA_LIST.length - 1) return c;
  const d = 1 + 0.04 * EZ.io((t - t0) / len);
  return { z: c.z * d, tx: c.tx * d + (1 - d) * W / 2, ty: c.ty * d + (1 - d) * H / 2 };
}
const BRIDGES = [];
