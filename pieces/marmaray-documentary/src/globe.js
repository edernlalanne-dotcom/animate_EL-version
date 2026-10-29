// =====================================================================
//  GLOBE — the opening (0:00 to 0:06). A globe turns, then the view zooms to Turkey and on to the Strait of
//  Istanbul, where the documentary's action sits. Orthographic projection; land and Turkey from GEO (geo.js).
// =====================================================================
const GL_D2R = Math.PI / 180;
// the unit vector of a longitude and latitude, in degrees
const glVec = (lon, lat) => [Math.cos(lat * GL_D2R) * Math.cos(lon * GL_D2R), Math.cos(lat * GL_D2R) * Math.sin(lon * GL_D2R), Math.sin(lat * GL_D2R)];

// a view: centre (lon, lat) on the globe, radius R in pixels; screen centre at (W / 2, H / 2)
function glView(lon, lat, R) {
  const c = glVec(lon, lat), right = [-Math.sin(lon * GL_D2R), Math.cos(lon * GL_D2R), 0], up = m3Cross(c, right);
  return { c, right, up, R };
}
// project a longitude and latitude; points on the far side are pushed onto the limb so outlines stay closed
function glPoint(v, lon, lat) {
  let p = glVec(lon, lat);
  const d = m3Dot(p, v.c);
  if (d < 0) { p = m3Norm(m3Sub(p, m3Mul(v.c, d))); }
  return [W / 2 + v.R * m3Dot(p, v.right), H / 2 - v.R * m3Dot(p, v.up), d >= 0];
}
// the centre and radius of the view at time t, on the zoom path
function glPath(t) {
  if (t < 2.2) return { lon: 18 + (t) * 4, lat: 14, R: 430 };
  if (t < 4.8) {
    const u = EZ.io(seg(t, 2.2, 4.8));
    return { lon: lerp(26.4, 32, u), lat: lerp(14, 39, u), R: 430 * Math.pow(1900 / 430, u) };
  }
  const u = EZ.io(seg(t, 4.8, 6.0));
  return { lon: lerp(32, 29.0, u), lat: lerp(39, 41.0, u), R: 1900 * Math.pow(60000 / 1900, u) };
}

function drawGlobeRings(v, rings, fill, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = fill;
  for (const ring of rings) {
    ctx.beginPath();
    ring.forEach(([lon, lat], i) => {
      const q = glPoint(v, lon, lat);
      i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
    });
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function sceneGlobe() {
  const cur = glPath(TT), v = glView(cur.lon, cur.lat, cur.R);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#17395c'); g.addColorStop(1, '#0b1d33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the ocean disk, then a graticule of thin turquoise lines
  if (cur.R < W * 4) {
    ctx.save();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, cur.R, 0, Math.PI * 2);
    ctx.fillStyle = '#122b47'; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = M3.turq; ctx.globalAlpha = 0.22; ctx.lineWidth = 1.2;
    for (let lat = -60; lat <= 75; lat += 15) {
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 2) { const q = glPoint(v, lon, lat); lon === -180 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
    }
    for (let lon = -180; lon < 180; lon += 15) {
      ctx.beginPath();
      for (let lat = -80; lat <= 85; lat += 2) { const q = glPoint(v, lon, lat); lat === -80 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    drawGlobeRings(v, GEO.land, M3.grey, 1);
    drawGlobeRings(v, GEO.turkey, M3.amber, 0.95);
    ctx.restore();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, cur.R, 0, Math.PI * 2);
    ctx.strokeStyle = M3.turq; ctx.globalAlpha = 0.6; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1;
  }
  // labels: the globe first, then Turkey, then the strait
  const label = (lon, lat, str, size, dy = 0) => {
    const q = glPoint(v, lon, lat);
    if (!q[2]) return;
    ctx.font = `600 ${size}px ${SANS}`; ctx.fillStyle = M3.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(str, q[0], q[1] + dy);
  };
  if (TT > 0.6 && cur.R < 600) label(35, 35, 'Europe', 40);
  if (TT > 2.4) label(35, 39, 'Turkey', 52, -90);
  if (TT > 5.0) {
    const q = glPoint(v, 29.0, 41.0);
    ctx.beginPath(); ctx.arc(q[0], q[1], 14, 0, Math.PI * 2); ctx.fillStyle = M3.amber; ctx.fill();
    ctx.beginPath(); ctx.arc(q[0], q[1], 34, 0, Math.PI * 2); ctx.strokeStyle = M3.amber; ctx.lineWidth = 4; ctx.stroke();
    ctx.font = `600 52px ${SANS}`; ctx.fillStyle = M3.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Strait of Istanbul', q[0] + 50, q[1] - 36);
  }
}

// the closing logo, held for the last seconds
function sceneLogo() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  drawAsset('logo.jpg', (W - W) / 2, (H - W) / 2, W, W, { fit: 'contain' });
}
