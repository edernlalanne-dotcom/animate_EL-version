// =====================================================================
//  SCENES — the drive (two panels) and the end card.
// =====================================================================
function sceneDrive() {
  fillAll('#04070a');
  topView(TT);
  sensorView(TT);
  svText('ILLUSTRATIVE SIMULATION', PX + PW - 100, BOTY + PH - 14, 17, SV.dim, { align: 'right', font: MONO, weight: 700, alpha: 0.8 });
}
function sceneCard() {
  fillAll('#000000');
  const u = clamp((TT - T.card) / 2.0), k = 1 + 0.04 * u;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  drawAsset('logo.jpg', 0, (H - W) / 2, W, W);
  ctx.restore();
}
