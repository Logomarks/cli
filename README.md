# logomarks

Check a logomark the way the [Logomarks](https://logomarks.ai) set is checked (fit to the 512 grid, specks, pin-holes, slivers, clipping, even gaps, 32 px features, the nearest live marks, review sheets), edit it (glitch editions, edits by part, two marks combined), then build a brand on it: the mark's files, a brand kit, a social pack for every platform, mockups and covers. For AI coding agents (Claude Code, Codex, Cursor) and the people working with them, as a CLI and an MCP server. Pure JS: resvg in WebAssembly, no native binaries, works offline.

## Quick start

```bash
npx logomarks check mark.svg                     # findings with ids and boxes; exit 1 on errors
npx logomarks similar mark.svg                   # the nearest live marks, with scores
npx logomarks find calm hexagon                  # search the live set (CC0)

npx logomarks glitch quad-cove --preset shear --seed 3 -o glitched.svg
npx logomarks parts quad-cove                    # the parts by index, for edit --ops
npx logomarks edit quad-cove --ops '[{"op":"delete","parts":[3]},{"op":"round","radius":18}]' -o edited.svg
npx logomarks combine quad-cove shear-a --op subtract --scale 0.5 -o combined.svg

npx logomarks kit hex-gem --name "Hexa Labs" --color '#ff5c3a' --font space-grotesk --tagline "Things in hexes" -o hexa/
npx logomarks social hex-gem --name "Hexa Labs" --platforms instagram,linkedin --styles bold
npx logomarks mockup hex-gem --name "Hexa Labs" --object card -o card.png
npx logomarks cover hex-gem --recipe aurora --title "Introducing Hexa" -o cover.png
```

A mark is a live slug or name, or your own `.svg` (fitted to the grid first). Every edit comes back fitted (448 on 512, centred) and checked, and the same seed gives the same bytes. Every verb takes `--json`. Exit codes: 0 pass, 1 fail, 2 usage.

## MCP

```bash
claude mcp add logomarks -- npx -y logomarks mcp        # Claude Code (or the logomarks plugin: skills too)
codex mcp add logomarks -- npx -y logomarks mcp         # Codex
```

Tools: `find_marks`, `get_mark`, `check_mark`, `similar_marks`, `review_sheet`, `list_parts`, `glitch_mark`, `edit_mark`, `combine_marks`, `brand_kit`, `social_pack`, `mockup`, `cover`.

## Docs

- [Commands](docs/commands.md): every verb and option, and the checks.
- [Editing](docs/editing.md): glitch presets, the edit ops, combining.
- [MCP tools](docs/mcp.md): each tool's arguments and what it returns.
- [API](docs/api.md): the library behind them.

Built on [`@logomarks/core`](https://github.com/Logomarks/core) (the measures), [`@logomarks/vector-editor`](https://github.com/Logomarks/vector-editor) (the edits), [`@logomarks/brand-kit`](https://github.com/Logomarks/brand-kit) (the kit and social pack), [`@logomarks/mockups`](https://github.com/Logomarks/mockups) and [`@arraypress/covers`](https://github.com/arraypress/covers). The marks are CC0; the bundled typefaces are SIL OFL. The full brand kit, photoreal mockups, custom logos and exclusive wordmarks are on [logomarks.ai](https://logomarks.ai/pricing).

## Licence

MIT © ArrayPress Limited
