# MCP tools

`logomarks mcp` runs the CLI's functions as MCP tools on stdio, locally: nothing leaves the machine. Relative paths resolve against the server's working folder (the project the agent is in). The renderer, the typefaces and the live set load once and stay warm.

```bash
claude mcp add logomarks -- npx -y logomarks mcp        # Claude Code
codex mcp add logomarks -- npx -y logomarks mcp         # Codex (or ~/.codex/config.toml → [mcp_servers.logomarks])
```

Or install the Claude Code plugin, which adds the server and the two Logomarks skills:

```
/plugin marketplace add logomarks/skills
/plugin install logomarks@logomarks
```

Any other MCP client: run `npx -y logomarks mcp` over stdio. The first run downloads the package, so allow a longer start-up timeout.

## Tools

| Tool | Use it to | Arguments | Returns |
|---|---|---|---|
| `find_marks` | Search the set for a mark to use or build on. | `query`, `style`, `tags`, `industry`, `letter`, `limit` (20) | `{ total, marks }`; with no arguments, every style, tag, mood and industry. |
| `get_mark` | Get a mark's SVG, a PNG to look at, or a file. | `mark`, `color`, `size`, `out` | `{ slug, name, url, licence, color, svg }`; `file` instead of `svg` with `out`; an image with `size`. |
| `check_mark` | Check marks against the house rules. | `svg` or `paths`, `svgName`, `fix`, `strict`, `ignore` | `{ ok, passed, failed, marks: [{ findings: [{ id, severity, message, box }] }] }`. |
| `similar_marks` | Find the live marks nearest to a new one. | `svg` or `paths`, `svgName`, `top` (5), `letters` | `{ ok, thresholds, marks: [{ matches: [{ slug, score, verdict }] }] }`. |
| `review_sheet` | Look at review cards before handing marks over. | `svg` or `paths`, `svgName`, `strict`, `ignore`, `out` | Each mark's check summary and nearest marks, and the cards as an image. |
| `list_parts` | See a mark's parts by index, before `edit_mark`. | `mark` or `svg` | `{ count, parts: [{ index, box, centre, area, holes, tone }] }`, and the parts numbered, as an image. |
| `edit_mark` | Edit a mark by part. | `mark` or `svg`, `ops`, `out` | `{ ok, parts, svg, checks }` (`file` instead of `svg` with `out`), and the result as an image. |
| `glitch_mark` | Make a glitch edition. | `mark` or `svg`, `preset`, `seed` (1), `angle`, `place`, `slide` (44), `gap` (22), `cuts`, `out` | `{ ok, glitch, svg, checks }` (`file` instead of `svg` with `out`), and the result as an image. |
| `combine_marks` | Make two marks one. | `a`, `b` (slug, path or SVG text), `op`, `transform: { scale, rotate, flip, x, y }`, `out` | `{ ok, svg, checks }` (`file` instead of `svg` with `out`), and the result as an image. |
| `build_brand_kit` | Set a chosen mark up as a brand. | `mark`, `name`, `color`, `font`, `tagline`, `url`, `handle`, `styles`, `platforms`, `animated`, `social` (true), `out` (`<name>-kit`) | Writes the folder; its path, the file count, `brand.json`, and the brand sheet as an image. |
| `build_social_pack` | Make every platform's profile images, banners and posts. | `mark`, `name`, `color`, `font`, `tagline`, `url`, `handle`, `platforms`, `styles`, `animated`, `out` (`<name>-social`) | Writes the folder; its path and files, and a preview of each style. |
| `render_mockup` | Show the brand on an object. | `mark`, `object`, `name`, `color`, `font`, `layout`, `surface`, `view`, `base`, `size` (1600), `seed`, `out` | A preview image (up to 800 px); `out` writes the full size. |
| `render_cover` | Make an Open Graph image, header or post. | `mark`, `recipe` (`mark`), `title`, `label`, `color`, `aspect` (`og`), `width` (1200), `seed`, `out` | A preview image (up to 800 px); `out` writes the full size. |

Every argument is described, with its type, choices and default, in the tool's input schema. The editing tools' settings and ops are in [editing](editing.md).

## Annotations

`find_marks`, `similar_marks` and `list_parts` are read-only. `check_mark` (with `fix`), `build_brand_kit` and `build_social_pack` are marked destructive: they rewrite files in place or replace files in a folder. The other tools write only when given `out`, and replace that file. No tool reaches the network (`openWorldHint: false`).

## Errors

A tool that fails returns a tool error (`isError`) with a message to act on: a missing mark comes with the closest slugs, an unknown part with how many the mark has, a missing file with its path.
