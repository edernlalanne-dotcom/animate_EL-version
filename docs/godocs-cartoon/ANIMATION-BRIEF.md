# Animation brief template: Cartoon Style GoDocs style


This section targets the Animate skill that renders with headless Chromium and ffmpeg. I read its instructions on 1 Nov 2026. I did not run a build.

What the skill does:
- It draws every frame in code on one canvas. Output is one index.html per piece.
- It uses no image, audio or font files. Randomness is seeded, so each render matches.
- It exports mp4 at 9:16, 16:9, 1:1 and 4:5 from one piece.
- The look comes from a style kit: cut-paper, crosshatch, riso, sketchbook, math, pixel, isometric, or a custom kit.
- With a voice-over, the voice sets the clock. Each scene starts about 0.3 s after the previous sentence ends. Cues fire on spoken words.
- ElevenLabs voice takes come from the connector. faster-whisper times every word.
- Music is composed in code on a 120 BPM grid, or taken from a track you supply.
- review.mjs writes contact sheets, a cut grid, a morph grid, a story arc, a text check and a sound check.
- It has cameras (push-in, bump, pan). It joins scenes with shape morphs or hard cuts.
- Its proven length is 60 seconds.

### Tool variables

| Variable | Value |
|---|---|
| [VOICE_TOOL] | ElevenLabs connector. Voice: Jeremy - Casual Guy Next Door. You chose it. |
| [IMAGE_TOOL] | None by default. Animate draws in code. The style kit in D0 replaces image prompts. Option: ElevenLabs image generation for backgrounds, saved in assets/ [I]. |
| [EDITOR] | The Animate export (Chromium and ffmpeg). ffmpeg joins the pieces. |
| [FORMATS] | 9:16 main, 16:9 second. Both come from one piece. |
| [MUSIC] | Composed score in code. Your own track is optional. |

Requirements in this workspace:
- Node 22, ffmpeg 6.1 and the Playwright module are present.
- faster-whisper is missing. Install with pip install --break-system-packages faster-whisper. Without it, word times are estimated.

### D0 Visual style spec: Cartoon Style GoDocs style

Genre: infographic documentary with web-cartoon characters. It is not anime and not a children's cartoon. It explains large history with simple visuals, metaphors and dry jokes.

Relation to the source [I]: the source channel works in the same genre. Originality comes from the original cast, the mood palette sets, the narrator, the thumbnail layout and the history-only scope. Never copy a source character, a source thumbnail or any known channel's mascot.

Build it as a custom style. Slug: godocs-cartoon. Display name: Cartoon Style GoDocs style.
- Start from templates/style/kit.js. The gallery has no cel-shaded vector style.
- Reuse the cut-paper window and morph logic for bridges.
- Look check: draw 2 to 4 frames in 9:16, then the same frames in 16:9. Use a map, a canyon or dam background, a character reaction and a scale gag.
- Save the style after the first piece is approved.

The five parts:

| Part | Rules |
|---|---|
| 1 Genre | Infographic documentary plus web-cartoon. Simple visuals, metaphors and jokes explain big history. |
| 2 Characters | Clean vector characters with anime influence. Large eyes, simple bodies, exaggerated reaction faces. They react and narrate. They are not realistic. |
| 3 Line and color | Bold clean outlines at one weight. No sketchy lines. Saturated color. Cel shading with soft gradients for depth. The palette shifts with the mood of the scene. |
| 4 Backgrounds | Semi-realistic matte-painting scenes: canyons, villages, control rooms, dams. Vector icons and textures sit on top. Detailed enough to feel real, simple enough to read on a phone. |
| 5 Motion | Smooth 2D puppet-rig animation. Dynamic camera: constant pans and zooms. Infographics pop in. Scale gags make numbers stick. |

Characters:
- Hero: a recurring original narrator, the Surveyor. A figure in a hard hat who carries a mustard survey stake. It stays the one constant the eye holds [I].
- Supporting cast: drawn by role and costume. Crowds are simple shapes.
- No likeness of real people. Name a historical person on a label only when the fact flag PERSON is Y.
- Faces appear on characters only. Objects, buildings and machines have no faces.
- Eyes are the largest feature of the face.
- Five face states: neutral, surprise, worry, delight, deadpan. Map them to beats: surprise on the hook, worry on a failure, deadpan on the cost, delight on a success.
- Rig: head, torso, upper and lower arms, upper and lower legs. Each joint rotates by spring. Idle motion: blink and a small bob.
- Mouth opens between the start and end of each spoken word, using the word times in voice.json [I].

Line and color:
- Outline weight is the same on every shape. Divide it by camera zoom. Start at 1 percent of frame height and set it at the look check [I].
- Cel shading: one flat shadow shape on the lower right of each form, from one light at the upper left. Add a soft gradient on large shapes and skies.
- Three mood palettes. Hex values are my starting values [I]. Refine them at the look check.

| Mood | Used for | Colors |
|---|---|---|
| Sunny | Build-up, success, hook | Sun yellow FFC93C, orange F2853A, sky blue 4FB3E8, grass green 5DB75A, cream FFF3D6, ink 1B2433 |
| Neutral | Context, today, close | Cream F4EBD8, slate blue 3F5C7A, olive 7A8A3C, brick B5472E, mustard E0A93B, ink 1B2433 |
| Disaster | Cost, failure, flood | Mist 9AA3AB, slate 5B6770, storm 3A444D, mud 7B6F5E, flood water 6F8794, rust A9503A, ink 161B22 |

- Change palette only across a bridge, never inside a scene.
- Use at most 6 palette colors plus ink in one frame.
- Rust is the only warm accent in the Disaster palette. It marks the cause.
- Mustard marks the reveal in the Neutral palette.

Backgrounds:
- Draw in layers: sky gradient, far silhouette, middle ground, near ground, foreground.
- Add haze between layers so distant layers lose contrast.
- Add a seeded noise texture, cached, and a grain pass in post().
- Put vector icons on top: crane, pipe, gauge, flag, truck. Keep each icon readable at phone width.
- Code cannot match a painted matte background [I]. The look check shows how close it gets.
- Fallback: supply background images you own or have generated, saved in assets/. Draw them with drawAsset and fit cover. Characters, icons and text stay vector on top. Ask me to set this up if the look check fails.

Motion:
- Camera: every scene moves. Use a slow push-in or a pan by default. A text card may hold still.
- Use cameras, bumps and shape morphs from the skill. Scenes with a globe use a rotating orthographic globe drawn in code, with the route on top.
- Infographics pop in with a spring on the cue word. Use the snappy preset for numbers and labels.
- Motion runs on 1s with spring settles. Export with --blur 4 if the motion looks stepped.

Scale gags:
- Give every number scene a scale gag when the number is a size, weight, length or volume.
- Examples: a bus inside a turbine, a tower laid beside a dam, a stack of known objects beside a figure.
- Draw both objects to the same scale. Show both figures in on-screen text.
- Search for the real size of the familiar object. List the source. Fact flag is Y, NUMBER.

Frame checklist for STYLE.md:
- Eyes read at phone size.
- Outline weight is constant.
- The mood palette matches the scene and the palette has at most 6 colors plus ink.
- One focal element. The eye lands on the hero or the figure.
- Text stays inside the safe area in 9:16 and in 16:9.
- Faces appear on characters only.
- Nothing matches a source character, source frame or known mascot.

Thumbnail spec:
- Text: 2 to 3 words, ink on a cream band, sentence case, no exclamation mark, bottom left.
- Focal point: one scene or the Surveyor with a reaction face, at center right, about half the frame.
- Color: one mood palette per thumbnail. No teal water against an orange desert.
- Content: draw the script's own strongest image.
- Check: it must not match the composition of any source thumbnail.
- Thumbnails are 16:9 stills. Draw them with the same style kit and export one frame with tools/still.mjs.

### Story format

- Use F2, chronology with a morph chain. The skill marks it proven.
- Serial-attempt scripts and cause-chain scripts both fit. A year tag counts time on screen.
- Set TIMELINE.format to morph-chain. The review then checks cuts, the morph grid and the story arc.
- A bridge costs 1.2 s by default. Use 0.4 s bridges where the sentence is short.
- The skill's invariants apply: one constant the eye holds (the stake), one meaning per color, silence before the payoff, and an end that returns to the opening image, changed.

### Piece plan for 5 minutes

At 138 words per minute and 17.5 words per sentence, one sentence lasts 7.6 s. A 5-minute video has about 39 scenes. The skill is proven at about 15 scenes. Build four pieces and join them with ffmpeg. Cut at sentence ends.

| Piece | Template slots | Time | Seconds | Scenes |
|---|---|---|---|---|
| P1 | Hook, Context | 0:00 to 1:21 | 81 | 11 |
| P2 | Build, first half | 1:21 to 2:26 | 65 | 9 |
| P3 | Build, second half | 2:26 to 3:30 | 64 | 8 |
| P4 | Cost, Today, Close | 3:30 to 5:00 | 90 | 11 |

Each piece uses the same style folder, the same hero and the same voice.

### Intake answers, fixed for every piece

| Skill question | Answer |
|---|---|
| 1 Subject and one true thing | [TOPIC]. The one true thing is the script's cause chain or attempt series. |
| 2 Formats and length | 9:16 main, 16:9 second. Length per the piece plan. |
| 3 Voice | Narrated voice-over, ElevenLabs, Jeremy - Casual Guy Next Door. |
| 4 Look | Custom: godocs-cartoon, Cartoon Style GoDocs style. |
| 5 Hero | The Surveyor, an original narrator character with a mustard survey stake. |
| 6 Music | Composed in code. |
| 7 Real screenshots and logos | No. |

### Run order per piece

1. Write voice/script.json from the approved script. Set lead 1.2 and tail 1.8. Keep lines under 3.5 words per second. The script runs at 2.3. Write numbers and names as they are spoken.
2. Story check. Show the beat table from this section. Wait for approval.
3. Look check. Do this on P1 only. Show 2 to 4 frames in 9:16, then the same frames in 16:9. Wait for approval.
4. Build with the scratch voice: node tools/voice.mjs pieces/NAME --scratch. Never ship it.
5. Storyboard check. Show every beat. Collect thumbs by panel number.
6. Generate takes with ElevenLabs. Make one line first and check the voice. Then make each line once. Cost is about 1 credit per character. A 690-word script is about 4,100 characters [I].
7. Save each take as voice/ID.mp3. Run node tools/voice.mjs pieces/NAME. Rebuild.
8. Export: node tools/export.mjs pieces/NAME --formats 9:16,16:9 --share.
9. Review both formats: node tools/review.mjs pieces/NAME --format 9:16, then --format 16:9. Fix every text-check finding in both. Keep captions inside the 9:16 safe area.
10. After P4, join the four final.mp4 files with ffmpeg, once per format.

### Sound rules

- Voice over music. Set piece.json voice music to -22 dB at the start [I]. The skill's example uses -12 and its format card says -20 to -25 for narration. Settle it at the sound check.
- Silence before the payoff, then the loudest hit on the payoff. Place the cost figure here.
- Put the payoff hit in a pause before the line that names it. A hit under speech is ducked.
- Review judges the story arc on the score alone. It judges the voice with its narration check.

### Brief rules

- Fact check before drawing. Search the web for every claim shown on screen. List each source in the brief. Never write first without a source.
- Cue reveals on spoken words: VW(id, word, n). Examples: the route on the place name, the figure on the number.
- Use LX, LY and UNIT for placement. Write PORTRAIT and WIDE arrangements for map, timeline and scale scenes. Never crop 16:9 from 9:16 or the reverse.
- Keep a LOG.md per piece. Add a PASS table per shot after review.
- If a take changes a word, rerun voice.mjs and check every cue that points at that word.

Fields per scene:

| Field | Content |
|---|---|
| Scene ID | S01, S02 and so on |
| Line ID | The id in script.json |
| Timecode | Start to end. Estimate first, then from voice.json |
| Narration line | Exact line from the approved script |
| Visual type | Map, globe, timeline, reconstruction, scale gag, object, text card, mood |
| World | One sentence on what the frame shows, by depth layer |
| Hero | The Surveyor: position, face state and action. Or hidden |
| Cue word | The spoken word that triggers the reveal |
| Camera | Push-in, pan, bump or still. Default: a slow push-in or pan on every scene. Still only on text cards |
| Mood palette | Sunny, Neutral or Disaster. Change only at a bridge |
| Scale gag | The familiar object and its sourced size. None if the scene has no size figure |
| Bridge in | Morph shape from the last scene, draw-off or cut |
| Year tag | The on-screen counter value |
| On-screen text | Max 6 words. None if empty |
| Sound cue | Music change, effect or silence |
| Fact flag | Y or N, a reason code (DATE, PLACE, NUMBER, NAME, CAUSE, PERSON, QUOTE, DISPUTED) and the source |

Sample rows (fill with [TOPIC] content):

| Scene | Time | Narration line | Visual | World | Cue word | Bridge in | Sound | Fact flag |
|---|---|---|---|---|---|---|---|---|
| S01 | 00:00 to 00:06 | [Hook line with number] | Object | Present-day object at center right, sky behind | [number] | Open | Silence | Y, NUMBER |
| S02 | 00:06 to 00:12 | [Contradiction line] | Reconstruction | Period scene, caption Reconstruction | [object] | Morph | Music in, low | Y, PLACE |
| S03 | 00:18 to 00:24 | [Bridge sentence] | Text card | Topic name over the Surveyor with a deadpan face | [topic] | Draw-off | Music swell | N |
| S04 | 00:24 to 00:31 | [Setting line] | Map | Land, water, route on its own element | [place] | Morph | Music bed | Y, PLACE |
| S05 | 00:31 to 00:38 | [Scale comparison] | Scale gag | Object beside a familiar object at the same scale, figure last | [figure] | Cut | None | Y, NUMBER |
| S06 | 01:21 to 01:28 | [First attempt] | Timeline | Ticks left to right, focus date last | [year] | Morph | Music shift | Y, DATE |
| S07 | 02:10 to 02:16 | [Failure beat] | Reconstruction | Failure scene in brick accent | [failure] | Morph | Single effect | Y, CAUSE |
| S08 | 03:30 to 03:37 | [Cost figure] | Text card | Figure and year in ink | [figure] | Draw-off | Silence, then hit | Y, NUMBER |
| S09 | 04:18 to 04:25 | [Today line] | Object | Today object, year tag | [year] | Morph | Music lift | Y, DATE |
| S10 | 04:42 to 05:00 | [Close line] | Mood | Opening image, changed | [closing word] | Morph | Music out | N |

Map rules:
- Use borders and names valid for the date in the narration.
- Draw the route as its own element so it enters last, on its cue word.
- Mark disputed borders with a dashed line.
- Label at most 3 names per frame.
- Add a scale bar when the narration gives a distance.
- Fact flag is always Y.
- In 9:16, stack the map and its labels in a column. Keep labels inside the safe area.

Timeline rules:
- Run left to right in 16:9 and top to bottom in 9:16. At most 5 ticks per frame.
- One date per tick. Write years as digits.
- Draw the focus date last.
- Mark approximate dates with c. and a dashed tick.
- The year tag must equal the date in the narration.
- Fact flag is always Y.

Archive-style rules:
- Caption each reconstruction Reconstruction or Illustration. Never present a drawing as real archive.
- No invented text on documents, signs or maps.
- Draw people by role and costume. Do not draw real modern figures.
- Fact flag is Y when the frame shows a named person, event, object or place.
- Real archive photos enter only as files you supply in assets/ and own or have licensed.

Scenes that need a fact check before drawing:
- Every map and timeline frame.
- Any frame with a number, date, name, quote, cause or blame.
- Any frame that shows a real person or event.
- Any frame tied to a claim marked Disputed or Legend.
- Any scale comparison.

Frames that skip the check: mood frames with no claim.

