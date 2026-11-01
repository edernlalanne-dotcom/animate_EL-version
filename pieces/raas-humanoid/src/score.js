  // SCORE BODY — Rent or buy a humanoid robot. Voice-led: a calm pad bed that tenses on CapEx, brightens on OpEx,
  // fills out on the GXO proof, DROPS OUT for the doubt, then one stab on the tipped scale in the pause before a3.
  const T = TIMELINE, S0 = SHOT_T0, hitT = Te('a2') + 0.72;
  to = 'm';
  // ---- the pad bed, by shot (one chord per shot, each ending where the next starts)
  pad(0.0, S0[2] + 0.3, ['D3', 'A3', 'E4'], 0.026, { type: 'triangle', cut: 1100, att: 1.2, rel: 0.5, send: 0.5 });       // hook + context: open, a question
  pad(S0[2], S0[3] + 0.3, ['D3', 'F3', 'A3', 'C4'], 0.03, { type: 'triangle', cut: 900, att: 0.6, rel: 0.5, send: 0.4 });   // CapEx: tense
  drone(S0[2], S0[3] + 0.2, 55, 0.028, { att: 0.8, rel: 0.5 });
  pad(S0[3], S0[4] + 0.3, ['D3', 'A3', 'Fs4'], 0.03, { type: 'triangle', cut: 1500, att: 0.6, rel: 0.5, send: 0.5 });     // OpEx: lighter
  pad(S0[4], S0[5] + 0.3, ['D3', 'A3', 'E4', 'B4'], 0.03, { type: 'triangle', cut: 1700, att: 0.6, rel: 0.4, send: 0.5 });  // upgrades: rising
  pad(S0[5], S0[6] + 0.2, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.027, { type: 'sawtooth', cut: 1300, att: 0.5, rel: 0.3, send: 0.45 });   // proof: the fullest
  for (let t = S0[5] + 0.4, i = 0; t < S0[6] - 0.2; t += E8 * 1.5, i++) pluck(t, nz(['D4', 'Fs4', 'A4', 'Fs4', 'E4', 'A4'][i % 6]), 0.04, ((i % 5) - 2) * 0.15, 0.3, 2400, 0.3);
  for (let t = S0[5] + 0.2; t < S0[6] - 0.2; t += BEAT) bass(t, nz('D2'), 0.04);
  // ---- the doubt: the bed falls away to a thin drone, then silence before the hit
  // ---- the payoff: one stab in the pause before a3, then a flat chord that holds
  claudeMotifStab(hitT);
  pad(hitT + 0.05, Te('a4') + 0.4, ['D3', 'A3', 'D4', 'Fs4'], 0.045, { type: 'triangle', cut: 1600, att: 0.05, rel: 0.4, send: 0.5 });
  pad(Te('a4') + 0.3, DURATION + 0.4, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.007, { type: 'triangle', cut: 1800, att: 0.6, rel: 1.4, send: 0.6 });
  function claudeMotifStab(t) {
    for (const [n, v] of [['D3', 0.34], ['A3', 0.3], ['D4', 0.28], ['Fs4', 0.24], ['A4', 0.2]]) pluck(t, nz(n), v, 0, 0.55, 3600, 0.35);
  }
  // ---- sound effects, one per picture event
  to = 's';
  const tick = (t, f = 1400, v = 0.02) => blip(t, f, f * 0.6, 0.03, v);
  // footsteps follow the walk cycle
  for (const [a, b] of WALKS) { let last = Math.floor(heroXat(a) * 0.046 / Math.PI); for (let t = a; t < b; t += 0.02) { const k = Math.floor(heroXat(t) * 0.046 / Math.PI); if (k > last) { last = k; blip(t, 170, 80, 0.05, 0.02, k % 2 ? -0.15 : 0.15); } } }
  // fork
  sweep(Ts('hook') + 0.05, Ts('hook') + 0.5, 0.012, 300, 1800, -0.3); noiseHit(Ts('hook') + 0.55, 0.18, 'lowpass', 600, 0.8, 0.03);
  chime(Wt('hook', 3), [1175, 1760], 0.035);
  // card, invoice
  sweep(Ts('c2') + 0.05, Ts('c2') + 0.55, 0.014, 500, 2600, 0.3); sub(Ts('c2') + 0.6, 0.05); chime(Wt('c2', 4), [880, 1320], 0.03);
  sweep(Ts('c3') + 0.4, Ts('c3') + 0.85, 0.012, 1500, 400, -0.2); noiseHit(Ts('c3') + 0.9, 0.2, 'lowpass', 500, 0.8, 0.035); tick(Ts('c3') + 1.2, 1800, 0.015);
  // vault empties into the crate
  noiseHit(Ts('s1a'), 0.4, 'bandpass', 500, 1.2, 0.03, 0, 0.2, 1500); sub(Ts('s1a') + 0.05, 0.05);
  for (let i = 0; i < 10; i++) { sweep(Ts('s1a') + 0.3 + i * 0.13, Ts('s1a') + 0.3 + i * 0.13 + 0.2, 0.006, 700, 2200, 0.2); tick(Ts('s1a') + 0.3 + i * 0.13 + 0.75, 900 + i * 60, 0.012); }
  sub(Ts('s1a') + 2.4, 0.04);
  // value falls
  sweep(Ts('s1b') - 0.05, Ts('s1b') + 2.3, 0.014, 2200, 260, 0); sub(Ts('s1b') + 2.2, 0.05);
  // OpEx tiles
  noiseHit(Ts('s1c') + 0.1, 0.15, 'lowpass', 400, 1, 0.04); sub(Ts('s1c') + 0.12, 0.04);
  for (let i = 0; i < 4; i++) { const t = Ts('s1c') + 0.35 + i * 0.4 + 0.22; tick(t, 1600, 0.018); chime(t, [1320 + i * 110], 0.012); }
  // the scale
  sweep(Ts('s1d') + 0.2, Ts('s1d') + 0.7, 0.01, 400, 1800); chime(Ts('s1d') + 1.5, [660, 990], 0.03);
  // staircase
  for (let i = 0; i < 5; i++) { const t = Ts('s2a') + 0.15 + i * 0.32; blip(t, 520 + i * 110, 760 + i * 110, 0.12, 0.03, -0.3 + i * 0.15); }
  chime(Ts('s2b') + 0.1, [880, 1320, 1760], 0.03);
  // outdated stamp
  sweep(Ts('s2c') + 0.6, Ts('s2c') + 0.95, 0.01, 1800, 400); sub(Ts('s2c') + 1.2, 0.07); noiseHit(Ts('s2c') + 1.2, 0.15, 'bandpass', 900, 1, 0.03);
  // the swap
  noiseHit(Ts('s2d') + 0.2, 1.5, 'bandpass', 700, 1.2, 0.025, 0, 0.2, 2200); tick(Ts('s2d') + 1.75, 700, 0.03); chime(Ts('s2d') + 1.8, [1175, 1760], 0.03);
  // Georgia
  sweep(Ts('e1') - 0.25, Ts('e1') + 0.25, 0.01, 400, 1600); chime(Wt('e1', 5) + 0.1, [1320, 1980], 0.04);
  // totes and the counter
  for (let k = 0; k < 14; k++) { const t = Ts('e1') + 2.0 + k * 1.3 + 0.65; if (t < Te('e2') + 0.3) tick(t, 600, 0.03); }
  for (let t = Ts('e2') + 0.5; t < Te('e2') - 0.1; t += 0.07) blip(t, 1800 + 900 * smoothstep(t, Ts('e2') + 0.5, Te('e2') - 0.1), 1500, 0.02, 0.006);
  chime(Te('e2') - 0.05, [1175, 1760, 2349], 0.035);
  // NC and TN
  sweep(Ts('e3') + 0.5, Ts('e3') + 1.2, 0.008, 800, 2400); chime(Ts('e3') + 1.05, [1568], 0.035, -0.2); chime(Ts('e3') + 1.5, [1760], 0.035, 0.2);
  // early 2027
  noiseHit(Ts('e4') - 0.1, 0.25, 'highpass', 3000, 0.7, 0.012); sub(Ts('e4') + 0.3, 0.05); chime(Ts('e4') + 0.35, [880, 1175], 0.025);
  // the misconception and the zero
  noiseHit(Wt('a1', 6), 0.2, 'bandpass', 1400, 1, 0.015, -0.2); noiseHit(Wt('a1', 6) + 0.18, 0.2, 'bandpass', 1200, 1, 0.015, 0.2); sub(Wt('a1', 6) + 0.35, 0.02);
  sweep(Ts('a2') + 0.45, Ts('a2') + 0.8, 0.005, 1500, 300); sub(Ts('a2') + 0.85, 0.025);
  // the payoff: hit, then the scale tips
  sub(hitT, 0.3); noiseHit(hitT, 0.35, 'lowpass', 1800, 0.7, 0.12, 0, 0.3); chime(hitT + 0.02, [1175, 1760, 2349], 0.08);
  sweep(Ts('a3') + 0.8, Ts('a3') + 1.3, 0.008, 300, 900);
  // risk flies to the vendor
  for (let i = 0; i < 3; i++) { const t = Ts('a4') + 0.5 + i * 0.45; sweep(t, t + 0.8, 0.007, 500, 1800); tick(t + 0.9, 900, 0.025); }
  // the question
  chime(Ts('q') + 0.2, [1175, 1568, 1976], 0.02); chime(Te('q') - 0.1, [587, 880, 1175], 0.012);
