  // SCORE BODY — sensor-blind v2. Voice is the clock. A hit on the cold open, a rewind sweep, a thin bed, a hard silence,
  // the same hit on the real payoff, then a rising resolve that pays off the opening.
  const Tq = T.quiet, Tb = T.blind;
  // cold open: the blackout hit, glitch noise, then the rewind
  to = 'm';
  chime(0.0, [nz('A3'), nz('E4'), nz('A4')], 0.07); sub(0.0, 0.22);
  pad(0.05, T.rewind, ['A2', 'E3'], 0.03, { type: 'triangle', cut: 600, att: 0.1, rel: 0.4 });
  to = 's';
  for (let k = 0; k < 7; k++) noiseHit(0.02 + k * 0.07, 0.05, 'bandpass', 400 + 2400 * hh(k, 3), 3, 0.05 * (1 - k / 8), hh(k, 4) - 0.5);
  sweep(T.rewind, T.story - 0.05, 0.03, 4200, 250, 0);
  for (let t = T.rewind; t < T.story - 0.1; t += 0.11) noiseHit(t, 0.03, 'highpass', 7000, 0.7, 0.02, hh(Math.round(t * 100), 8) - 0.5);
  to = 'm';
  chime(T.story, [nz('E5'), nz('A5')], 0.06);
  // the story: a thin bed, LiDAR ticks, rain, lost tracks
  pad(T.story, Tq, ['A2', 'E3'], 0.03, { type: 'triangle', cut: 800, att: 1.0, rel: 0.25 });
  pad(T.rain - 0.5, Tq, ['A3', 'C4', 'E4'], 0.016, { type: 'triangle', cut: 900, att: 2.0, rel: 0.25 });
  to = 's';
  for (let t = T.story + 0.2; t < Tq - 0.1; t += 0.45) blip(t, 1800, 1500, 0.05, 0.010 + 0.014 * clamp(Dat(t)), 0.2);
  [0.3, 0.55, 0.8].forEach((d, i) => blip(T.watch + d, 880 * 1.25 ** i, 1320 * 1.25 ** i, 0.12, 0.04, 0.3 - 0.3 * i));
  const rainBed = (t0, t1, gain) => { for (let t = t0; t < t1; t += 0.03) { const r = rainAt(t); if (hh(Math.round(t * 100), 5) < r) noiseHit(t, 0.05, 'highpass', 5000, 0.7, gain * (0.008 + 0.014 * r), hh(Math.round(t * 100), 6) - 0.5); } };
  rainBed(T.rain - 0.3, Tq - 0.05, 1);
  for (const o of OBJ) { for (let t = 8; t < Tb; t += 1 / 24) if (objConf(o, t) < 0.33) { noiseHit(t, 0.35, 'bandpass', 300, 2, 0.06, 0); blip(t, 330, 160, 0.4, 0.05, 0); break; } }
  // the droplet echo: out, back, ghosts, and the fading car
  const EP = [[0.4, 1.0], [3.6, 0.5], [6.0, 0.45], [8.2, 0.2]]; EP.forEach(([d, v]) => { blip(T.lidar + d, 900, 2400, 1.1, 0.04 * v, -0.2); blip(T.lidar + d + 1.1, 2400, 1000, 1.1, 0.03 * v, 0.2); });
  blip(T.lidar + 3.6, 1800, 1200, 0.3, 0.05, 0); blip(T.lidar + 4.3, 400, 200, 0.4, 0.05, 0);
  for (let i = 0; i < 6; i++) blip(T.lidar + 5.2 + i * 0.7 + 0.6, 500 - i * 30, 260, 0.2, 0.035, (i % 2 ? 0.3 : -0.3));
  // the fog number counts down
  for (let t = T.fog + 1.7; t < T.fog + 3.3; t += 0.1) blip(t, 1500 - (t - T.fog) * 160, 1400 - (t - T.fog) * 160, 0.04, 0.02, 0);
  sweep(T.lidar, T.fog + 4, 0.012, 800, 5000, 0);
  // silence from Tq to Tb (nothing scheduled), then the one hit
  to = 'm';
  chime(Tb, [nz('A3'), nz('E4'), nz('A4')], 0.18); sub(Tb, 0.6);
  to = 's';
  for (let k = 0; k < 8; k++) noiseHit(Tb + k * 0.06, 0.05, 'bandpass', 400 + 2400 * hh(k, 3), 3, 0.1 * (1 - k / 9), hh(k, 4) - 0.5);
  to = 'm';
  pad(Tb + 0.05, T.thesis + 0.3, ['A2', 'E3', 'A3'], 0.04, { cut: 700, att: 0.1, rel: 0.9 });
  to = 's';
  rainBed(Tb + 1.0, T.callback, 0.5);
  // the fixes
  [2.4, 2.8, 3.2, 3.6].forEach((d, i) => blip(T.thesis + d, 520, 330, 0.18, 0.045, -0.4 + i * 0.27));
  blip(T.radar, 600, 1800, 0.3, 0.05, 0); [0.4, 0.75, 1.1].forEach((d) => blip(T.radar + d, 1200, 1800, 0.12, 0.04, d - 0.7));
  noiseHit(T.radar + 2.5, 0.8, 'bandpass', 1200, 0.8, 0.02, 0);
  blip(T.l1550, 700, 2100, 0.3, 0.05, 0.2); [0.6, 1.0, 1.4].forEach((d) => blip(T.l1550 + d, 900, 1400, 0.12, 0.04, 0.3));
  to = 'm';
  pad(T.thermal, T.clean, ['A3', 'E4', 'A4'], 0.026, { att: 0.5, rel: 0.3, cut: 1100 });
  to = 's';
  for (let t = T.clean + 1.2; t < T.clean + 2.5; t += 0.1) noiseHit(t, 0.05, 'highpass', 6000, 0.7, 0.03, 0);
  sweep(T.clean + 2.55, T.clean + 3.6, 0.03, 400, 2500, 0);
  to = 'm';
  chime(T.clean + 3.7, [nz('E5'), nz('A5')], 0.08);
  // callback: the tracks return one by one, then the resolve
  pad(T.callback, T.card, ['A3', 'C4', 'E4'], 0.03, { att: 1.5, rel: 0.4, cut: 1100 });
  to = 's';
  [3.7, 4.3, 4.9].forEach((d, i) => { blip(T.callback + d, 880 * 1.25 ** i, 1320 * 1.25 ** i, 0.14, 0.05, -0.3 + 0.3 * i); });
  to = 'm';
  pad(T.callback + 4.9, T.card, ['C4', 'E4', 'G4', 'C5'], 0.04, { att: 0.3, rel: 0.4, cut: 1500 });
  chime(T.card, [nz('A5'), nz('E6'), nz('A6')], 0.08); sub(T.card, 0.12);
  pad(T.card, DURATION + 0.4, ['A3', 'E4', 'A4', 'C5'], 0.014, { att: 0.05, rel: 0.8, send: 0.5, cut: 1400 });
