  // SCORE BODY — sensor-blind. Voice is the clock. Thin bed, rain, LiDAR ticks, a hard silence, one hit, then a rising resolve.
  const Tq = T.quiet, Tb = T.blind;
  to = 'm';
  pad(0.0, Tq, ['A2', 'E3'], 0.03, { type: 'triangle', cut: 800, att: 1.0, rel: 0.25 });
  pad(T.rain - 0.5, Tq, ['A3', 'C4', 'E4'], 0.016, { type: 'triangle', cut: 900, att: 2.0, rel: 0.25 });
  to = 's';
  for (let t = 0.9; t < Tq - 0.1; t += 0.45) blip(t, 1800, 1500, 0.05, 0.010 + 0.014 * clamp(Dat(t)), 0.2);
  blip(1.0, 880, 1320, 0.14, 0.04, 0.3); blip(1.2, 1100, 1650, 0.14, 0.04, 0.0); blip(1.4, 1320, 1980, 0.14, 0.04, -0.3);
  const rainBed = (t0, t1, gain) => { for (let t = t0; t < t1; t += 0.03) { const r = rainAt(t); if (hh(Math.round(t * 100), 5) < r) noiseHit(t, 0.05, 'highpass', 5000, 0.7, gain * (0.008 + 0.014 * r), hh(Math.round(t * 100), 6) - 0.5); } };
  rainBed(T.rain - 0.3, Tq - 0.05, 1);
  sweep(T.lidar, T.study + 3, 0.012, 800, 5000, 0);
  // a track is lost: a low buzz and a falling blip
  for (const o of OBJ) { for (let t = 5; t < Tb; t += 1 / 24) if (objConf(o, t) < 0.33) { noiseHit(t, 0.35, 'bandpass', 300, 2, 0.06, 0); blip(t, 330, 160, 0.4, 0.05, 0); break; } }
  // silence from Tq to Tb (nothing scheduled), then the one hit
  to = 'm';
  chime(Tb, [nz('A3'), nz('E4'), nz('A4')], 0.18); sub(Tb, 0.6);
  to = 's';
  for (let k = 0; k < 8; k++) noiseHit(Tb + k * 0.06, 0.05, 'bandpass', 400 + 2400 * hh(k, 3), 3, 0.1 * (1 - k / 9), hh(k, 4) - 0.5);
  to = 'm';
  pad(Tb + 0.05, T.how + 0.3, ['A2', 'E3', 'A3'], 0.04, { cut: 700, att: 0.1, rel: 0.9 });
  to = 's';
  rainBed(Tb + 1.0, T.fusion, 0.5);
  // the fixes
  blip(T.radar, 600, 1800, 0.3, 0.05, 0); [0.5, 0.9, 1.3].forEach((d) => blip(T.radar + d, 1200, 1800, 0.12, 0.04, d - 0.9));
  blip(T.l1550, 700, 2100, 0.3, 0.05, 0.2); [0.6, 1.0, 1.4].forEach((d) => blip(T.l1550 + d, 900, 1400, 0.12, 0.04, 0.3));
  to = 'm';
  pad(T.thermal, T.clean, ['A3', 'E4', 'A4'], 0.026, { att: 0.5, rel: 0.3, cut: 1100 });
  to = 's';
  for (let t = T.clean + 1.2; t < T.clean + 2.5; t += 0.1) noiseHit(t, 0.05, 'highpass', 6000, 0.7, 0.03, 0);
  sweep(T.clean + 2.55, T.clean + 3.6, 0.03, 400, 2500, 0);
  to = 'm';
  chime(T.clean + 3.7, [nz('E5'), nz('A5')], 0.08);
  pad(T.fusion, T.card, ['A3', 'C4', 'E4'], 0.03, { att: 1.5, rel: 0.4, cut: 1100 });
  chime(T.fusion + 2.5, [nz('E4'), nz('A4'), nz('C5')], 0.1);
  pad(T.fusion + 4.4, T.card, ['C4', 'E4', 'G4', 'C5'], 0.04, { att: 0.3, rel: 0.4, cut: 1500 });
  chime(T.card, [nz('A5'), nz('E6'), nz('A6')], 0.08); sub(T.card, 0.12);
  pad(T.card, DURATION + 0.4, ['A3', 'E4', 'A4', 'C5'], 0.014, { att: 0.05, rel: 0.8, send: 0.5, cut: 1400 });
