  // SCORE BODY — How offshore wind turbines are assembled at sea. Low industrial pad, pulses, steel hits.
  const T = TIMELINE;
  const S = (k, dt = 0) => SC[k][0] + dt;
  to = 'm';
  const bed = [['D2', 'A2', 'D3'], ['D2', 'A2', 'F3'], ['A1', 'E2', 'A2'], ['D2', 'A2', 'D3'], ['F2', 'C3', 'A3'], ['D2', 'A2', 'Fs4']];
  const HIT = S('jack', 9.4);   // the hull clears the waves: the pad drops out just before it, so the hit lands on silence
  ['open', 'found', 'jack', 'lift', 'blade', 'farm'].forEach((k, i) => {
    const o = { type: 'triangle', cut: 700 + i * 140, att: 0.5, rel: 0.5, send: 0.4 };
    if (k === 'jack') { pad(SC[k][0], HIT - 1.0, bed[i], 0.035, o); pad(HIT + 0.05, SC[k][1] + 0.4, bed[i], 0.035, { ...o, att: 0.2 }); } else pad(SC[k][0], SC[k][1] + 0.4, bed[i], 0.035, o);
  });
  for (let t = 0.5; t < SC.farm[1]; t += BEAT * 2) if (!(t > HIT - 1.2 && t < HIT + 0.05)) bass(t, nz(['D2', 'D2', 'A1', 'D2'][Math.floor(t / (BEAT * 2)) % 4]), 0.06);
  // the payoff chord when the farm opens out
  pad(S('farm', 3.0), SC.farm[1] + 0.5, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.05, { cut: 2000, att: 0.8, rel: 0.6, send: 0.5 });
  to = 's';
  // monopile hammer blows (scene 2 local 4.9 + 0.6k)
  for (let i = 0; i < 7; i++) { const t = S('found', 4.9 + i * 0.6); noiseHit(t, 0.28, 'bandpass', 220, 1.5, 0.12, 0, 0.25, 90); blip(t, 140, 55, 0.18, 0.08); }
  // the legs touch down and the hull rises: silence, then the loudest hit
  sweep(S('jack', 5.1), S('jack', 5.6), 0.01, 300, 80, 0);
  noiseHit(S('jack', 7.9), 0.5, 'lowpass', 200, 0.8, 0.12, 0, 0.3, 60); sub(S('jack', 8.0), 0.2);
  riser(S('jack', 8.2), S('jack', 9.2), 0.03);
  sub(S('jack', 9.4), 0.38); noiseHit(S('jack', 9.4), 0.9, 'lowpass', 400, 0.7, 0.2, 0, 0.5, 70);
  // crane motors and flange clangs (scene 4)
  for (const [a, b] of [[2.2, 3.6], [7.4, 8.2], [11.4, 12.2], [15.3, 16.3]]) sweep(S('lift', a * 0.8), S('lift', b * 0.8), 0.012, 180, 260, 0);
  for (const t of [6.1, 10.3, 14.3, 18.6].map((x) => x * 0.8)) { noiseHit(S('lift', t), 0.2, 'bandpass', 1800, 4, 0.08, 0, 0.1, 900); blip(S('lift', t), 700, 300, 0.12, 0.05); }
  // wind swell for the gust (scene 5) and the bolts
  noiseHit(S('blade', 7.4), 3.4, 'bandpass', 700, 0.6, 0.05, 0, 0.3, 1600);
  for (const t of [13.4, 15.0, 15.7]) { noiseHit(S('blade', t), 0.2, 'bandpass', 2000, 4, 0.07, 0, 0.1, 1000); }
  // power: a rising shimmer along the cable
  sweep(S('farm', 4.6), S('farm', 8.4), 0.012, 400, 2600, 0);
  chime(S('farm', 8.8), [880, 1320, 1760], 0.05);
