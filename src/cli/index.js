/**
 * @module logomarks/cli
 *
 * The command line: `logomarks <verb> …`. Exit codes: 0 pass, 1 fail,
 * 2 usage.
 */

import { COMMANDS } from './commands/index.js';
import { parseArgs, UsageError } from './args.js';
import { FONTS } from '../brand/fonts.js';
import { OBJECTS } from '../mockup/index.js';
import { RECIPES } from '../cover/index.js';
import { PRESETS } from '../edit/glitch.js';
import { OPS } from '../edit/ops.js';
import { COMBINE_OPS } from '../edit/combine.js';
import { STYLE_IDS } from '@arraypress/brand-kit';
import { VERSION as version } from '../util/version.js';


/**
 * Names as an indented list in the help's right-hand column, wrapped.
 *
 * @param {readonly string[]} names The names.
 * @returns {string} The lines.
 */
function list(names) {
	const lines = [''];
	for (const n of names) {
		const last = lines.length - 1;
		if (lines[last] && lines[last].length + n.length > 56) lines.push('');
		lines[lines.length - 1] += `${lines[lines.length - 1] ? ', ' : ''}${n}`;
	}
	return lines.map((l) => `${' '.repeat(43)}${l}`).join(',\n');
}

/** The help text. */
export const HELP = `logomarks ${version}: check logomarks the way the Logomarks set is checked, edit them, and build a brand on one.

Check
  logomarks check <file.svg | folder…>     fit, specks, holes, slivers, clipping, gaps, 32 px features
      --fix                                refit to the grid in place (only the safe, deterministic fixes)
      --strict                             warnings fail too
      --ignore speck,uneven-gaps           leave finding ids out
  logomarks similar <file.svg…>            the nearest live marks, with scores
      --top 5                              how many
      --letters                            compare a badge's knocked-out letter instead of its outline
      --against <dir>                      a folder of SVGs instead of the bundled live marks
      --each                               the candidates against each other too (marked *)
  logomarks similar --all <data dir> [--out similar.json]
                                           every mark's 8 nearest ("More like this") for a whole set
  logomarks specks <folder | file.svg…>    the speck review: every piece under 60 and hole under 30, with its box
      --piece 60 --hole 30 --allow slug,slug --all --raster
  logomarks sheet <file.svg…> -o sheet.png review cards: large on dark and light, 32 and 16 px,
                                           nearest live marks, check badges
      --plain [--cols 8]                   a plain labelled grid instead (a quick look at a batch)

Find
  logomarks find <words…>                  search the live set: "fox", "calm hexagon", "coffee"
      --style badge --tag round,symmetric --industry fintech --letter K --top 20
                                           no words or filters: every style, tag, mood and industry

Edit (fitted to the grid and checked; -o file.svg or .png, else the SVG to stdout)
  logomarks parts <mark> [-o parts.png]    the parts by index, box and area (what --ops names)
  logomarks glitch <mark> --preset shear   a glitch edition: ${Object.keys(PRESETS).join(', ')}
      --seed 1 --angle --place 0-1 --slide 44 --gap 22 --cuts
  logomarks edit <mark> --ops '[{"op":"delete","parts":[0]}]'   (or --ops @ops.json)
${list(Object.keys(OPS))}
  logomarks combine <a> <b> --op subtract  ${COMBINE_OPS.join(', ')}
      --scale 0.5 --rotate 45 --flip horizontal --x 0 --y 0   (b, over a)

Build (a live mark by slug or name, or your own .svg)
  logomarks get <slug|name> [-o file]      a live mark's SVG (CC0) to stdout or a file
      --color #hex  --size 512  --format svg|png
  logomarks kit <mark> --name "Brand" -o dir/
                                           the brand kit: mark, favicons, lockups, palette, tokens,
                                           brand sheet, brand.json and the social pack
      --color #hex  --font ${Object.keys(FONTS).join('|')}
      --tagline --url --handle  --styles ${STYLE_IDS.join(',')}  --platforms  --animated  --no-social
  logomarks social <mark> --name "Brand" -o dir/
                                           every platform's images at its size, in each style
      --platforms instagram,linkedin,x-header  --styles bold  --animated  (and kit's brand options)
  logomarks mockup <mark> --object card -o card.png
${list(Object.keys(OBJECTS))}
      --name --color --font --layout --surface oak|concrete|linen|paper --view front|angle
      --base white|black|navy|#hex (the object's colour) --size 1600
  logomarks cover <mark> --recipe mark --title "…" -o cover.png
${list(Object.keys(RECIPES))}
      --label --color --aspect og|1:1|16:9 --width 1200

  Every verb takes --json for machine output. -o file.svg writes a mockup's or cover's SVG.

Agents
  logomarks mcp                            the same as MCP tools on stdio (Claude Code, Codex, Cursor):
                                           find_marks, get_mark, check_mark, similar_marks, review_sheet,
                                           list_parts, glitch_mark, edit_mark, combine_marks,
                                           brand_kit, social_pack, mockup, cover

Exit codes: 0 pass, 1 fail, 2 usage.
Rules: 512 canvas, longest side 448, centred; filled paths in currentColor; one gap (22); nothing under 10.
Free and MIT. The full brand kit, photoreal mockups, custom logos and exclusive wordmarks: https://logomarks.ai/pricing`;

/**
 * Runs the CLI.
 *
 * @param {readonly string[]} argv The arguments (without node and the script).
 * @param {import('./index.js').IO} [io] Where output goes (stdout and stderr).
 * @returns {Promise<number>} The exit code.
 */
export async function main(argv, io = { out: (s) => console.log(s), err: (s) => console.error(s) }) {
	const [verb, ...rest] = argv;
	if (!verb || verb === '--help' || verb === '-h' || verb === 'help') { io.out(HELP); return verb ? 0 : 2; }
	if (verb === '--version' || verb === '-v') { io.out(version); return 0; }
	const command = COMMANDS[/** @type {keyof typeof COMMANDS} */ (verb)];
	try {
		if (!command) throw new UsageError(`unknown command "${verb}"`);
		return await command.run(parseArgs(rest, command.spec), io);
	} catch (e) {
		if (!(e instanceof UsageError)) throw e;
		io.err(`logomarks: ${e.message}\n\n${HELP}`);
		return 2;
	}
}
