  // SCORE BODY — cabin-air v2. Pads under the voice, a drone for the turn, silence before the answer, sfx on dives and stamps.
  const T = TIMELINE, VLn = (id) => VOICE.lines.find((l) => l.id === id);
  to = 'm';
  const sec = (a, b, ch, pk, o = {}) => pad(a, b, ch, pk, Object.assign({ cut: 900, att: 0.8, rel: 0.8, send: 0.4 }, o));
  sec(0, ERA_T[3], ['D3', 'A3', 'D4'], 0.04);
  sec(ERA_T[3] - 0.4, ERA_T[7], ['D3', 'A3', 'Fs4'], 0.045, { cut: 1100 });
  drone(ERA_T[7], VLn('warn').t1, nz('D2'), 0.05);
  riser(VLn('warn').t0 + 0.6, WN.fo, 0.03);
  sec(ERA_T[8] - 0.1, ERA_T[9], ['E3', 'A3', 'E4'], 0.045, { cut: 1100 });
  for (let t = ERA_T[3]; t < ERA_T[7]; t += BEAT) pluck(onBeat(t), nz(['D4', 'A3', 'Fs4', 'A3'][Math.round((t - ERA_T[3]) / BEAT) % 4]), 0.05, 0, 0.3, 1600, 0.3);
  sec(ERA_T[9] - 0.1, ERA_T[10], ['D3', 'A3', 'Fs4', 'D5'], 0.06, { cut: 1500, att: 0.4 });
  chime(ERA_T[9], [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.2);
  to = 's'; sub(ERA_T[9], 0.5); noiseHit(ERA_T[9], 0.35, 'lowpass', 900, 1, 0.3);
  for (const tb of ERA_T.slice(1, -1)) { sweep(tb - 0.32, tb + 0.02, 0.03, 300, 2400, 0); sweep(tb, tb + 0.5, 0.02, 2400, 400, 0); }
  sub(SL.s, 0.07); noiseHit(SL.s, 0.12, 'lowpass', 500, 1, 0.05);
  noiseHit(SL.cap + 0.3, 0.12, 'lowpass', 900, 1, 0.06); sub(SL.cap + 0.3, 0.05);
  sweep(B7.nb, B7.nb + 0.4, 0.02, 1200, 200, 0);
  for (let i = 0; i < 4; i++) blip(WN.ten + i * 0.5, 880, 880, 0.3, 0.07);
  noiseHit(WN.fo + 0.05, 0.5, 'bandpass', 1800, 1, 0.1);
  for (const t of [VV.o, VV.c]) noiseHit(t, 0.25, 'bandpass', 700, 1, 0.05);
  blip(VW('cta', 'subscribe') + 0.5, 1200, 800, 0.1, 0.1);
