# Changelog

All notable changes to `logomarks` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The libraries' new names: `@logomarks/core` (was `@logomarks/marks-kit`), `@logomarks/editor` (was `@logomarks/vector-editor`) and `@logomarks/mockups` (was `@arraypress/mockups`, now `^0.4.3`); `@logomarks/brand-kit` `^0.3.2`. No changes to the CLI itself.

## [0.2.0] — 2026-11-05

### Added

- **Editing, headless**, from `@logomarks/vector-editor`'s ops (no DOM): `glitch` (`shear`, `slice`, `bands`, `stepped`, `lane`; the same seed gives the same bytes), `edit` (a JSON list of ops by part: delete, move, rotate, scale, flip, round, offset, mirror, radial, union, subtract, colour, two-tone), `parts` (the parts by index, box and area, and a numbered image), and `combine` (union, subtract, intersect, exclude or place two marks). Every result is fitted to 448 on 512, centred, and run through every check; a failing result exits 1.
- **`social`**: the social pack on its own, every platform at its current size in `minimal`, `bold` and `pattern` styles, with `--platforms`, `--styles` and `--animated`.
- **MCP tools** `list_parts`, `glitch_mark`, `edit_mark`, `combine_marks` and `social_pack`, each returning its result as an image; `brand_kit` takes `tagline`, `url`, `handle`, `styles`, `platforms`, `animated` and `social`.
- `kit` takes `--tagline --url --handle --styles --platforms --animated --no-social`.
- Docs in `docs/` (commands, editing, MCP tools, API); the README is trimmed.

### Changed

- **The kit is `@logomarks/brand-kit`'s.** The CLI's own `kit/` and `brand/{color,lockup,type,artwork,ico}` are gone: `kit` is `brandKit()` with the bundled faces handed in as bytes and resvg-wasm as its rasteriser (so it still needs no sharp), and `mockup` and `cover` take brand-kit's palette, lockups and artwork. The kit gains the social pack, a Tailwind theme, design tokens, maskable icons, `head.html`, a brand sheet SVG and a README; its paths change (`mark/svg/`, `mark/png/mark-primary-*.png`, `social/<style>/<id>.png`), and `brand.json` follows brand-kit's shape (a live mark credited under `mark`, CC0).
- **The palette's hex values shift slightly**: the 50–950 scale is color-utils' OKLCH scale (the brand colour held at its own step), not the CLI's, and colours are written lower case (`#ff5c3a`). This is expected.
- The prints on mockups (cards, posters, sleeves, billboards, the laptop's page) are drawn in brand-kit's `bold` and `minimal` styles.
- `palette`, `lockup` and `artwork` are no longer exported: import them from `@logomarks/brand-kit`. `kit()` returns brand-kit's `{ files: Map, brand }`.

## [0.1.0] — 2026-11-05

- `check`, `similar`, `specks`, `sheet`, `find`, `get`, `kit`, `mockup`, `cover` and the MCP server (`logomarks mcp`), on `@logomarks/marks-kit` and `@arraypress/search`.
