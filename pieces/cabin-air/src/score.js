  // SCORE BODY — cabin-air. Restrained pads and soft pulses under the voice, sfx on the dives and the stamps.
  const T = TIMELINE, VLn = (id) => VOICE.lines.find((l) => l.id === id);
  to = 'm';
  const sec = (a, b, ch, pk, o = {}) => pad(a, b, ch, pk, Object.assign({ cut: 900, att: 0.8, rel: 0.8, send: 0.4 }, o));
  sec(0, ERA_T[3], ['D3', 'A3', 'D4'], 0.04);
  sec(ERA_T[3] - 0.5, ERA_T[5], ['D3', 'A3', 'Fs4'], 0.045, { cut: 1100 });
  sec(ERA_T[5] - 0.5, ERA_T[8], ['E3', 'A3', 'E4'], 0.045, { cut: 1100 });
  sec(ERA_T[8] - 0.5, ERA_T[9], ['D3', 'A3', 'Fs4', 'D5'], 0.05, { cut: 1300 });
  // the turn: a low drone swells, then everything drops out for the silence before the payoff
  drone(ERA_T[9], VLn('warn').t1, nz('D2'), 0.05);
  riser(VLn('warn').t0 + 0.8, VW('warn', 'fourteen'), 0.03);
  // soft pulse on the grid through the machines
  for (let t = ERA_T[3]; t < ERA_T[9]; t += BEAT) pluck(onBeat(t), nz(['D4', 'A3', 'Fs4', 'A3'][Math.round((t - ERA_T[3]) / BEAT) % 4]), 0.05, 0, 0.3, 1600, 0.3);
  // payoff: a warm chord after the silence
  sec(VLn('payoff').t0 - 0.1, ERA_T[11], ['D3', 'A3', 'Fs4', 'D5'], 0.06, { cut: 1500, att: 0.4 });
  chime(ERA_T[10], [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.2);
  to = 's'; sub(ERA_T[10], 0.5); noiseHit(ERA_T[10], 0.35, 'lowpass', 900, 1, 0.3);
  for (const tb of ERA_T.slice(1, -1)) { sweep(tb - 0.32, tb + 0.02, 0.03, 300, 2400, 0); sweep(tb, tb + 0.5, 0.02, 2400, 400, 0); }
  sub(TB.c, 0.07); noiseHit(TB.c, 0.12, 'lowpass', 500, 1, 0.05);                  // the seal thump
  noiseHit(LV.s2 + 0.25, 0.12, 'lowpass', 900, 1, 0.06); sub(LV.s2 + 0.25, 0.05);  // the cap stamp
  sweep(B7.nb, B7.nb + 0.4, 0.02, 1200, 200, 0);
  for (let i = 0; i < 4; i++) blip(WN.ten + i * 0.5, 880, 880, 0.3, 0.07);          // the horn
  noiseHit(WN.fo + 0.1, 0.5, 'bandpass', 1800, 1, 0.1);                              // masks drop
  for (const t of [PO.v, PO.f, PO.sip]) blip(t, 700, 1500, 0.08, 0.06);
  blip(VW('cta', 'subscribe') + 0.5, 1200, 800, 0.1, 0.1);
