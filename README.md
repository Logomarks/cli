# logomarks

Find, check, edit and build on free geometric logomarks from the command line or an AI agent. The [Logomarks](https://logomarks.ai) set is bundled (CC0, searched offline); the CLI checks marks against the set's house rules, edits and glitches them, and builds a brand kit, social pack, mockups and covers. It also runs as an MCP server. Pure JavaScript (resvg in WebAssembly), no native binaries, Node 20 or later.

```bash
npx logomarks find coffee
```

## Commands

```bash
npx logomarks find calm hexagon                       # search the set: slugs, styles, descriptions
npx logomarks get hex-gem --color '#ff5c3a' -o logo.svg
npx logomarks check mark.svg                          # every house rule; exit 1 on errors
npx logomarks similar mark.svg                        # the nearest live marks, with scores
npx logomarks edit quad-cove --ops '[{"op":"round","radius":18}]' -o mine.svg
npx logomarks glitch quad-cove --preset shear --seed 3 -o glitched.svg
npx logomarks kit hex-gem --name "Hexa Labs" --color '#ff5c3a' -o hexa/
npx logomarks mockup hex-gem --name "Hexa Labs" --object card -o card.png
```

Also `specks`, `sheet`, `parts`, `combine`, `social`, `cover` and `mcp`. Run `logomarks --help` for the list and `logomarks <command> --help` for a command's options. A mark is a live slug or name, or the path to your own `.svg`. Every edit comes back fitted to the grid and checked. Every command takes `--json`. Exit codes: 0 ok, 1 a check failed or the command failed, 2 usage.

## AI agents

As a Claude Code plugin, with the two Logomarks skills (picking a mark, designing new ones) and this MCP server:

```
/plugin marketplace add logomarks/skills
/plugin install logomarks@logomarks
```

The skills alone, for any agent that reads skills (Claude Code, Cursor, Codex and more):

```bash
npx skills add logomarks/skills
```

The MCP server alone:

```bash
claude mcp add logomarks -- npx -y logomarks mcp
codex mcp add logomarks -- npx -y logomarks mcp
```

## Docs

- [Commands](docs/commands.md): every command, its options and exit codes, and the checks.
- [Editing](docs/editing.md): glitch presets, edit ops and combining.
- [MCP tools](docs/mcp.md): each tool, its arguments and what it returns.
- [API](docs/api.md): the functions behind them, for use as a library.

Built on [`@logomarks/core`](https://github.com/Logomarks/core), [`@logomarks/editor`](https://github.com/Logomarks/editor), [`@logomarks/brand-kit`](https://github.com/Logomarks/brand-kit), [`@logomarks/mockups`](https://github.com/Logomarks/mockups) and [`@arraypress/covers`](https://github.com/arraypress/covers).

## Licence

The CLI is MIT © ArrayPress Limited. The marks are CC0 (public domain). The bundled typefaces are SIL Open Font License 1.1 (`data/fonts/OFL.txt`).
