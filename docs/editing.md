# Editing

`glitch`, `edit` and `combine` (and the `glitch_mark`, `edit_mark` and `combine_marks` tools) run [`@arraypress/vector-editor`](https://github.com/Logomarks/editor)'s operations without a page: curves are kept, booleans are exact, and the house gap is 22. Every result is fitted to the standard (longest side 448 on the 512 canvas, centred: marks-kit's `fitMark`) and run through every check, so a speck, sliver, pin-hole or stray gap a change leaves is reported with its box. The same input and seed give the same bytes.

## Glitch

| Preset | |
|---|---|
| `shear` | One cut along the mark's own slope, the sides slid apart. |
| `slice` | 1–3 parallel cuts, alternate bands slid. |
| `bands` | 3–5 bands across, each nudged by a seeded amount. |
| `stepped` | A stair-step cut, the sides slid apart. |
| `lane` | One cut across a Track mark's lanes, one side slid one lane (Track marks only). |

| Setting | Default | |
|---|---|---|
| `seed` | 1 | Places the cuts; another seed is a shuffle. |
| `angle` | the mark's slope (shear), across the lanes (lane), else 0 | Degrees, clockwise from across. |
| `place` | seeded | Where the first cut crosses, 0–1 across the mark. |
| `slide` | 44 | How far the sides end up apart along the cut. |
| `gap` | 22 | The gap at each cut. |
| `cuts` | seeded | Cuts for `slice` (1–3), bands for `bands` (3–5). |

A placement that would leave a speck or a sliver is nudged across, then reseeded. When none is clean the call fails with a message: try another seed.

## Edit

A list of ops, run in order. `parts` are indices from `parts` / `list_parts`, as they stand when the op runs (a delete renumbers what follows); leave it out for every part.

| Op | Settings | |
|---|---|---|
| `delete` | `parts` | Remove parts. |
| `move` | `dx`, `dy` | Move parts, in units. |
| `rotate` | `angle`, `about` | Degrees clockwise, about the parts' centre (or `[x, y]`). |
| `scale` | `by` (a factor or `[sx, sy]`), `about` | About the parts' centre. |
| `flip` | `axis` (`horizontal`, `vertical`), `about` | |
| `round` | `radius` | Every corner of the parts rounded; existing rounds are adjusted; 0 takes them out. |
| `offset` | `distance`, `join` (`miter`, `round`) | Grow (positive) or shrink (negative); curves kept. |
| `mirror` | `axis` (`vertical`, `horizontal`, `both`) | The whole mark reflected across the centre; overlaps are unioned. |
| `radial` | `count` | The whole mark repeated about the centre. |
| `union`, `subtract` | `parts` | Join parts into one; cut the rest out of the first. |
| `color` | `color` | Paint the whole mark (it is `currentColor` otherwise; the checks warn). |
| `tone` | `parts`, `color` | A second colour on the parts: `fill="var(--tone-2, #hex)"` beside `currentColor`. |

```json
[{ "op": "delete", "parts": [3] }, { "op": "round", "radius": 18 }, { "op": "tone", "parts": [0], "color": "#ff5c3a" }]
```

The live marks store their curves as short lines, so `round` has little room at a corner that is already rounded; it rounds real corners as asked.

## Combine

`b` is placed on `a`'s 512 canvas (both fitted first): `scale` and `rotate` about its own centre, `flip`, then moved by `x`, `y`. Then:

| Op | |
|---|---|
| `union` | Everything either covers. |
| `subtract` | `a` with `b` cut out. |
| `intersect` | Where both cover. |
| `exclude` | Where exactly one covers. |
| `place` | Both, as they are. |
