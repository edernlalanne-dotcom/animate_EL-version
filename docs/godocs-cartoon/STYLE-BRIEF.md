# Cartoon Style GoDocs style (style brief)

Status: brief only. No kit.js exists yet. The style has no proof until it carries a piece. Build it with new-style.md.


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

