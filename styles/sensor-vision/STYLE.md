# Sensor vision

A split-screen night drive for explainers about vehicle perception. Top panel: the dashcam a human would see. Bottom panel: the same road as the car senses it (LiDAR points, detection boxes, a HUD).

## Colour means one thing
| colour | meaning |
|---|---|
| white points | LiDAR (905 nm) returns |
| green | tracked object |
| red | lost tracking, blinded |
| cyan | radar |
| violet | 1550 nm LiDAR |
| orange | thermal |

## Rules
- Both panels use the same projection, so a box in the bottom panel sits where the car is in the top panel.
- Weather is one number per sensor (`D`, 0 to 1). Range, point loss, scatter and confidence all derive from it.
- Panels sit inside x 40-1040, y 250-1500 on 1080x1920.
- Motion on 1s (24 fps). No random: points use an integer hash of index and frame.
- Proven on: one 77s explainer (this piece).
