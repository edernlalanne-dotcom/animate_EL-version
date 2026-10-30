// =====================================================================
//  SCENES — the drive (two panels, cold open first) and the end card.
// =====================================================================
function sceneDrive() {
  fillAll('#04070a');
  const cold = TT < T.story;
  setLayout(cold ? 0 : EZ.io(clamp((TT - (T.blind + 1.2)) / 0.7)));
  const t = cold ? coldTime(TT) : TT;
  topView(t);
  sensorView(t, cold);
  if (cold && TT >= T.rewind) rewindOverlay(TT);
  svText('ILLUSTRATIVE SIMULATION', PX + PW - 100, BOTYv + SPH - 14, 17, SV.dim, { align: 'right', font: MONO, weight: 700, alpha: 0.8 });
}
function sceneCard() {
  fillAll('#000000');
  const u = clamp((TT - T.card) / 2.0), k = 1 + 0.04 * u;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  drawAsset('logo.jpg', 0, (H - W) / 2, W, W);
  ctx.restore();
}
