/**
 * @module logomarks/cli
 *
 * The command line: `logomarks <verb> …`. Exit codes: 0 pass, 1 fail,
 * 2 usage.
 */

import fs from 'node:fs';
import { COMMANDS } from './commands/index.js';
import { parseArgs, UsageError } from './args.js';
import { FONTS } from '../brand/fonts.js';
import { OBJECTS } from '../mockup/index.js';
import { RECIPES } from '../cover/index.js';

const { version } = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

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
export const HELP = `logomarks ${version}: check logomarks the way the Logomarks set is checked, and build a brand on one.

Check
  logomarks check <file.svg | folder…>     fit, specks, holes, slivers, clipping, gaps, 32 px features
      --fix                                refit to the grid in place (only the safe, deterministic fixes)
      --strict                             warnings fail too
      --ignore speck,uneven-gaps           leave finding ids out
  logomarks similar <file.svg…>            the nearest live marks, with scores
      --top 5                              how many
      --letters                            compare a badge's knocked-out letter instead of its outline
  logomarks sheet <file.svg…> -o sheet.png review cards: large on dark and light, 32 and 16 px,
                                           nearest live marks, check badges

Build (a live mark by slug or name, or your own .svg)
  logomarks get <slug|name> [-o file]      a live mark's SVG (CC0) to stdout or a file
      --color #hex  --size 512  --format svg|png
  logomarks kit <mark> --name "Brand" -o dir/
                                           a free starter kit: mark SVG and PNGs, favicons, lockups,
                                           palette, social images, brand.json, brand-sheet.png
      --color #hex  --font ${Object.keys(FONTS).join('|')}
  logomarks mockup <mark> --object card -o card.png
${list(Object.keys(OBJECTS))}
      --name --color --font --layout --surface oak|concrete|linen|paper --view front|angle
      --base white|black|navy|#hex (the object's colour) --size 1600
  logomarks cover <mark> --recipe mark --title "…" -o cover.png
${list(Object.keys(RECIPES))}
      --label --color --aspect og|1:1|16:9 --width 1200

  Every verb takes --json for machine output. -o file.svg writes a mockup's or cover's SVG.

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
