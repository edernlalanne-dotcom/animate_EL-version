// =====================================================================
//  GLOBE INTRO — an orthographic Earth drawn from coarse coastlines (lon, lat), spun to the Americas, then zoomed into the
//  Panama Canal and dissolved into the drone view. Screen space (called through DEFER). Deterministic: seeded stars, no clock.
//  Coastlines are hand-simplified outlines (about 1-5 degrees between points); they are a stylised map, not survey data.
// =====================================================================
const GL_NA = [[-168,66],[-162,70],[-156,71.3],[-141,69.6],[-128,70],[-115,68],[-95,72],[-85,69.5],[-82,66],[-90,64],[-94,60],[-92,57],[-85,55.2],[-82,52.5],[-79,51.5],[-78,56],[-77,60],[-72,61],[-65,60],[-62,57],[-57,53],[-60,50],[-66,50],[-70,47],[-65,45],[-66,43.5],[-70,42],[-71,41],[-74,40.5],[-76,38],[-76,35],[-78,34],[-81,31.5],[-80.2,27],[-80,25.3],[-81.5,25.3],[-82.8,28],[-84,30],[-87,30.3],[-89,30],[-90,29.2],[-93,29.7],[-96,28.2],[-97.4,26],[-97.8,22],[-97,20],[-96,19],[-94.5,18.2],[-91,18.7],[-90.5,21],[-88,21.5],[-87,20.5],[-87.5,18],[-88.3,16],[-86,15.9],[-84,15.5],[-83.4,15],[-83.5,12],[-83.7,10.9],[-83,10],[-82.6,9.6],[-82.2,9.15],[-81.5,8.85],[-80.9,8.85],[-80.3,9.1],[-79.9,9.37],[-79.4,9.5],[-78.9,9.55],[-78.4,9.4],[-77.9,9.2],[-77.35,8.67],[-78.1,7.25],[-78.4,8.0],[-78.8,8.4],[-79.2,8.8],[-79.5,8.95],[-79.8,8.7],[-79.95,8.2],[-80.0,7.55],[-80.4,7.25],[-80.75,7.55],[-81.1,7.85],[-81.6,7.5],[-82.2,8.1],[-82.9,8.1],[-83.7,8.6],[-84.3,9.4],[-85.2,9.9],[-85.8,10.6],[-85.7,11.1],[-86.2,11.6],[-87.0,12.1],[-87.7,12.9],[-88.4,13.2],[-89.5,13.4],[-92,14.5],[-94.5,16],[-97,15.7],[-100,16.8],[-103,18.2],[-105.6,20],[-105.3,22],[-108,25.5],[-110,27.5],[-112.5,30],[-114.8,31.8],[-114.5,29],[-112,26],[-110,23],[-112,25],[-114.5,28],[-115.5,30],[-117,32.5],[-118.5,34],[-121,35],[-122.5,37.5],[-124,40.5],[-124.5,43],[-124,46.5],[-124.7,48.4],[-127,50],[-130,54],[-134,58],[-140,60],[-148,60.5],[-152,59],[-158,57],[-164,55],[-158,58.5],[-162,60],[-166,62],[-165,64]];
const GL_SA = [[-77.35,8.67],[-76.8,8.6],[-76.4,9.0],[-75.6,10.4],[-74.9,11],[-74,11.3],[-72.5,11.9],[-71.4,12.4],[-71,11.7],[-71.9,10.8],[-71.6,10.4],[-68,10.6],[-65,10.2],[-62,10.7],[-60,8.5],[-57,6],[-53,5.5],[-51,4],[-50,1.5],[-49,-1],[-44.5,-2.5],[-40,-3],[-35.5,-5.2],[-35,-8],[-37,-12],[-39,-15],[-39.5,-18],[-41,-22],[-44,-23],[-48,-26],[-48.8,-28.5],[-52,-33],[-54,-34.8],[-58,-34.5],[-57,-37.5],[-62,-39],[-64,-41],[-65,-45],[-67.5,-46.5],[-66,-48],[-68.5,-50.5],[-69,-52.5],[-68,-54.5],[-71,-54],[-74,-52],[-75.5,-48],[-74,-43],[-73.5,-37],[-71.7,-30],[-70.5,-24],[-70.3,-18.5],[-75,-15],[-76.5,-12],[-79,-8],[-81,-5],[-80.2,-3],[-80,-1],[-80.5,0.5],[-78.8,1.8],[-77.9,3.2],[-77.4,4.3],[-77.3,6.5],[-78.1,7.25]];
const GL_AF = [[-17,21],[-13,27.5],[-9.8,30],[-6,35.8],[-2,35],[3,36.8],[10,37.3],[11,33.5],[15,32],[20,31],[25,31.8],[32,31],[34,28],[35,24],[37,20],[39,16],[43,12.5],[51,12],[51,10],[48,5],[42,-1],[40,-5],[39,-9],[40.5,-15],[35,-20],[35.5,-24],[32.5,-26],[32.5,-29],[30,-31.5],[27,-33.5],[22,-34],[18.5,-34.2],[17.5,-30],[14.5,-22.5],[12,-17],[13.5,-11],[12.5,-6],[9,-1],[9.5,3.5],[6,4.3],[4.5,6.3],[1,6],[-3,5],[-7.5,4.4],[-11,6.8],[-13.5,9.5],[-15,11.5],[-16.7,13],[-17.4,14.7],[-16,18.5]];
const GL_EU = [[-9.5,37],[-9,43.5],[-1.5,43.5],[-4.5,48.5],[2,51],[8,55],[10.5,57.5],[12,54],[19,54.5],[24,59.5],[30,60],[22,65],[17,62],[19,59],[12,56],[6,58],[5,62],[14,67.5],[25,71],[40,67],[44,66.5],[68,69],[80,73.5],[100,77],[130,72],[170,70],[180,68],[180,65],[160,60],[156,51],[143,59],[135,54],[140,48],[130,42],[126,37],[121,39],[122,31],[119,25],[111,21.5],[108,15.5],[105,9],[100,13.5],[100,6],[103.5,1.3],[98,8],[98,16],[94,17],[91,22.5],[86,20],[80,15],[78,8],[73,17],[72,21],[66,25],[57,25.5],[51,29],[48,29.8],[51,24.5],[56,26],[59,22.5],[55,17],[44,12.7],[43,16],[39,21],[35,28],[34,31],[36,36],[30,36.8],[27,37],[26,40.5],[23.5,38],[21,37],[20,40],[19.5,42],[15,45],[13.5,45.7],[12.5,44],[16,41.5],[18.5,40],[16,38],[15.5,38],[12.5,41.5],[10,43.5],[7.5,43.8],[3,43],[0,39.5],[-2,37],[-5.5,36]];
const GL_GR = [[-73,78],[-60,82],[-30,83.5],[-20,80],[-19,75],[-22,70],[-32,68],[-43,60],[-50,62],[-54,67],[-58,75]];
const GL_LAND = [GL_NA, GL_SA, GL_AF, GL_EU, GL_GR];
const GL_CANAL = [[-79.92, 9.35], [-79.86, 9.22], [-79.76, 9.12], [-79.64, 9.04], [-79.55, 8.96]];   // Colon to Panama City
const GL_TARGET = [-79.72, 9.15];

// when the intro plays (seconds): the voice's first line carries it
const GL_T = { spin: 3.0, zoom0: 2.4, counters: 1.1, share: 4.4 };
const GD = (G1 + 0.4) - G0;   // the overlay's length: it fades in at G0 and has dissolved by G1 + 0.4

function glProj(lon, lat, c) {
  const l = (lon - c.lon) * DEG, p = lat * DEG, p0 = c.lat * DEG, cp = Math.cos(p);
  const x = cp * Math.sin(l), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cp * Math.cos(l), z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cp * Math.cos(l);
  return [c.cx + c.R * x, c.cy - c.R * y, z];
}
function glPoly(P, c) {   // hidden vertices are pushed out to the limb so a polygon never tears at the horizon
  return P.map(([lon, lat]) => {
    const [x, y, z] = glProj(lon, lat, c);
    if (z >= 0) return [x, y];
    const dx = x - c.cx, dy = y - c.cy, d = Math.hypot(dx, dy) || 1;
    return [c.cx + dx / d * c.R, c.cy + dy / d * c.R];
  });
}
function glCam(t) {
  const sp = EZ.io(seg(t, 0.0, GL_T.spin)), zm = EZ.io(seg(t, GL_T.zoom0, GD - 0.4));
  const lon = lerp(50, GL_TARGET[0], sp), lat = lerp(24, GL_TARGET[1], sp);
  return { lon, lat, R: Math.exp(lerp(Math.log(360), Math.log(11000), zm)), cx: W / 2, cy: H / 2 + lerp(0, 0, zm), zm };
}
function glLine(pts, c, col, w, a) {   // a graticule / route polyline, only where it faces us
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.globalAlpha = a; ctx.beginPath();
  let pen = false;
  for (const [lon, lat] of pts) { const [x, y, z] = glProj(lon, lat, c); if (z > 0) { if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; } } else pen = false; }
  ctx.stroke(); ctx.restore();
}

function introGlobe(tAbs) {
  const t = tAbs - G0;   // seconds since the globe began
  if (t < 0) return;
  const fade = seg(t, 0, 0.45) * (1 - EZ.io(seg(t, GD - 1.6, GD)));
  if (fade <= 0.001) return;
  const c = glCam(t), R = c.R, cx = c.cx, cy = c.cy;
  ctx.save(); ctx.globalAlpha = fade;
  // space and stars (they thin out as we fall toward the surface)
  ctx.fillStyle = '#02050a'; ctx.fillRect(0, 0, W, H);
  const SR = RNG('globe-stars'), starA = 1 - seg(t, GL_T.zoom0, GL_T.zoom0 + 2.5);
  if (starA > 0) for (let i = 0; i < 260; i++) {
    const x = SR.f() * W, y = SR.f() * H, r = 0.5 + SR.f() * 1.3, tw = 0.55 + 0.45 * Math.sin(t * (1 + SR.f() * 2.5) + i);
    ctx.fillStyle = `rgba(210,235,255,${(0.25 + 0.6 * SR.f()) * tw * starA})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  // atmosphere glow behind the disk
  if (R < 2600) {
    const g = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.22);
    g.addColorStop(0, 'rgba(95,227,255,0.55)'); g.addColorStop(0.35, 'rgba(60,150,220,0.22)'); g.addColorStop(1, 'rgba(60,150,220,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, TAU); ctx.fill();
  }
  // ocean disk, then everything clipped to it
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  const og = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
  og.addColorStop(0, '#12527a'); og.addColorStop(0.6, '#0a3556'); og.addColorStop(1, '#041a2e');
  ctx.fillStyle = og; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  // graticule every 15 degrees, thinner as we zoom
  const gw = Math.max(1, 1.4), ga = 0.16 * (1 - seg(c.zm, 0.5, 0.9));
  if (ga > 0.005) {
    for (let lon = -180; lon < 180; lon += 15) { const pts = []; for (let lat = -80; lat <= 80; lat += 4) pts.push([lon, lat]); glLine(pts, c, '#8fd8ff', gw, ga); }
    for (let lat = -75; lat <= 75; lat += 15) { const pts = []; for (let lon = -180; lon <= 180; lon += 4) pts.push([lon, lat]); glLine(pts, c, '#8fd8ff', gw, ga); }
  }
  // land
  for (const P of GL_LAND) {
    const S = glPoly(P, c);
    ctx.beginPath();
    ctx.moveTo((S[S.length - 1][0] + S[0][0]) / 2, (S[S.length - 1][1] + S[0][1]) / 2);
    for (let i = 0; i < S.length; i++) { const p = S[i], q = S[(i + 1) % S.length]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    ctx.closePath();
    ctx.fillStyle = '#26503f'; ctx.fill();
    ctx.lineWidth = Math.max(1.6, Math.min(5, R * 0.0006)); ctx.strokeStyle = 'rgba(120,235,215,0.75)'; ctx.stroke();
  }
  // day and night: a soft shadow sweeping to the lower right
  const sh = ctx.createRadialGradient(cx - R * 0.45, cy - R * 0.5, R * 0.3, cx, cy, R * 1.15);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.7, 'rgba(0,4,10,0.18)'); sh.addColorStop(1, 'rgba(0,4,10,0.7)');
  ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  // a thin bright rim
  ctx.strokeStyle = 'rgba(160,235,255,0.7)'; ctx.lineWidth = 2; if (R < 2600) { ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); }

  // the canal: a red neon route and a pulsing marker once Panama is in reach
  const mA = EZ.o2(seg(t, GL_T.zoom0 + 0.6, GL_T.zoom0 + 1.6));
  if (mA > 0) {
    const [mx, my] = glProj(GL_TARGET[0], GL_TARGET[1], c), pulse = (t * 0.9) % 1;
    glLine(GL_CANAL, c, DR.redGlow, Math.max(10, R * 0.0014), mA); glLine(GL_CANAL, c, DR.red, Math.max(3.2, R * 0.0004), mA);
    ctx.save(); ctx.globalAlpha = fade * mA * (1 - pulse); ctx.strokeStyle = DR.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(mx, my, 16 + pulse * 90, 0, TAU); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = fade * mA; ctx.fillStyle = DR.red; ctx.shadowColor = DR.red; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.fill(); ctx.restore();
    const lA = EZ.o2(seg(t, GL_T.zoom0 + 1.4, GL_T.zoom0 + 2.2)) * (1 - EZ.o2(seg(t, GD - 1.4, GD - 0.8)));
    if (lA > 0) {
      ctx.save(); ctx.globalAlpha = fade * lA; ctx.strokeStyle = DR.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx + 6, my - 14); if (PORTRAIT) ctx.lineTo(mx, my - 120); else { ctx.lineTo(mx + 120, my - 90); ctx.lineTo(mx + 340, my - 90); } ctx.stroke(); ctx.restore();
      if (PORTRAIT) {
        drText('PANAMA CANAL', mx, my - 150, 50, DR.white, { align: 'center', alpha: fade * lA, track: 5 });
        drText('ATLANTIC OCEAN', mx - 160, my - 300, 26, DR.cyan, { align: 'center', alpha: fade * lA * 0.9, track: 8 });
        drText('PACIFIC OCEAN', mx + 190, my + 90, 26, DR.cyan, { align: 'center', alpha: fade * lA * 0.9, track: 8 });
      } else {
        drText('PANAMA CANAL', mx + 130, my - 104, 54, DR.white, { alpha: fade * lA, track: 5 });
        drText('ATLANTIC OCEAN', mx - 420, my - 190, 28, DR.cyan, { alpha: fade * lA * 0.9, track: 8 });
        drText('PACIFIC OCEAN', mx - 140, my + 250, 28, DR.cyan, { alpha: fade * lA * 0.9, track: 8 });
      }
    }
  }
  // the numbers, as the voice says them
  const cA = EZ.o2(seg(t, GL_T.counters, GL_T.counters + 0.7)) * (1 - EZ.o2(seg(t, GD - 1.9, GD - 1.2)));
  const c1x = PORTRAIT ? (W - 560) / 2 - 40 : 60, c1y = PORTRAIT ? 1030 : H - 300, c2x = PORTRAIT ? (W - 560) / 2 - 40 : W - 620, c2y = PORTRAIT ? 1260 : H - 300;
  if (cA > 0) {
    const n = Math.round(13951 * EZ.o3(seg(t, GL_T.counters + 0.2, GL_T.counters + 3.2)));
    ctx.save(); ctx.globalAlpha = fade * cA; ctx.fillStyle = 'rgba(2,6,10,0.62)'; ctx.beginPath(); ctx.roundRect(c1x, c1y, 560, 210, 10); ctx.fill();
    ctx.strokeStyle = DR.cyan; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    drText(fmtInt(n), c1x + 30, c1y + 110, 112, DR.white, { alpha: fade * cA, font: DR_MONO, glow: 'rgba(95,227,255,0.55)', blur: 18 });
    drText('SHIPS CROSS EVERY YEAR', c1x + 34, c1y + 152, 30, DR.cyan, { alpha: fade * cA, track: 3 });
    drText('FISCAL YEAR 2026', c1x + 34, c1y + 188, 22, DR.white, { alpha: fade * cA * 0.7, track: 4 });
    const sA = EZ.o2(seg(t, GL_T.share, GL_T.share + 0.7)) * (1 - EZ.o2(seg(t, GD - 1.9, GD - 1.2)));
    if (sA > 0) {
      ctx.save(); ctx.globalAlpha = fade * sA; ctx.fillStyle = 'rgba(2,6,10,0.62)'; ctx.beginPath(); ctx.roundRect(c2x, c2y, 560, 210, 10); ctx.fill();
      ctx.strokeStyle = DR.red; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      drText('38 MIN', c2x + 30, c2y + 110, 112, DR.white, { alpha: fade * sA, font: DR_MONO, glow: 'rgba(255,43,58,0.6)', blur: 18 });
      drText('BETWEEN SHIPS, ON AVERAGE', c2x + 34, c2y + 152, 28, DR.red, { alpha: fade * sA, track: 3 });
      drText('~5% OF WORLD TRADE', c2x + 34, c2y + 188, 22, DR.white, { alpha: fade * sA * 0.7, track: 4 });
    }
  }
  ctx.restore();
}
