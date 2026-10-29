  // =====================================================================
  //  SCORE BODY — inside buildScore() (kit/score-head.js). to = 'm' (music) or 's' (sfx).
  //  pad(t0, t1, ['D3', 'A3'], peak, { cut, att, rel, send }) · pluck(t, freq, vel, pan, dur, bright, send) · chime · blip ·
  //  noiseHit(t, dur, type, freq, q, vel, pan) · sweep(t0, t1, vel, f0, f1, pan) · riser(t0, t1, vel) · drone(t0, t1, freq, peak)
  // =====================================================================
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  // the satellite: a low, patient pad under the lowest point and the cross-section
  pad(0.0, EB[2], ['D2', 'A2', 'D3'], 0.03, { type: 'triangle', cut: 700, att: 2.0, rel: 1.5, send: 0.3 });
  [cu.section + 0.2, cu.section + 2.0, cu.section + 3.9].forEach((t, i) => pluck(t, nz(['D4', 'A4', 'D5'][i]), 0.12, 0.2 - i * 0.2, 1.2, 2000, 0.4));
  // Jeremy: a bouncy motif, the polders with a soft pad
  pad(EB[2], EB[3], ['G2', 'D3', 'G3'], 0.035, { cut: 900, att: 0.3, rel: 0.6, send: 0.25 });
  for (let i = 0; i < 8; i++) pluck(EB[2] + 0.5 + i * 2.2, nz(['G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', 'E4'][i]), 0.1, i % 2 ? 0.25 : -0.25, 0.5, 2600, 0.3);
  pad(EB[3], EB[4], ['A2', 'E3', 'A3'], 0.03, { type: 'triangle', cut: 800, att: 1.5, rel: 1.0, send: 0.3 });
  chime(VT('pol_c'), [nz('A4'), nz('C5'), nz('E5')], 0.08);
  // the Afsluitdijk and the North Sea: a stab when the sea walks in
  pad(EB[4], EB[5], ['D2', 'A2', 'E3'], 0.035, { cut: 800, att: 0.5, rel: 0.8, send: 0.25 });
  to = 's';
  noiseHit(VT('ns_a'), 0.3, 'lowpass', 300, 1, 0.4, 0);
  to = 'm';
  // 1953: a low drone, a riser into the flood, silence before the words that say never again
  drone(EB[5], EB[6], nz('D1'), 0.05);
  to = 's';
  riser(VT('st_b') - 2.0, VT('st_b') + 4.0, 0.012);
  noiseHit(VT('st_b') + 4.0, 0.6, 'lowpass', 220, 1, 0.5, 0);
  to = 'm';
  // Delta Works: a bright pad, a chime at the gates
  pad(EB[6], EB[7], ['D3', 'A3', 'D4'], 0.04, { cut: 1300, att: 0.6, rel: 0.8, send: 0.3 });
  chime(VT('dw_c') + 0.2, [nz('D5'), nz('F5'), nz('A5')], 0.1);
  // the twist: a rising sweep
  to = 's';
  sweep(VT('tw_b') - 0.4, VT('tw_b') + 3.0, 0.01, 300, 1400, 0);
  to = 'm';
  pad(EB[7], EB[8], ['As2', 'F3', 'As3'], 0.03, { cut: 900, att: 1.0, rel: 1.0, send: 0.3 });
  // hope: a major chord that opens up, on the sand and the square
  pad(EB[8], EB[9], ['D3', 'A3', 'Fs4', 'D4'], 0.045, { cut: 1500, att: 0.8, rel: 1.2, send: 0.35 });
  chime(VT('ho_a'), [nz('D4'), nz('Fs4'), nz('A4')], 0.09);
  chime(VT('ho_e'), [nz('D5'), nz('Fs5'), nz('A5')], 0.09);
  // the question and the channel card
  pad(EB[9], DURATION, ['D2', 'A2', 'D3'], 0.03, { type: 'triangle', cut: 800, att: 1.5, rel: 2.0, send: 0.3 });
  to = 's';
  chime(EB[10], [nz('D5'), nz('A5')], 0.12);
