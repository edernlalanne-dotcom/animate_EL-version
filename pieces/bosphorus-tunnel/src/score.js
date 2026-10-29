  // SCORE BODY — the tunnel piece (inside buildScore(); see kit/score-head.js). A low pad under the narration, clicks on the moves.
  const T = TIMELINE, q = T.cues;
  to = 'm';
  pad(0.0, 8.0, ['D3', 'A3', 'E4'], 0.028, { type: 'triangle', cut: 1200, att: 0.5, rel: 0.4, send: 0.5 });
  pad(8.0, 21.5, ['A2', 'E3', 'Cs5'], 0.028, { type: 'triangle', cut: 1200, att: 0.4, rel: 0.4, send: 0.5 });
  pad(21.5, 40.0, ['D2', 'A2', 'E3'], 0.03, { type: 'triangle', cut: 1000, att: 0.4, rel: 0.4, send: 0.5 });
  pad(40.0, DURATION, ['A2', 'E3', 'A3'], 0.03, { type: 'triangle', cut: 1200, att: 0.4, rel: 0.5, send: 0.5 });
  to = 's';
  for (let i = 0; i < SEC.N; i++) blip(q.cast - 0.1 + i * 0.22, 900 + i * 60, 700, 0.04, 0.035, (i % 2 ? 0.2 : -0.2));   // sections landing
  blip(q.trench, 500, 1100, 0.1, 0.04);
  sweep(q.sink, q.sink + 5.5, 0.008, 300, 700, 0);   // the slow lowering
  blip(q.deep, 1200, 1600, 0.08, 0.035);
  for (let i = 0; i < 8; i++) blip(q.bed + i * 0.05, 2000 + (i % 3) * 200, 1800, 0.012, 0.02, (i % 2 ? 0.2 : -0.2));   // gravel
  noiseHit(q.end + 1.2, 0.35, 'bandpass', 900, 1.2, 0.03, 0, 0.2, 2200);   // the train pulls out
