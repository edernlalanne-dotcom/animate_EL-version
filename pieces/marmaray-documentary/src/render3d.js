// =====================================================================
//  3D — a small perspective renderer for the documentary. Metres: X east, Y up, Z north.
//  Boxes, tubes, lines and arrows. Faces are sorted far to near (painter's order), flat-shaded in the piece's
//  colours and fogged into the ground. Opaque faces first; alpha faces (water, cutaway ground) over them; lines
//  and labels last.
// =====================================================================
const M3 = { navy: '#0b1d33', turq: '#2bb3a8', grey: '#7d858c', greyL: '#c9ced3', greyD: '#4b535b', amber: '#f2a33a', text: '#e9eef3' };
const M3_FOCAL = 1000;
const M3_LIGHT = [0.35, 0.85, 0.45];
let M3_CAM = null, M3_Q = null;

const m3Add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const m3Sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const m3Mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const m3Dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const m3Cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const m3Norm = (a) => m3Mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const m3Lerp = (a, b, s) => [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)];
const m3LightN = m3Norm(M3_LIGHT);

// hex colour mix, t = 0 keeps a, t = 1 gives b
function m3Mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp(t)));
  return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
}

// the camera eases between keys: [[t, px, py, pz, tx, ty, tz], ...] in absolute seconds
function m3Camera(keys) {
  let a = keys[0], b = keys[0];
  const last = keys[keys.length - 1];
  if (TT >= last[0]) a = b = last;
  else for (let i = 0; i < keys.length - 1; i++) if (TT >= keys[i][0] && TT < keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
  const u = clamp((TT - a[0]) / Math.max(1e-6, b[0] - a[0])), s = u * u * (3 - 2 * u);
  const p = m3Lerp(a.slice(1, 4), b.slice(1, 4), s), t = m3Lerp(a.slice(4, 7), b.slice(4, 7), s);
  const f = m3Norm(m3Sub(t, p)), r = m3Norm(m3Cross(f, [0, 1, 0]));
  M3_CAM = { p, f, r, u: m3Cross(r, f) };
}

// world -> screen: [x, y, depth], or null behind the camera
function m3P(P) {
  const d = m3Sub(P, M3_CAM.p), z = m3Dot(d, M3_CAM.f);
  if (z < 3) return null;
  return [W / 2 + M3_FOCAL * m3Dot(d, M3_CAM.r) / z, H / 2 - M3_FOCAL * m3Dot(d, M3_CAM.u) / z, z];
}

function m3Begin() { M3_Q = { solid: [], clear: [], lines: [], marks: [] }; }

// one quad with an explicit outward normal; back-facing quads are culled
function m3Face(P, n, col, a = 1) {
  const c = m3Mul(P.reduce((s, p) => m3Add(s, p), [0, 0, 0]), 1 / P.length);
  if (m3Dot(n, m3Sub(M3_CAM.p, c)) <= 0) return;
  const Q = P.map(m3P);
  if (Q.some((q) => !q)) return;
  const z = Q.reduce((s, q) => s + q[2], 0) / Q.length;
  (a < 1 ? M3_Q.clear : M3_Q.solid).push({ Q, n, col, a, z });
}

// an axis-aligned box from lo to hi
function m3Box(lo, hi, col, a = 1) {
  const [x0, y0, z0] = lo, [x1, y1, z1] = hi;
  m3Face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0], col, a);
  m3Face([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], col, a);
  m3Face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], col, a);
  m3Face([[x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]], [0, -1, 0], col, a);
  m3Face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], col, a);
  m3Face([[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], [0, 0, -1], col, a);
}

// a round tube from A to B
function m3Tube(A, B, r, col, a = 1, n = 14) {
  const ax = m3Norm(m3Sub(B, A));
  const ref = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const e1 = m3Norm(m3Cross(ax, ref)), e2 = m3Cross(ax, e1);
  const at = (C, th) => m3Add(C, m3Add(m3Mul(e1, r * Math.cos(th)), m3Mul(e2, r * Math.sin(th))));
  for (let k = 0; k < n; k++) {
    const t0 = (k / n) * Math.PI * 2, t1 = ((k + 1) / n) * Math.PI * 2, tm = (t0 + t1) / 2;
    m3Face([at(A, t0), at(B, t0), at(B, t1), at(A, t1)], m3Add(m3Mul(e1, Math.cos(tm)), m3Mul(e2, Math.sin(tm))), col, a);
  }
}

// a polyline, drawn over the solids
function m3Line(pts, col, w = 2, a = 1) {
  const Q = pts.map(m3P).filter(Boolean);
  if (Q.length > 1) M3_Q.lines.push({ Q, col, w, a });
}

// an arrow: a line and a head, drawn over the solids
function m3Arrow(A, B, col, w = 3, a = 1) {
  const pa = m3P(A), pb = m3P(B);
  if (!pa || !pb) return;
  M3_Q.lines.push({ Q: [pa, pb], col, w, a });
  const dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hs = 16;
  M3_Q.marks.push({ tri: [[pb[0], pb[1]], [pb[0] - ux * hs - uy * hs * 0.5, pb[1] - uy * hs + ux * hs * 0.5], [pb[0] - ux * hs + uy * hs * 0.5, pb[1] - uy * hs - ux * hs * 0.5]], col, a });
}

// a short label at a world point
function m3Text(P, str, col = M3.text, size = 34, dx = 16, dy = -12) {
  const q = m3P(P);
  if (q) M3_Q.marks.push({ text: str, x: q[0] + dx, y: q[1] + dy, col, size });
}

// draw everything queued this frame over a vertical background gradient
function m3Flush(bg) {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
  c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, W, H);
  const path = (Q) => { c.beginPath(); c.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < Q.length; i++) c.lineTo(Q[i][0], Q[i][1]); c.closePath(); };
  M3_Q.solid.sort((p, q) => q.z - p.z);
  for (const s of M3_Q.solid) {
    const k = clamp(0.6 + 0.4 * Math.max(0, m3Dot(s.n, m3LightN)));
    const fog = clamp((s.z - 1200) / 3200, 0, 0.8);
    c.fillStyle = m3Mix(m3Mix(s.col, M3.navy, (1 - k) * 0.7), M3.navy, fog);
    path(s.Q); c.fill();
    c.strokeStyle = 'rgba(11,29,51,0.35)'; c.lineWidth = 0.8; c.stroke();
  }
  M3_Q.clear.sort((p, q) => q.z - p.z);
  for (const s of M3_Q.clear) {
    const k = clamp(0.7 + 0.3 * Math.max(0, m3Dot(s.n, m3LightN)));
    c.globalAlpha = s.a; c.fillStyle = m3Mix(s.col, M3.navy, (1 - k) * 0.5); path(s.Q); c.fill();
  }
  c.globalAlpha = 1; c.lineCap = 'round'; c.lineJoin = 'round';
  for (const l of M3_Q.lines) {
    c.globalAlpha = l.a; c.strokeStyle = l.col; c.lineWidth = l.w;
    c.beginPath(); c.moveTo(l.Q[0][0], l.Q[0][1]); for (const q of l.Q.slice(1)) c.lineTo(q[0], q[1]); c.stroke();
  }
  for (const m of M3_Q.marks) {
    if (m.tri) { c.globalAlpha = m.a ?? 1; c.fillStyle = m.col; path(m.tri); c.fill(); }
    else { c.globalAlpha = 1; c.font = `500 ${m.size}px ${SANS}`; c.fillStyle = m.col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(m.text, m.x, m.y); }
  }
  c.globalAlpha = 1;
}

// a caption that shows from t0 until t1 only, centred near the bottom
function m3Caption(str, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = clamp(spring(TT, t0, { k: 120, damp: 0.85 }));
  ctx.save(); ctx.globalAlpha = a; ctx.font = `500 44px ${SANS}`; ctx.fillStyle = M3.text;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, W / 2, H - 80); ctx.restore();
}
