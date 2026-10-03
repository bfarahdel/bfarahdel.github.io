# Directional walking sprite

## Current refinement

Active asset: `assets/images/sprites/walking-side-sprite-strip-v2.png`. Prepared with the built-in image editor, preserving transparency and all four right-facing poses. Original strip retained.

Final refinement prompt:

Edit this existing transparent pixel-art walking sprite strip of an ADULT woman used as her personal portfolio avatar. Make ONLY a subtle anatomy/silhouette adjustment: a slightly more feminine, softly rounded chest underneath the fully covering yellow hoodie, consistent across all four frames. Natural modest adult proportions, not exaggerated; maintain the loose hoodie, no cleavage or exposed skin. Preserve precisely the same blue character cap, glasses, face, hair, hoodie design, trousers, sneakers, pixel art style and colors. Keep all FOUR right-facing full-body walking poses, equal frame widths, identical scale and baseline, same spacing and canvas aspect ratio 3:1. No added elements or labels. Keep genuine alpha transparency. Animation-ready: preserve head positions and foot positions of every frame. Do not change anything beyond the subtle clothed chest silhouette.

## Original directional asset

Asset: `design/source-art/walking-side-sprite-strip.png`
Source: `design/source-art/merill_pika_spritesheet.png`, third row (Walk Cycle - Right).
Created using the built-in image editing tool with transparency enabled. Original assets retained. Four side-profile frames face right and are mirrored for leftward travel. The generated strip is 2172 x 724, with four 543 x 724 cells displayed without distortion.

## Final prompt

Use case: background-extraction. Edit target: the supplied character spritesheet. Extract ONLY the four RIGHT-FACING walking sprites in the third row labelled Walk Cycle - Right. Deliver a transparent PNG horizontal sprite strip, aspect ratio 4:1, exactly FOUR equal square cells in a single row. Each cell contains one complete full-body RIGHT-facing side-profile walking frame of this SAME character (blue Marill cap, glasses, brown hair, yellow Pikachu hoodie, dark trousers, sneakers). Preserve original character, pixel art, palette and silhouette. Four sequential walking poses with alternating legs. Align all four at identical scale, same foot baseline and same center inside their individual equal cells. Leave approximately 10% transparent top and bottom padding, sprite fills 80% cell height. No front-facing frames. No text, labels, grid, checkerboard, backdrop, ground, shadows, closeup or other sprites. Genuine alpha transparency, not a drawn checkerboard. This will be animated using CSS steps(4).
Portrait favicon: generated from the supplied portrait with transparent background, tightly framed head, recognizable mouse cap, glasses, brown hair and yellow neckline; bold simplified shapes for small-size readability. Source: favicon-portrait-source.png. Browser exports: 32px, 192px; Apple touch icon: 180px.
Short-hair favicon refinement: shorten brown hair to a pixie haircut matching the original portrait; retain short tousled bangs, short sideburns and neat nape, remove curls behind ears and neck; preserve face, glasses, mouse cap, hood, style and transparency. Active exports: favicon-portrait-short-32.png, -180.png, -192.png.
