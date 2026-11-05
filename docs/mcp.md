# MCP tools

`logomarks mcp` runs the CLI's functions as MCP tools on stdio, locally: nothing leaves the machine. Relative paths resolve against the server's working folder. The renderer, the typefaces and the live set load once and stay warm.

```bash
claude mcp add logomarks -- npx -y logomarks mcp        # Claude Code (or install the logomarks plugin: skills too)
codex mcp add logomarks -- npx -y logomarks mcp         # Codex (~/.codex/config.toml → [mcp_servers.logomarks])
```

| Tool | Arguments | Returns |
|---|---|---|
| `find_marks` | `query`, `style`, `tags`, `industry`, `letter`, `limit` | `{ total, marks }`; no arguments: the facets. |
| `get_mark` | `mark`, `color`, `size`, `out` | The SVG; a PNG with `size`. |
| `check_mark` | `svg` or `paths`, `fix`, `strict`, `ignore` | `{ ok, passed, failed, marks: [{ findings }] }`. |
| `similar_marks` | `svg` or `paths`, `top`, `letters` | The nearest live marks with scores and verdicts. |
| `review_sheet` | `svg` or `paths`, `strict`, `ignore`, `out` | The review cards as an image. |
| `list_parts` | `mark` or `svg` | `{ count, parts: [{ index, box, centre, area, holes, tone }] }` and the parts numbered, as an image. |
| `glitch_mark` | `mark` or `svg`, `preset`, `angle`, `place`, `slide`, `gap`, `cuts`, `seed`, `out` | `{ ok, glitch, svg, checks }` and the result as an image. |
| `edit_mark` | `mark` or `svg`, `ops`, `out` | `{ ok, parts, svg, checks }` and the result as an image. |
| `combine_marks` | `a`, `b` (slug, path or SVG text), `op`, `transform: { scale, rotate, flip, x, y }`, `out` | `{ ok, svg, checks }` and the result as an image. |
| `brand_kit` | `mark`, `name`, `color`, `font`, `tagline`, `url`, `handle`, `styles`, `platforms`, `animated`, `social`, `out` | Writes the folder; its path, `brand.json`, and the brand sheet as an image. |
| `social_pack` | `mark`, `name`, `color`, `font`, `tagline`, `url`, `handle`, `platforms`, `styles`, `animated`, `out` | Writes the folder; its files, and a preview of each style. |
| `mockup` | `mark`, `object`, `name`, `color`, `font`, `layout`, `surface`, `view`, `base`, `size`, `seed`, `out` | A preview image; `out` writes the full size. |
| `cover` | `mark`, `recipe`, `title`, `label`, `color`, `aspect`, `width`, `seed`, `out` | A preview image; `out` writes the full size. |

The editing tools' settings and ops are in [editing](editing.md). A tool that fails returns a tool error with a message to act on: a missing mark comes with the closest slugs, an unknown part with how many the mark has.
