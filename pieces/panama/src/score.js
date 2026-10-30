  // SCORE BODY — Panama locks, fun pass. A low drone and water in the cold open, a horn as the globe dissolves into the lock,
  // an alarm and a cable twang at the drift, a drumroll for the guess, dings on the counter, silence before the hit that opens the new locks.
  const T = TIMELINE, q = T.cues, V = (id) => VOICE.lines.find((l) => l.id === id), fr = (id, x) => V(id).t0 + (V(id).t1 - V(id).t0) * x;
  const quietA = V('lift').t1 - 1.9, quietB = V('lift').t1 + 0.25;   // the score goes silent before the reveal
  to = 'm';
  drone(0.0, quietA, 55.0, 0.07, { att: 0.6, rel: 0.5 });
  drone(0.0, quietA, 82.41, 0.04, { att: 1.5, rel: 0.5 });
  drone(quietB, END_T - 0.1, 55.0, 0.09, { att: 0.3, rel: 1.2 });
  drone(quietB, END_T - 0.1, 82.41, 0.06, { att: 0.3, rel: 1.2 });
  pad(0.1, V('globe').t0 + 1.0, ['D3', 'A3'], 0.02, { type: 'triangle', cut: 800, att: 0.8, rel: 0.6, send: 0.5 });
  pad(V('box').t0 - 0.2, V('mules').t0 + 0.2, ['D3', 'F3', 'A3'], 0.018, { type: 'triangle', cut: 700, att: 1.0, rel: 0.6, send: 0.5 });
  pad(V('mules').t0 + 1.0, V('gates').t0 + 0.2, ['A2', 'E3', 'A3'], 0.026, { type: 'sawtooth', cut: 520, att: 1.0, rel: 0.5, send: 0.4 });   // the mules' motors
  pad(V('water').t0, quietA, ['D3', 'F3', 'A3'], 0.022, { type: 'triangle', cut: 900, att: 1.0, rel: 0.4, send: 0.2 });
  pad(quietB, V('payoff').t0 - 0.3, ['D3', 'A3', 'D4'], 0.05, { type: 'triangle', cut: 1100, att: 1.0, rel: 0.6, send: 0.6 });
  pad(V('payoff').t0 - 0.2, END_T - 0.05, ['D3', 'A3', 'Fs4'], 0.034, { type: 'triangle', cut: 1500, att: 1.0, rel: 1.0, send: 0.7 });
  to = 's';
  // a ship's horn: two low sawtooth tones
  const horn = (t, d) => [98, 123.5].forEach((f) => { const o = osc('sawtooth', f, t, t + d + 0.1), lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.frequency.value = 700; env(g, t, 0.06, 0.09, d); o.connect(lp); lp.connect(g); out(g, 0, 0.3); });
  // cold open: a punch, water along the hull
  sub(0.12, 0.4);
  noiseHit(0.05, 6.0, 'lowpass', 520, 0.6, 0.03, 0, 0.15, 260);
  // the globe: a sweep that rises with the zoom, a ping at the canal, a horn and a thud as the view dissolves into the drone shot
  sweep(G0 + GL_T.zoom0, G1 + 0.2, 0.06, 180, 3200);
  chime(G0 + GL_T.zoom0 + 0.7, [nz('A4'), nz('E5')], 0.05);
  horn(G1 - 0.9, 1.1);
  sub(G1 - 0.1, 0.4);
  // creaks
  for (const t of [fr('box', 0.15), fr('box', 0.5), fr('box', 0.85), fr('park', 0.5)]) sweep(t, t + 0.9, 0.018, 160, 300, (t * 7) % 2 - 1);
  // the drift: a groan as the gap closes, an alarm at the peak, then the cables taking up the load with a twang
  sweep(fr('mules', 0.10), fr('mules', 0.30), 0.03, 120, 360, -0.3);
  for (let i = 0; i < 4; i++) blip(fr('mules', 0.24) + i * 0.16, 1760, 1760, 0.09, 0.05);
  noiseHit(fr('mules', 0.38), 0.9, 'bandpass', 700, 3, 0.03, 0.2, 0.2, 300);
  pluck(fr('mules', 0.38), 98, 0.22, 0.2, 0.9, 1800, 0.3);
  for (const x of [0.5, 0.7, 0.85]) noiseHit(fr('mules', x), 0.6, 'bandpass', 900, 3, 0.012, ((x * 9) % 2) - 1, 0.2, 400);
  // the gates: a thud and a rumble, then a drumroll under the question
  sub(V('gates').t0 + 0.5, 0.3); noiseHit(V('gates').t0 + 0.1, 1.6, 'lowpass', 200, 0.7, 0.05, 0, 0.1, 70);
  { let t = V('guess').t0, dt = 0.12; while (t < V('water').t0 + 0.15) { noiseHit(t, 0.05, 'bandpass', 240, 1, 0.06, ((t * 9) % 2) - 1); t += dt; dt = Math.max(0.03, dt * 0.93); } }
  noiseHit(V('water').t0 + 0.2, 0.9, 'highpass', 6000, 0.7, 0.05, 0, 0.3);
  // the fill: a rush, and a ding at each fifth of the counter
  noiseHit(V('water').t0 + 0.1, 4.0, 'bandpass', 650, 0.7, 0.045, 0, 0.1, 1700);
  sweep(V('water').t0 + 0.2, fr('water', 0.55), 0.035, 250, 2200);
  { const a = V('water').t0 + 0.2, b = fr('water', 0.55); for (let k = 1; k <= 5; k++) { let lo = a, hi = b; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (EZ.io(seg(m, a, b)) < k / 5) lo = m; else hi = m; } blip(hi, 880 + k * 110, 880 + k * 110, 0.14, 0.05); } }
  // the loudest hit sits in the pause before the new locks, after two seconds of silence
  sub(quietB, 1.0); noiseHit(quietB, 0.5, 'lowpass', 1400, 0.7, 0.12, 0, 0.3, 200); chime(quietB + 0.02, [nz('D4'), nz('A4'), nz('D5')], 0.14);
  noiseHit(V('neo').t0 + 1.0, 4.5, 'lowpass', 420, 0.6, 0.025, 0, 0.1, 200);
  for (const t of [fr('neo', 0.3), fr('neo', 0.7)]) sweep(t, t + 0.9, 0.016, 160, 300, (t * 5) % 2 - 1);
  // the ship leaves with a horn
  horn(V('payoff').t0 + 0.9, 1.0);
  // the subscribe card
  chime(END_T + 0.12, [nz('D5'), nz('A5')], 0.05);
