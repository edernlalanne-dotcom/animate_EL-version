// =====================================================================
//  ERAS, CAMERAS — hard cuts between the six stages (BRIDGES empty); per-scene cameras in scenes.js
// =====================================================================
const ERA_BG = ['#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#0d2a4d', '#000000'];
const CAMFN = [null, camFound, camJack, camLift, camBlade, camFarm, null];
function pieceCam(era, t) { const f = CAMFN[era]; return f ? f(t - ERA_LIST[era][0]) : null; }
const BRIDGES = [];
