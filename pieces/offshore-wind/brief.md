# How Offshore Wind Turbines Are Assembled at Sea

Channel: World in the Making. Format 16:9, 1920x1080, 24 fps, about 93.75s including a 2s end card.
Style: `offshore` (styles/offshore/kit.js), 2.5D cinematic industrial: layered vector side views, gradient light, cyan infographics.
Voice: ElevenLabs "Jeremy - Casual Guy Next Door" (voice_id 5gaEGrWSk4v20HMfIhgC), model eleven_v4, one take per line.
Story: a ship stands on the seabed, lifts itself above the waves, and builds a turbine on top of a monopile.

| scene | start | what |
|---|---|---|
| 1 Question | 0.00 | turbine at scale, pull back to the far shore, height marker |
| 2 Foundation | 12.25 | monopile lowered and hammered into the seabed (cutaway), transition piece and first tower section |
| 3 The ship | 26.50 | jack-up arrives, legs down, hull rises above the waves |
| 4 Assembly | 42.50 | tower sections then nacelle, flange close-ups |
| 5 Blade | 58.50 | one blade, a gust, the weather window, three blades |
| 6 Power | 75.00 | wind farm, seabed cables, substation, shore |
| 7 End card | 91.75 | assets/subscribe.png, 2s |

Cuts land on the 8th grid. The voice sets the scene starts (see src/head.html).

## Claims on screen and sources
- "OVER 200 m TALL": Vestas V236-15.0 MW has a 236 m rotor (vestas.com/en/energy-solutions/offshore-wind-turbines/V236-15MW), so the tip stands above 200 m.
- Jack-up behaviour (legs lowered to the seabed, hull raised clear of the waves, stable crane platform): CM Energy "Uses of Jacking Systems in Offshore Wind Farms", Renewable and Sustainable Energy Reviews "Installation of offshore wind turbines: A technical review" (sciencedirect S1364032120308601).
- Monopile foundations installed by jack-up or heavy-lift vessel, transition piece, tower, nacelle, blades: same technical review.
- No other numbers are shown. The wind gauge and "lift limit" are schematic, not a real limit.
- Fixed-bottom only. Floating turbines are usually assembled at port and towed out.

## Open items
- assets/subscribe.png is in place (the user's badge, 2000x2000). The end card shows it for 2s.
- Word timings are estimated (the faster-whisper model could not be downloaded through the proxy). Scenes cue on line starts only.
- 9:16 Shorts layout not built.
- Atlas is an invented hard-hat mascot. Replace with the real design if one exists.
