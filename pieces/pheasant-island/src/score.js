  // SCORE BODY — Pheasant Island. Calm map music under a voice-over: soft pad, sparse plucks, small ticks on the facts.
  // Silence before the answer, then the loudest hit.
  const T = TIMELINE, q = T.cues, pay = q.payoff, hush = T.acts[4].t0 - 0.3;
  to = 'm';
  const chords = [['D3', 'A3', 'D4'], ['Bb2', 'F3', 'D4'], ['C3', 'G3', 'E4'], ['A2', 'E3', 'Cs4']];
  const barLen = BEAT * 8;
  for (let t0 = 0, i = 0; t0 < hush - 1.0; t0 += barLen, i++) pad(t0, Math.min(t0 + barLen + 0.3, hush), chords[i % 4], 0.05, { cut: 900, att: 0.8, rel: 0.8 });
  const prog = [['D4', 'F4', 'A4', 'F4'], ['Bb3', 'D4', 'F4', 'D4'], ['C4', 'E4', 'G4', 'E4'], ['A3', 'Cs4', 'E4', 'A4']];
  for (let e = 0; e * E8 < hush - 0.4; e++) {
    if (e % 4 === 3) continue;   // breathing room
    const ch = prog[Math.floor(e / 8) % 4];
    pluck(e * E8, nz(ch[e % 4]), 0.07, e % 2 ? 0.25 : -0.25, 0.3, 2200, 0.3);
  }
  for (let b = 0; b * BEAT < hush - 0.4; b += 2) bass(b * BEAT, nz(['D2', 'Bb1', 'C2', 'A1'][Math.floor(b / 8) % 4]), 0.1);
  to = 's';
  // map zoom and the morphs
  sweep(VL('open2').t0 + 0.1, M[0] - MD, 0.03, 300, 2600, 0);
  for (const m of M) sweep(m - MD, m + MD, 0.025, 2400, 500, 0);
  // pins, labels and facts
  noiseHit(M[0] - 0.1, 0.12, 'lowpass', 600, 1, 0.1); sub(M[0] - 0.1, 0.08);
  for (const t of [VT('where', 'Hendaye'), VT('where', 'Irun')]) blip(t, 700, 1500, 0.06, 0.05);
  for (let i = 0; i < 12; i++) blip(VT('open3', 'owns') + 0.1 + i * 0.07, 1800 + i * 60, 2000, 0.015, 0.02);   // the ring ticks on
  sub(VT('sign', 'seventh'), 0.12); noiseHit(VT('sign', 'seventh'), 0.2, 'lowpass', 900, 1, 0.15);              // 7 Nov slam
  chime(VT('condo', 'condominium'), [nz('D5'), nz('F5'), nz('A5')], 0.07);
  for (const t of [VT('spain', 'Spain'), VT('france', 'France')]) { blip(t, 500, 1200, 0.08, 0.07); }
  sub(VT('only', 'moves'), 0.1);
  sub(VT('today1', 'closed'), 0.1);
  for (let i = 0; i < 8; i++) blip(VT('size', 'about') + i * 0.12, 2200, 2400, 0.012, 0.02);                    // measure ticks
  for (const t of [VT('why', 'Constance'), VT('why', 'Moselle')]) blip(t, 700, 1500, 0.06, 0.05);
  // the answer, after the silence
  to = 's'; sub(pay, 0.4); noiseHit(pay, 0.3, 'lowpass', 900, 1, 0.25);
  to = 'm'; chime(pay, [nz('D5'), nz('F5'), nz('A5'), nz('D6')], 0.1);
  // the gift: full chord, a rising arpeggio and a held bass once the answer lands
  to = 'm';
  pad(pay, DURATION, ['D3', 'A3', 'D4', 'Fs4'], 0.09, { cut: 1800, att: 0.15, rel: 1.2 });
  pad(pay, DURATION, ['D2', 'A2'], 0.07, { cut: 500, att: 0.1, rel: 1.2 });
  const arp = ['D4', 'Fs4', 'A4', 'D5', 'A4', 'Fs4'];
  for (let e = 0; pay + e * E8 < DURATION - 0.8; e++) pluck(pay + e * E8, nz(arp[e % 6]), 0.08, e % 2 ? 0.3 : -0.3, 0.4, 3200, 0.35);
  for (let b = 0; pay + b * BEAT < DURATION - 0.8; b++) bass(pay + b * BEAT, nz(b % 4 === 2 ? 'A1' : 'D2'), 0.09);
