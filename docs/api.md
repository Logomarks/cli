# API

```js
import { check, glitchMark, kit } from 'logomarks';
import { createServer, TOOLS } from 'logomarks/mcp';
```

| Export | |
|---|---|
| `check(svg, { name, ignore, strict })` | `{ ok, errors, warnings, notes, size, findings }`. |
| `fix(svg)` | The mark refitted, or `null` when there's nothing safe to fix. |
| `similar(svg, { top, letters, exclude })` | `[{ slug, name, score, verdict }]`, closest first. |
| `sheet([{ name, svg }])` | `{ png, svg, marks }`. |
| `findMarks(query, { style, tags, industry, letter, limit })`, `facets()` | `{ total, marks }`; the filters' values. |
| `fitMark(svg)`, `loadIndex()`, `FINDINGS`, `rules` | The fitter, the live set, every finding id, the house rules. |
| `loadMark(ref)`, `paint(svg, color)`, `markPng(svg, { size, color })` | A mark by slug, name or file; as a file in a colour; as a PNG. |
| `glitchMark(svg, { preset, angle, place, slide, gap, cuts, seed })` | `{ svg, checks, glitch }`. |
| `editMark(svg, ops)`, `markParts(svg)` | `{ svg, checks, parts }`; the parts by index. |
| `combineMarks(a, b, { op, transform })` | `{ svg, checks }`. |
| `markPreview(svg)`, `partsPreview(svg, parts)` | 512 px PNGs: the result; the parts numbered. |
| `PRESETS`, `OPS`, `COMBINE_OPS` | The glitch presets, the edit ops, the combine ops. |
| `kit({ mark, name, color, font, tagline, url, handle, styles, platforms, animated, social })` | brand-kit's `{ files, brand }`: every file by path, in memory. |
| `social({ mark, name, …, platforms, styles, animated })` | brand-kit's `{ files, brand }`. |
| `brandInput(o)`, `brandFont(id)` | The brand as brand-kit takes it; a bundled face as bytes. |
| `mockup({ mark, object, … })`, `cover({ mark, recipe, … })` | `{ png, svg, width, height }`. |
| `parseColor`, `FONTS`, `OBJECTS`, `RECIPES` | The parts they're built from. |
| `createServer({ cwd })`, `TOOLS` from `logomarks/mcp` | The MCP server (not connected) and its tools. |

The palette, lockups and artwork are [`@logomarks/brand-kit`](https://github.com/Logomarks/brand-kit)'s (`palette`, `lockup`, `artwork`), and the edits are [`@logomarks/vector-editor`](https://github.com/Logomarks/vector-editor)'s.

The live set is bundled (`data/index.bin`: each mark's SVG, tags, style, mood, description and industries, and its signatures; rebuilt with `npm run index`). The marks are CC0. The typefaces (IBM Plex Mono for labels; Inter, Space Grotesk, Instrument Sans, Bricolage Grotesque and Instrument Serif for names) are SIL OFL, latin, in `data/fonts/` (`OFL.txt`; `scripts/fonts.js` writes them).
