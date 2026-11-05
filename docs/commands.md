# Commands

```
logomarks <command> [arguments] [options]
logomarks <command> --help
```

A `<mark>` is a live slug or name (`hex-gem`, `"Hex Gem"`) or the path to your own `.svg`, fitted to the grid first. A miss suggests the closest slugs.

Every command takes `--json` (machine-readable output on stdout) and `-h, --help`. `logomarks --version` prints the version.

| Exit code | Meaning |
|---|---|
| 0 | OK: every mark passed, or the file was written. |
| 1 | A check failed (`check`, `similar`, `specks`, `sheet`, and an edit whose result fails a check), nothing matched (`find`), or the command failed (a file it can't read or write). |
| 2 | Usage: an unknown command or option, a missing argument, or a value out of range. |

Set `LOGOMARKS_DEBUG=1` to print the stack trace behind an exit 1.

- Find and get: [`find`](#find), [`get`](#get)
- Check: [`check`](#check), [`similar`](#similar), [`specks`](#specks), [`sheet`](#sheet)
- Edit: [`parts`](#parts), [`edit`](#edit), [`glitch`](#glitch), [`combine`](#combine)
- Build: [`kit`](#kit), [`social`](#social), [`mockup`](#mockup), [`cover`](#cover)
- Agents: [`mcp`](#mcp)

## find

Search the live set by words, style, tag, industry or letter.

```
logomarks find <words…> [options]
logomarks find [options]
```

It searches as logomarks.ai does: every word must match a mark's name, search words, industries, style, tags, mood, letter or description (synonyms, plurals, and UK and US trade names included), and the best fits come first. With no words or filters it lists every style, tag, mood and industry, with counts.

| Option | Default | |
|---|---|---|
| `--style <style>` | | One style: `bold`, `badge`, `letter`, `monogram`, `animal`, `iso`, `grid`, `glitch`, `line`, `modular`, `woven`, `detailed`, `inflated`, `organic`, `glyph`. |
| `--tag <tags>` | | Tags a mark must all have, comma-separated: `round`, `square`, `symmetric`, `radial`, `solid`, `light`, `wide`, `tall`, `letter`, `number`, `new`. |
| `--industry <id>` | | An industry it suits, e.g. `coffee-shop`, `fintech`, `law-firm`. `logomarks find` lists them all. |
| `--letter <char>` | | The letter or number a lettermark shows. |
| `--top <n>` | 20 | How many marks to list (1–500). |

Exit 1 when nothing matches.

```bash
logomarks find coffee
logomarks find calm hexagon --top 5
logomarks find --style letter --letter K --json
```

## get

Get a live mark's SVG, or a PNG of any mark.

```
logomarks get <mark> [-o file] [options]
```

The SVG is 512 × 512, the mark's longest side 448, centred, filled paths in `currentColor`. Live marks are CC0. Without `-o` the SVG goes to stdout.

| Option | Default | |
|---|---|---|
| `--color <hex>` | `currentColor` (SVG), black (PNG) | Paint it, e.g. `#ff5c3a`. |
| `--size <px>` | 512 | A PNG this many pixels square (16–4096). |
| `--format <svg \| png>` | from `-o`; `png` with `--size` | |
| `-o, --out <file>` | stdout | Write `.svg` or `.png`. A PNG needs `-o`. |

```bash
logomarks get hex-gem -o logo.svg
logomarks get "Hex Gem" --color '#ff5c3a' --size 512 -o logo.png
```

## check

Check SVG marks against the house rules.

```
logomarks check <file.svg | folder>… [options]
```

Each finding has an id, a severity, a message and a box `[x0, y0, x1, y1]` on the 512 canvas. Folders are expanded to the `.svg` files in them (not recursively).

| Option | Default | |
|---|---|---|
| `--fix` | off | Refit to the grid in place: the only automatic fix. |
| `--strict` | off | Count warnings as failures too. |
| `--ignore <ids>` | | Leave these finding ids out, e.g. `speck,uneven-gaps`. |

| Id | Severity | |
|---|---|---|
| `viewbox`, `size`, `centre`, `clipped` | error | `viewBox="0 0 512 512"`, longest side 448 (±0.5), centred, nothing outside the canvas. `--fix` refits. |
| `markup`, `empty` | error | Filled paths only: no groups, transforms, strokes, styles, masks, text or images. |
| `speck`, `sliver`, `pinhole` | error | Pieces under 60 square units, and holes under 30, left by booleans. Touch points, hairlines and repeated dots are left out. |
| `fill`, `precision` | warning | `currentColor`; one decimal place. `--fix` refits. |
| `thin`, `narrow-gap` | warning | Strokes or gaps under 10 units: they vanish or close up at 32 px. |
| `uneven-gaps` | warning | One gap width per mark (22), or a clear 1:2 ratio. |

```
✗ speck.svg  448 × 448  1 error
    error    speck        A stray piece of 36.0 sq units.  [253, 250, 259, 256]
! gap-10.svg  448 × 448  1 warning
    warning  uneven-gaps  A gap 9.8 wide, against the mark's main gap of 21.8: keep one gap width (22), or a clear 1:2 ratio.  [250.6, 24.1, 261.4, 487.9]
```

Exit 1 when any mark fails.

```bash
logomarks check mark.svg
logomarks check marks/ --fix
logomarks check out/*.svg --strict --json
```

## similar

Find the live marks nearest to yours, with scores.

```
logomarks similar <file.svg | folder>… [options]
logomarks similar --all <data dir> [-o similar.json]
```

Compares outlines, rotations and mirrors included. A score of 0.72 or more is too close (compare the two by eye: solid shapes often share an outline); 0.9 or more is a near-copy. The same trick as an existing mark is a copy even when it scores low, so look at the matches.

| Option | Default | |
|---|---|---|
| `--top <n>` | 5 | How many matches per mark. |
| `--letters` | off | Compare a badge's knocked-out letter instead of its outline (0.7 too close, 0.85 a near-copy). |
| `--against <dir>` | the bundled set | Compare with a folder of SVGs instead. |
| `--each` | off | Compare the candidates with each other too (marked `*`). |
| `--all <data dir>` | | Write every mark's 8 nearest for a whole set ("More like this"), from its `marks.json`, `descriptions.json` and `svg/`. |
| `-o, --out <file>` | stdout | Where `--all` writes. |

Exit 1 when any mark is a near-copy.

```bash
logomarks similar mark.svg
logomarks similar out/ --top 3 --each
logomarks similar badge.svg --letters --json
```

## specks

List every speck, sliver and pin-hole, with its box.

```
logomarks specks <file.svg | folder>… [options]
```

The set's speck review: pieces under `--piece` and holes under `--hole`, smallest first. Tiny, hairline, repeated and reviewed parts are left out unless `--all`. Render each hit large before changing anything: many small parts are meant.

| Option | Default | |
|---|---|---|
| `--piece <area>` | 60 | Report pieces smaller than this, in square units. |
| `--hole <area>` | 30 | Report holes smaller than this. |
| `--allow <slugs>` | | Marks whose small parts are meant, comma-separated. |
| `--all` | off | Report every small part, reviewed and repeated ones included. |
| `--raster` | off | Read each mark from the scanline raster instead of its outline. |

Exit 1 when anything is listed.

```bash
logomarks specks out/
logomarks specks mark.svg --piece 80 --json
```

## sheet

Draw review cards for marks, as one PNG.

```
logomarks sheet <file.svg | folder>… [-o sheet.png] [options]
```

Each card shows the mark large on dark and light with its findings boxed and numbered, at 32 and 16 px, and beside its three nearest live marks (amber: too close; red: a near-copy).

| Option | Default | |
|---|---|---|
| `-o, --out <file.png>` | `sheet.png` | The PNG to write. |
| `--strict` | off | Count warnings as failures too. |
| `--ignore <ids>` | | Leave these finding ids out. |
| `--plain` | off | A plain labelled grid instead of review cards. |
| `--cols <n>` | 8 | Columns in the plain grid. |

Exit 1 when any mark fails a check or is a near-copy.

```bash
logomarks sheet out/*.svg -o sheet.png
logomarks sheet out/ --plain --cols 6 -o batch.png
```

## parts

List a mark's parts by index, as `edit --ops` names them.

```
logomarks parts <mark> [-o parts.png]
```

Each part has its index in drawing order, its box and centre on the 512 canvas, its area (holes taken out), its holes and its tone.

| Option | Default | |
|---|---|---|
| `-o, --out <file.png>` | | Also draw the mark with every part boxed and numbered. |

```bash
logomarks parts quad-cove
logomarks parts mark.svg -o parts.png
```

## edit

Edit a mark by part, with a list of ops.

```
logomarks edit <mark> --ops '<json>' [-o out.svg]
logomarks edit <mark> --ops @ops.json [-o out.svg]
```

The ops run in order: `delete`, `move`, `rotate`, `scale`, `flip`, `round`, `offset`, `mirror`, `radial`, `union`, `subtract`, `color`, `tone`. Each op's settings are in [editing](editing.md). The result is fitted to the grid and checked; without `-o` the SVG goes to stdout and the checks to stderr.

| Option | Default | |
|---|---|---|
| `--ops <json \| @file>` | required | The ops as a JSON array, or `@` and a file holding one. |
| `-o, --out <file>` | stdout | Write `.svg`, or `.png` drawn at 512. |

Exit 1 when the result fails a check.

```bash
logomarks edit quad-cove --ops '[{"op":"delete","parts":[3]},{"op":"round","radius":18}]' -o mine.svg
logomarks edit mark.svg --ops @ops.json -o mine.png
```

## glitch

Make a glitch edition of a mark: cut with the house gap and slid.

```
logomarks glitch <mark> [--preset shear] [-o out.svg] [options]
```

The result is fitted and checked, and the same seed gives the same bytes. See [editing](editing.md) for the presets.

| Option | Default | |
|---|---|---|
| `--preset <name>` | `shear` | `shear`, `slice`, `bands`, `stepped`, `lane`. |
| `--seed <n>` | 1 | Places the cuts; another seed is a shuffle. |
| `--angle <deg>` | the mark's slope (`shear`), across the lanes (`lane`), else 0 | Cut direction, clockwise from across. |
| `--place <0–1>` | seeded | Where the first cut crosses the mark. |
| `--slide <units>` | 44 | How far the sides slide apart along the cut. |
| `--gap <units>` | 22 | The gap at each cut. |
| `--cuts <n>` | seeded | Cuts for `slice` (1–3), bands for `bands` (3–5). |
| `-o, --out <file>` | stdout | Write `.svg`, or `.png` drawn at 512. |

Exit 1 when the result fails a check: try another seed.

```bash
logomarks glitch quad-cove --preset shear --seed 3 -o glitched.svg
logomarks glitch mark.svg --preset bands --cuts 4 -o preview.png
```

## combine

Combine two marks into one.

```
logomarks combine <a> <b> [--op union] [-o out.svg] [options]
```

`b` is placed over `a` on the 512 canvas (both fitted first), then combined. The result is fitted and checked.

| Option | Default | |
|---|---|---|
| `--op <op>` | `union` | `union`, `subtract` (b cut out of a), `intersect`, `exclude` (where exactly one covers), `place` (both as they are). |
| `--scale <factor>` | 1 | Scale `b` about its own centre. |
| `--rotate <deg>` | 0 | Turn `b` clockwise about its own centre. |
| `--flip <axis>` | | Flip `b`: `horizontal` or `vertical`. |
| `--x <units>`, `--y <units>` | 0 | Move `b` across and down. |
| `-o, --out <file>` | stdout | Write `.svg`, or `.png` drawn at 512. |

Exit 1 when the result fails a check.

```bash
logomarks combine quad-cove shear-a --op subtract --scale 0.5 -o combined.svg
logomarks combine a.svg b.svg --op place --x 120 -o both.png
```

## kit

Build a brand kit on a mark and write it to a folder.

```
logomarks kit <mark> --name "Brand" [-o dir/] [options]
```

The kit, from [`@logomarks/brand-kit`](https://github.com/Logomarks/brand-kit):

- `mark/`: SVG on light, dark and colour, and one that follows dark mode; PNG 64–2048.
- `favicon/`: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, any and maskable icons, `site.webmanifest`, `head.html`.
- `lockup/`: horizontal and stacked, on light, dark and colour, the name as outlines.
- `colors/`: `palette.css`, a Tailwind theme and design tokens: a 50–950 OKLCH scale with WCAG pairings.
- `social/`: the social pack, as [`social`](#social) makes it.
- `brand-sheet.png` and `.svg`, `brand.json` (the brand, the files, a live mark credited, CC0) and `README.md`.

A light brand colour gets a darker mark on light grounds (it must clear 3:1), and the text colours clear WCAG AA. Look at `brand-sheet.png` before handing the kit over.

| Option | Default | |
|---|---|---|
| `--name <text>` | the mark's name | The brand's name. |
| `--color <hex>` | `#d4ff3a` | The brand colour. |
| `--font <id>` | `inter` | The typeface for the name: `inter`, `space-grotesk`, `instrument-sans`, `bricolage-grotesque`, `instrument-serif`, `plex-mono` (all SIL OFL, bundled). |
| `--tagline <text>` | | A short line under the name on social images and the brand sheet. |
| `--url <url>` | | The brand's website, for the brand sheet and the email signature. |
| `--handle <@name>` | `@` and the name | The social handle. |
| `--styles <ids>` | all | Social styles: `minimal`, `bold`, `pattern`. |
| `--platforms <ids>` | every one | Social images by id (`x-header`) or platform (`instagram`). |
| `--animated` | off | Also write animated SVGs for avatars, stories and banners. |
| `--no-social` | off | Leave the social pack out. |
| `-o, --out <dir>` | `<name>-kit` | The folder to write; files in it are replaced. |

```bash
logomarks kit hex-gem --name "Hexa Labs" --color '#ff5c3a' --font space-grotesk -o hexa/
logomarks kit mark.svg --name Acme --no-social
```

## social

Draw the brand for every social platform at its size, and write it to a folder.

```
logomarks social <mark> --name "Brand" [-o dir/] [options]
```

Every platform image (Instagram, LinkedIn, X, YouTube, Facebook, TikTok, Twitch, Discord, Threads, Bluesky) at its current size, with the logo inside its safe zone, in each style as `<style>/<id>.png` and `.svg`; an email signature, the Open Graph card, and a README of sizes and sources.

Options: as [`kit`](#kit), without `--no-social`. `-o, --out <dir>` defaults to `<name>-social`.

```bash
logomarks social hex-gem --name "Hexa Labs" --platforms instagram,linkedin --styles bold
logomarks social mark.svg --name Acme --animated -o acme-social/
```

## mockup

Put a brand on an object and write the image.

```
logomarks mockup <mark> --object <object> [-o file.png] [options]
```

Objects, from [`@logomarks/mockups`](https://github.com/Logomarks/mockups), with their layouts (the first is the default): `card` (pair, flat, stack, fan), `letterhead` (set, flat, envelope), `ticket`, `lanyard`, `sticker` (laptop, bottle, sheet), `tote`, `tee`, `hoodie`, `cap`, `mug` (single, pair), `bag`, `box`, `poster`, `vinyl`, `cd`, `cassette`, `phone`, `laptop`, `billboard`, `shopfront`. Garments, mugs and bags carry the mark; prints carry the lockup on the brand colour.

| Option | Default | |
|---|---|---|
| `--object <id>` | required | The object. |
| `--name`, `--color`, `--font` | as [`kit`](#kit) | The brand. |
| `--layout <id>` | the object's first | One of the object's layouts. |
| `--surface <id>` | the object's own | What it lies on: `oak`, `concrete`, `linen`, `paper`, `light`, `dark`, or a hex colour. |
| `--view <front \| angle>` | `front` | A screen's or a sign's view. |
| `--base <colour>` | the object's own | The object's colour: `white`, `black`, `navy` or a hex for garments, mugs and bags; a box's board; a device's finish. |
| `--size <px>` | 1600 | The longest side, 200–4000. |
| `--seed <text>` | the mark's slug | Drives every random choice. |
| `-o, --out <file>` | `<object>.png` | Write `.png`, or `.svg` for the layered SVG. |

```bash
logomarks mockup hex-gem --name "Hexa Labs" --object card -o card.png
logomarks mockup mark.svg --object tee --base black -o tee.png
```

## cover

Draw a cover (an Open Graph image, a header or a post) with the mark on it.

```
logomarks cover <mark> [--recipe mark] [--title "…"] [-o cover.png] [options]
```

Recipes, from [`@arraypress/covers`](https://github.com/arraypress/covers): `mark`, `gradient`, `tile`, `stripes`, `aurora`, `grid`, `cutout`.

| Option | Default | |
|---|---|---|
| `--recipe <id>` | `mark` | The look. |
| `--title <text>` | | A headline; the mark moves out of its way. |
| `--label <text>` | | A small line over the title. |
| `--color <hex>` | `#d4ff3a` | The brand colour. |
| `--aspect <ratio>` | `og` | `og` (1200 × 630), `1:1`, `16:9`, `4:5`, `9:16`, any `w:h`, or a number. |
| `--width <px>` | 1200 | The width, 200–6000. |
| `--seed <text>` | the mark's slug | Drives every random choice. |
| `-o, --out <file>` | `cover.png` | Write `.png`, or `.svg` (text as outlines). |

```bash
logomarks cover hex-gem --recipe aurora --title "Introducing Hexa" -o cover.png
logomarks cover mark.svg --recipe stripes --aspect 1:1 -o post.png
```

## mcp

Run the MCP server on stdio, for Claude Code, Codex, Cursor and other agents.

```
logomarks mcp
```

Every command as an MCP tool, run locally: nothing leaves the machine. See [MCP tools](mcp.md).

```bash
claude mcp add logomarks -- npx -y logomarks mcp
codex mcp add logomarks -- npx -y logomarks mcp
```

PNGs are drawn by resvg in WebAssembly, so nothing needs `sharp` or a native build.
