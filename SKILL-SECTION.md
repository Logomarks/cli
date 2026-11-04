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
