const ERA_BG = ['#FFF3D6', '#9AA3AB', '#F4EBD8', '#F4EBD8'];
const CAMS = [
  { z: 1.12, p: [W * 0.5, H * 0.52] }, { z: 1.1, p: [W * 0.5, H * 0.5] }, { z: 1.08, p: [W * 0.5, H * 0.5] }, { z: 1.06, p: [W * 0.5, H * 0.5] },
];
function pieceCam(era, t) { const c = CAMS[era], t0 = ERA_LIST[era][0]; return push(t, t0, t0 + 3, { z: c.z, p: c.p, to: c.p }); }
const BRIDGES = [];
