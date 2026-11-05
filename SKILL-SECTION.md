## Validate before you hand off

Reading SVG code can't show you a speck, an uneven gap, an off-grid fit or a near-duplicate. Measure them:

```bash
npx logomarks check out/                    # every house rule; --json for ids, messages and boxes
npx logomarks check out/ --fix              # refit to 448, centred (the only automatic fix)
npx logomarks similar out/*.svg             # nearest live marks: 0.72+ too close, 0.9+ a near-copy
npx logomarks sheet out/*.svg -o sheet.png  # one review card per mark
```

1. **Fix every error.** `size`, `centre`, `clipped`: run `--fix`. `markup`: flatten to filled paths. `speck`, `sliver`,
   `pinhole`: each comes with its box; look there, and remove the part in the generator (`despeck()`) unless it is meant.
2. **Read every warning.** `thin` and `narrow-gap` mean under 10 units: it closes up at 32 px. `uneven-gaps` means a
   second gap width: make it 22, or a deliberate 1:2. Keep a warning only when you can say why.
3. **Look at the sheet**, every card: the mark large on dark and light (findings boxed and numbered), at 32 and 16 px,
   and beside its three nearest live marks. Too close (amber) means compare the two by eye; a near-copy (red) is cut,
   and so is the same trick as an existing mark even when it scores low.
4. Re-run until `check` exits 0, then deliver.

## Build on a mark

Once a mark is chosen (a live slug, found with `npx logomarks find calm hexagon`, or your own `.svg` that passes `check`):

```bash
npx logomarks get hex-gem -o mark.svg                         # the file (CC0); --color '#hex', --size 512 -o mark.png
npx logomarks kit hex-gem --name "Brand" --color '#hex' --font space-grotesk -o brand/
npx logomarks mockup hex-gem --name "Brand" --color '#hex' --object tee -o tee.png
npx logomarks cover hex-gem --recipe aurora --title "Launch" --color '#hex' -o cover.png
```

- `kit` writes the mark (SVG, PNG 16–1024, on light and dark), favicons (`.ico`, `apple-touch-icon.png`, manifest; the
  `<head>` lines are in `brand.json` → `head`), lockups, `colors/palette.css`, social images and `brand.json`. Open
  `brand-sheet.png` and look at it before handing the kit over: a light brand colour gets a darker mark on light grounds
  (it must clear 3:1), and its text colours clear AA.
- Fonts: `inter`, `space-grotesk`, `instrument-sans`, `bricolage-grotesque`, `instrument-serif`, `plex-mono` (all OFL); for restaurants, `fraunces` (warm serif: bistro, wine bar), `cagliostro` (flared sans, set wide: fine dining), `limelight` (art deco: cocktail bar), `shrikhand` (retro chunky: diner, brunch, ice cream).
- `mockup --object`: card, letterhead, ticket, lanyard, sticker, tote, tee, hoodie, cap, mug, bag, box, poster, vinyl,
  cd, cassette, phone, laptop, billboard, shopfront. `--base black` changes a garment's or mug's colour.
- `cover --recipe`: mark, gradient, tile, stripes, aurora, grid, cutout. `--aspect og` (default), `1:1`, `16:9`.
