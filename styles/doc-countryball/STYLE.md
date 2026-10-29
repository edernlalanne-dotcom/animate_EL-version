# doc-countryball

A two-part look for a factual explainer: a satellite documentary (the map drawn in code, no imagery), then countryball comedy (round nations with flag fills, faces, stick limbs). Narration subtitles are drawn on screen, lit word by word from the voice timing.

## Rules
- **Satellite:** deep sea (`DC.sea`), land in olive, polder fields as a grid of cells with canal lines, towns as small grey clusters, dike-coloured coastline. Overlays are white or cream labels on dark boxes. Camera pushes ease in (`push`).
- **Countryball:** one flag per nation (`flag: 'nl'` = red / white / blue stripes). Black 5px outline. Eyes with pupils that look, blinks every ~1.3 s, a face (`happy`, `calm`, `worried`, `angry`, `shock`). Arms are straight black sticks at a given angle; legs are two lines below.
- **Colour means one thing:** red is sea level and danger; yellow is a key warning label; blue is water.
- **Numbers get a card:** `dcStat` puts one number and one line on a paper card, pops in on the voice line that says it.
- **Subtitles:** one line of narration at a time, bottom of the frame, words lit as they are spoken.

## Frame checklist
1. Every satellite frame shows water and land, and one red or yellow thing that matters.
2. Every countryball frame has at least one face looking at something and one moving limb.
3. Text is 36px or larger on screen, and sits in a box when it sits over the map.
4. Nothing important sits under the subtitle box (bottom 150px).
5. The sea-level cross-section: the red line at sea level, the ground 6.7 m below it, the two-storey house roof on the line.

## Kit API (`kit.js`)
- Map: `dcSatellite()`, `dcPin(lon, lat, t0)`, `dcXY(lon, lat)` (world coords), `dcLabelAt(lon, lat, text, t0)`, `dcHud(lines)`.
- Countryball: `dcBall(x, y, r, { flag | fill, face, look, hat, arms, legs, key })`, `dcWindmill`, `dcDike`, `dcHouse`, `dcCloud`, `dcRain`.
- Text: `dcTitle(text, x, y, size, color, t0, { align, box, weight })`, `dcStat(big, small, t0, x, y)`, `dcSection(alpha, mode)` (the cross-section).
- Subtitles: `dcSubtitles()` in `STYLE.post`, from `VOICE`.

## Honesty about the look
The map is drawn from approximate outlines (`DC_NL`, `DC_EU`, `DC_IJM`), not from satellite imagery. It shows the shape of the country, the polders and the coast; it is not survey-accurate. The barrier and dam lines are placed by eye.

## Proven on
`pieces/netherlands-sea/` (9:00, 16:9): the lowest-point zoom and the cross-section, Jeremy and the Netherlands, the polder pumping, the 1953 storm, the Delta Works gates, the rising-sea chart, the hope sequence, the closing question and the channel card.
