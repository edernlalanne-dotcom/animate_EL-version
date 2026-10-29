  // SCORE BODY — the documentary (inside buildScore(); see kit/score-head.js). A low pad under the narration, soft clicks on each move.
  const T = TIMELINE, q = T.cues;
  to = 'm';
  pad(0.0, q.deep, ['D3', 'A3', 'E4'], 0.026, { type: 'triangle', cut: 1200, att: 0.6, rel: 0.5, send: 0.5 });
  pad(q.deep, q.cast, ['A2', 'E3', 'Cs5'], 0.026, { type: 'triangle', cut: 1100, att: 0.5, rel: 0.5, send: 0.5 });
  pad(q.cast, q.seal, ['D2', 'A2', 'E3'], 0.028, { type: 'triangle', cut: 1000, att: 0.5, rel: 0.5, send: 0.5 });
  pad(q.seal, DURATION, ['A2', 'E3', 'A3'], 0.028, { type: 'triangle', cut: 1200, att: 0.5, rel: 0.6, send: 0.5 });
  to = 's';
  blip(q.deep, 900, 1200, 0.1, 0.04, 0);
  blip(q.cast, 500, 800, 0.1, 0.04, 0);
  for (let i = 0; i < 6; i++) blip(q.trench + i * 0.3, 1400 + i * 80, 1200, 0.03, 0.02, i % 2 ? 0.2 : -0.2);
  sweep(q.sink, q.bed, 0.007, 300, 600, 0);
  for (let i = 0; i < 4; i++) blip(q.seal + 5 + i * 0.4, 1800, 1400, 0.05, 0.03, i % 2 ? 0.2 : -0.2);   // gaskets
  noiseHit(q.end + 1, 0.4, 'bandpass', 900, 1.2, 0.03, 0, 0.2, 2200);
