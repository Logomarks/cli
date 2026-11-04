# logomarks

Check a logomark the way the [Logomarks](https://logomarks.ai) set is checked: the fit to the 512 grid, stray specks, pin-holes and slivers, clipping, even gaps and features that survive 32 px; the nearest of the live marks; and a review sheet to look at. Then build a brand on one: the mark's files, a starter kit, mockups and covers. Built for AI coding agents (Claude Code, Codex, Cursor) and the people working with them. Pure JS: resvg in WebAssembly, no native binaries, works offline.

```bash
npx logomarks check mark.svg              # findings with ids, severities and boxes; exit 1 on errors
npx logomarks check marks/ --fix          # refit to the grid in place (the only automatic fix)
npx logomarks similar mark.svg            # the nearest live marks, with scores
npx logomarks sheet marks/*.svg -o sheet.png
```

```bash
npx logomarks get hex-gem --color '#ff5c3a' > mark.svg        # a live mark (CC0); --size 512 -o mark.png
npx logomarks kit hex-gem --name "Hexa Labs" --color '#ff5c3a' --font space-grotesk -o hexa/
npx logomarks mockup hex-gem --name "Hexa Labs" --object card -o card.png
npx logomarks cover hex-gem --recipe aurora --title "Introducing Hexa" -o cover.png
```

A mark is a live slug or name, or your own `.svg` (fitted to the grid first). Every verb takes `--json`. Exit codes: 0 pass, 1 fail, 2 usage.

```
✗ speck.svg  448 × 448  1 error
    error    speck        A stray piece of 36.0 sq units.  [253, 250, 259, 256]
! gap-10.svg  448 × 448  1 warning
    warning  uneven-gaps  A gap 9.8 wide, against the mark's main gap of 21.8: keep one gap width (22), or a clear 1:2 ratio.  [250.6, 24.1, 261.4, 487.9]
```

## Checks

| Id | Severity | |
|---|---|---|
| `viewbox`, `size`, `centre`, `clipped` | error | `viewBox="0 0 512 512"`, longest side 448 (±0.5), centred, nothing outside the canvas. `--fix` refits. |
| `markup`, `empty` | error | Filled paths only: no groups, transforms, strokes, styles, masks, text or images. |
| `speck`, `sliver`, `pinhole` | error | Pieces under 60 sq units, holes under 30, left by booleans. Touch points, hairlines and repeated dots are left out. |
| `fill`, `precision` | warning | `currentColor`; one decimal place. `--fix` refits. |
| `thin`, `narrow-gap` | warning | Strokes or gaps under 10 units: they vanish or close up at 32 px. |
| `uneven-gaps` | warning | One gap width per mark (22), or a clear 1:2 ratio. |

`--strict` fails warnings too; `--ignore speck,uneven-gaps` leaves ids out. `similar` flags 0.72 and up as too close (look at the two side by side) and fails at 0.9 (a near-copy); `--letters` compares a badge's knocked-out letter instead (0.7 / 0.85).

## Build

| Verb | |
|---|---|
| `get` | The mark as SVG (stdout or `-o`), or a PNG with `--size`. `--color` paints it; `currentColor` otherwise. |
| `kit` | `mark/` (SVG; PNG at 16, 32, 48, 180, 192, 512, 1024; on light and dark), `favicon/` (`.ico`, `favicon.svg`, `apple-touch-icon.png`, app icons, manifest), `lockup/` (horizontal and stacked, on light, dark and colour, SVG with the name as outlines, and PNG), `colors/palette.css`, `social/` (avatar 400², X header 1500×500, OG 1200×630), `brand.json` and `brand-sheet.png`. The palette is a 50–950 scale in the colour's hue, with text colours that clear AA. `--font`: `inter`, `space-grotesk`, `instrument-sans`, `bricolage-grotesque`, `instrument-serif`, `plex-mono`. |
| `mockup` | The brand on a 2D object from [`@arraypress/mockups`](https://github.com/arraypress/mockups): `card`, `letterhead`, `ticket`, `lanyard`, `sticker`, `tote`, `tee`, `hoodie`, `cap`, `mug`, `bag`, `box`, `poster`, `vinyl`, `cd`, `cassette`, `phone`, `laptop`, `billboard`, `shopfront`. Garments, mugs and bags carry the mark; full-bleed prints carry the lockup on the brand colour. `--layout`, `--surface`, `--view`, `--base` (the object's colour), `--size`. |
| `cover` | A cover from [`@arraypress/covers`](https://github.com/arraypress/covers): `mark`, `gradient`, `tile`, `stripes`, `aurora`, `grid`, `cutout`. `--title`, `--label`, `--aspect og\|1:1\|16:9`, `--width`. |

`-o file.svg` writes a mockup's or cover's SVG instead of the PNG.

## API

| Export | |
|---|---|
| `check(svg, { name, ignore, strict })` | `{ ok, errors, warnings, notes, size, findings }`. |
| `fix(svg)` | The mark refitted, or `null` when there's nothing safe to fix. |
| `similar(svg, { top, letters, exclude })` | `[{ slug, name, score, verdict }]`, closest first. |
| `sheet([{ name, svg }])` | `{ png, svg, marks }`. |
| `fitMark(svg)`, `loadIndex()`, `FINDINGS`, `rules` | The fitter, the live set, every finding id, the house rules. |
| `loadMark(ref)`, `paint(svg, color)`, `markPng(svg, { size, color })` | A mark by slug, name or file; as a file in a colour; as a PNG. |
| `kit({ mark, name, color, font })` | `{ brand, files, sheet }`: every file in memory. |
| `mockup({ mark, object, … })`, `cover({ mark, recipe, … })` | `{ png, svg, width, height }`. |
| `palette(hex)`, `lockup(o)`, `artwork(o)`, `FONTS`, `OBJECTS`, `RECIPES` | The parts they're built from. |

The live set is bundled (`data/index.bin`, rebuilt with `npm run index`). The marks are CC0. The typefaces (IBM Plex Mono for labels; Inter, Space Grotesk, Instrument Sans, Bricolage Grotesque and Instrument Serif for names) are SIL OFL, latin, in `data/fonts/` (`OFL.txt`; `scripts/fonts.js` writes them).

Free and open. The full brand kit, photoreal mockups, custom logos and exclusive wordmarks are on [logomarks.ai](https://logomarks.ai/pricing).

## Licence

MIT © ArrayPress Limited
