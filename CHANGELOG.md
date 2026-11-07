# Changelog

All notable changes to `logomarks` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Find by subject.** The bundled index carries each mark's `subject` (what it depicts: letter, animal, food-drink …),
  and `find` matches its label words as the site does ("buildings", "food"). The index is rebuilt for 4,032 marks.

## [1.0.0] — 2026-11-06

The first public release (0.2.0 was never published).

### Added

- **Find and get.** `find` searches the bundled Logomarks set (CC0) as logomarks.ai does: every word must match, with synonyms, plurals and UK and US trade names, and `--style`, `--tag`, `--industry` and `--letter` filters. `get` writes a live mark's SVG in a colour, or a PNG at a size.
- **Check.** `check` runs every house rule (fit to the 512 grid, markup, specks, slivers, pin-holes, clipping, thin parts, narrow and uneven gaps), each finding with an id and a box; `--fix` refits. `similar` scores a mark against every live mark (`--letters`, `--against`, `--each`, `--all`). `specks` is the set's speck review. `sheet` draws review cards, or a plain grid with `--plain`.
- **Edit.** `parts` lists a mark's parts by index; `edit` runs a JSON list of ops by part (delete, move, rotate, scale, flip, round, offset, mirror, radial, union, subtract, colour, two-tone); `glitch` makes glitch editions (`shear`, `slice`, `bands`, `stepped`, `lane`; the same seed gives the same bytes); `combine` makes two marks one (union, subtract, intersect, exclude, place). Every result is fitted to the grid and checked, and a failing result exits 1.
- **Build.** `kit` writes a brand kit from `@logomarks/brand-kit`: the mark's files, favicons and app icons, lockups, an OKLCH palette with WCAG pairings, a Tailwind theme and tokens, a brand sheet, a guidelines deck (slides and a PDF), a seal lockup, `brand.json` and a social pack (`--styles` adds an opt-in `gradient` style). `social` writes the social pack alone. `mockup` puts the brand on one of 20 objects; `cover` draws an Open Graph image, header or post.
- **MCP server.** `logomarks mcp` runs every command as a tool on stdio: `find_marks`, `get_mark`, `check_mark`, `similar_marks`, `review_sheet`, `list_parts`, `edit_mark`, `glitch_mark`, `combine_marks`, `build_brand_kit`, `build_social_pack`, `render_mockup` and `render_cover`. Tools that make images return a preview to look at; given `out`, they write the file and return its path rather than the SVG text. Each tool carries read-only and destructive hints.
- **Typefaces.** Ten bundled faces for a brand's name (`--font`), all SIL OFL: Inter, Space Grotesk, Instrument Sans, Bricolage Grotesque, Instrument Serif, IBM Plex Mono, and for restaurants Fraunces, Cagliostro, Limelight and Shrikhand. The faces with a Reserved Font Name (Cagliostro, Limelight, IBM Plex Mono) are the unmodified upstream files, pinned by sha256.
- **Help.** `logomarks <command> --help` (or `logomarks help <command>`) for every command, with its options, defaults and examples; `--version`.
- **Errors.** Exit codes 0 ok, 1 a check failed or the command failed, 2 usage. Errors are one line naming the command; `LOGOMARKS_DEBUG=1` adds the stack.
- **Library.** Every function behind the commands is exported (`logomarks`), and the MCP server too (`logomarks/mcp`), with TypeScript declarations.
- Docs in `docs/`: commands, editing, MCP tools and the API.

Built on `@logomarks/core`, `@logomarks/editor`, `@logomarks/brand-kit`, `@logomarks/mockups`, `@arraypress/covers` and `@arraypress/search`. Pure JavaScript: PNGs are drawn by resvg in WebAssembly, with no native binaries.
