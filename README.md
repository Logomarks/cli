# logomarks

Check a logomark the way the [Logomarks](https://logomarks.ai) set is checked: the fit to the 512 grid, stray specks, pin-holes and slivers, clipping, even gaps and features that survive 32 px; the nearest of the live marks; and a review sheet to look at. Built for AI coding agents (Claude Code, Codex, Cursor) and the people working with them. Pure JS: resvg in WebAssembly, no native binaries, works offline.

```bash
npx logomarks check mark.svg              # findings with ids, severities and boxes; exit 1 on errors
npx logomarks check marks/ --fix          # refit to the grid in place (the only automatic fix)
npx logomarks similar mark.svg            # the nearest live marks, with scores
npx logomarks sheet marks/*.svg -o sheet.png
```

Every verb takes `--json`. Exit codes: 0 pass, 1 fail, 2 usage.

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

## API

| Export | |
|---|---|
| `check(svg, { name, ignore, strict })` | `{ ok, errors, warnings, notes, size, findings }`. |
| `fix(svg)` | The mark refitted, or `null` when there's nothing safe to fix. |
| `similar(svg, { top, letters, exclude })` | `[{ slug, name, score, verdict }]`, closest first. |
| `sheet([{ name, svg }])` | `{ png, svg, marks }`. |
| `fitMark(svg)`, `loadIndex()`, `FINDINGS`, `rules` | The fitter, the live set, every finding id, the house rules. |

The live set is bundled (`data/index.bin`, rebuilt with `npm run index`). The marks are CC0; the sheet's typeface is IBM Plex Mono (SIL OFL, `data/fonts/OFL.txt`).

## Licence

MIT © ArrayPress Limited
