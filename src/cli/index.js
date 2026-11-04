/**
 * @module logomarks/cli
 *
 * The command line: `logomarks <verb> …`. Exit codes: 0 pass, 1 fail,
 * 2 usage.
 */

import fs from 'node:fs';
import { COMMANDS } from './commands/index.js';
import { parseArgs, UsageError } from './args.js';

const { version } = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

/** The help text. */
export const HELP = `logomarks ${version}: check logomarks the way the Logomarks set is checked.

Usage
  logomarks check <file.svg | folder…>     fit, specks, holes, slivers, clipping, gaps, 32 px features
      --fix                                refit to the grid in place (only the safe, deterministic fixes)
      --strict                             warnings fail too
      --ignore speck,uneven-gaps           leave finding ids out
  logomarks similar <file.svg…>            the nearest live marks, with scores
      --top 5                              how many
      --letters                            compare a badge's knocked-out letter instead of its outline
  logomarks sheet <file.svg…> -o sheet.png review cards: large on dark and light, 32 and 16 px,
                                           nearest live marks, check badges
  Every verb takes --json for machine output.

Exit codes: 0 pass, 1 fail, 2 usage.
Rules: 512 canvas, longest side 448, centred; filled paths in currentColor; one gap (22); nothing under 10.
https://logomarks.ai`;

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
