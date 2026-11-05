# Commands

`npx logomarks <verb> …`. A mark is a live slug or name (`hex-gem`, `"Hex Gem"`) or your own `.svg`, fitted to the grid first. Every verb takes `--json`. Exit codes: 0 pass, 1 fail, 2 usage. `logomarks --help` lists them all.

## Check

```bash
npx logomarks check mark.svg              # findings with ids, severities and boxes; exit 1 on errors
npx logomarks check marks/ --fix          # refit to the grid in place (the only automatic fix)
npx logomarks similar mark.svg            # the nearest live marks, with scores
npx logomarks specks marks/               # every speck, sliver and pin-hole, with its box
npx logomarks sheet marks/*.svg -o sheet.png
```

```
✗ speck.svg  448 × 448  1 error
    error    speck        A stray piece of 36.0 sq units.  [253, 250, 259, 256]
! gap-10.svg  448 × 448  1 warning
    warning  uneven-gaps  A gap 9.8 wide, against the mark's main gap of 21.8: keep one gap width (22), or a clear 1:2 ratio.  [250.6, 24.1, 261.4, 487.9]
```

| Id | Severity | |
|---|---|---|
| `viewbox`, `size`, `centre`, `clipped` | error | `viewBox="0 0 512 512"`, longest side 448 (±0.5), centred, nothing outside the canvas. `--fix` refits. |
| `markup`, `empty` | error | Filled paths only: no groups, transforms, strokes, styles, masks, text or images. |
| `speck`, `sliver`, `pinhole` | error | Pieces under 60 sq units, holes under 30, left by booleans. Touch points, hairlines and repeated dots are left out. |
| `fill`, `precision` | warning | `currentColor`; one decimal place. `--fix` refits. |
| `thin`, `narrow-gap` | warning | Strokes or gaps under 10 units: they vanish or close up at 32 px. |
| `uneven-gaps` | warning | One gap width per mark (22), or a clear 1:2 ratio. |

`--strict` fails warnings too; `--ignore speck,uneven-gaps` leaves ids out. `similar` flags 0.72 and up as too close and fails at 0.9 (a near-copy); `--letters` compares a badge's knocked-out letter instead (0.7 / 0.85); `--against <dir>` compares with a folder of SVGs instead of the live set, `--each` with the other candidates too, and `similar --all <data dir> --out similar.json` writes "More like this" for a whole set. `specks` is the set's speck review (`--piece 60 --hole 30 --allow slugs --all --raster`); `sheet --plain` draws a plain labelled grid.

## Find

`find <words…>` searches the live set as the board does (every word, synonyms too, best first): `--style --tag --industry --letter --top`. With no words or filters it lists every style, tag, mood and industry.

## Edit

Each result is fitted (448 on 512, centred) and checked, and exits 1 when it fails a check. `-o file.svg` writes it, `-o file.png` draws it at 512 to look at; otherwise the SVG goes to stdout and the checks to stderr. See [editing](editing.md).

| Verb | |
|---|---|
| `parts <mark>` | The parts by index in drawing order, with box, area, holes and tone: what `--ops` names. `-o parts.png` draws them numbered. |
| `glitch <mark> --preset shear` | A glitch edition: `shear`, `slice`, `bands`, `stepped`, `lane`. `--seed 1` (the same seed, the same bytes), `--angle`, `--place 0–1`, `--slide 44`, `--gap 22`, `--cuts`. |
| `edit <mark> --ops '[…]'` | Edits by part, as JSON (or `--ops @ops.json`): `delete`, `move`, `rotate`, `scale`, `flip`, `round`, `offset`, `mirror`, `radial`, `union`, `subtract`, `color`, `tone`. |
| `combine <a> <b> --op subtract` | Two marks made one: `union`, `subtract`, `intersect`, `exclude`, `place`. `--scale --rotate --flip --x --y` place `b` over `a`. |

## Build

| Verb | |
|---|---|
| `get` | The mark as SVG (stdout or `-o`), or a PNG with `--size`. `--color` paints it; `currentColor` otherwise. |
| `kit` | The brand kit from [`@logomarks/brand-kit`](https://github.com/Logomarks/brand-kit), written to `-o` (`<name>-kit`): `mark/` (SVG on light, dark and colour, one that follows dark mode; PNG 64–2048), `favicon/` (`.ico`, `favicon.svg`, `apple-touch-icon.png`, any and maskable icons, manifest, `head.html`), `lockup/` (horizontal and stacked on light, dark and colour, the name as outlines), `colors/` (`palette.css`, a Tailwind theme, design tokens: a 50–950 OKLCH scale with WCAG pairings), `brand-sheet.png` and `.svg`, `brand.json` (a live mark credited, CC0), `README.md`, and `social/` (the social pack). `--tagline --url --handle`, `--styles --platforms --animated` for the pack, `--no-social` to leave it out. |
| `social` | The social pack alone, written to `-o` (`<name>-social`): every platform image at its current size, the logo inside each safe zone, in `minimal`, `bold` and `pattern` styles (`<style>/<id>.png` and `.svg`), an email signature, the Open Graph card and a README of sizes and sources. `--platforms` takes ids (`x-header`) or platform names (`instagram`); `--styles minimal,bold`; `--animated` adds animated SVGs for avatars, stories and banners. |
| `mockup` | The brand on a 2D object from [`@logomarks/mockups`](https://github.com/Logomarks/mockups): `card`, `letterhead`, `ticket`, `lanyard`, `sticker`, `tote`, `tee`, `hoodie`, `cap`, `mug`, `bag`, `box`, `poster`, `vinyl`, `cd`, `cassette`, `phone`, `laptop`, `billboard`, `shopfront`. Garments, mugs and bags carry the mark; prints carry brand-kit's artwork. `--layout`, `--surface`, `--view`, `--base` (the object's colour), `--size`. |
| `cover` | A cover from [`@arraypress/covers`](https://github.com/arraypress/covers): `mark`, `gradient`, `tile`, `stripes`, `aurora`, `grid`, `cutout`. `--title`, `--label`, `--aspect og\|1:1\|16:9`, `--width`. |

The brand verbs share `--name --color --font`. Fonts: `inter`, `space-grotesk`, `instrument-sans`, `bricolage-grotesque`, `instrument-serif`, `plex-mono` (all OFL, bundled). PNGs are drawn by resvg in WebAssembly, so nothing needs sharp. `-o file.svg` writes a mockup's or cover's SVG instead of the PNG.

## Agents

`logomarks mcp` runs every verb as an MCP tool on stdio. See [MCP tools](mcp.md).
