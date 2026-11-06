/**
 * @module logomarks/cli
 *
 * The command line: `logomarks <verb> …`, and `--help` for each verb.
 * Exit codes: 0 ok, 1 a check failed or the command failed, 2 usage.
 */

import { COMMANDS } from './commands/index.js';
import { parseArgs, UsageError } from './args.js';
import { formatHelp } from './help.js';
import { style, pad } from './style.js';
import { VERSION as version } from '../util/version.js';

/** The verbs as the help groups them. */
const GROUPS = [
	['Find and get', ['find', 'get']],
	['Check', ['check', 'similar', 'specks', 'sheet']],
	['Edit', ['parts', 'edit', 'glitch', 'combine']],
	['Build', ['kit', 'social', 'mockup', 'cover']],
	['Agents', ['mcp']],
];

/** The help text: every verb in a line, the common examples, and where to read more. */
export const HELP = `logomarks ${version}: find, check, edit and build on free geometric logomarks.

${style.bold('Usage')}
  logomarks <command> [arguments] [options]
  logomarks <command> --help

${GROUPS.map(([group, verbs]) => `${style.bold(group)}\n${verbs.map((v) => `  ${pad(v, 10)}${COMMANDS[/** @type {keyof typeof COMMANDS} */ (v)].help.summary}`).join('\n')}`).join('\n\n')}

A <mark> is a live slug or name (hex-gem, "Hex Gem") or the path to your own .svg.
Every command takes --json. Exit codes: 0 ok, 1 a check failed or the command failed, 2 usage.

${style.bold('Examples')}
  logomarks find coffee
  logomarks get hex-gem --color '#ff5c3a' -o logo.svg
  logomarks check mark.svg
  logomarks kit hex-gem --name "Hexa Labs" -o hexa/

${style.bold('Options')}
  -h, --help       Show help (for a command: logomarks <command> --help).
  -v, --version    Show the version.

Docs: https://logomarks.ai/agents  ·  The marks are CC0; the CLI is MIT.`;

/**
 * Whether the arguments ask for help.
 *
 * @param {readonly string[]} args The arguments after the verb.
 * @returns {boolean} True for `--help` or `-h`.
 */
const wantsHelp = (args) => args.includes('--help') || args.includes('-h');

/**
 * What went wrong, in a line: a missing or unwritable file by its path, anything else by its message.
 *
 * @param {unknown} e The error.
 * @returns {string} The message.
 */
function explain(e) {
	const err = /** @type {NodeJS.ErrnoException} */ (e);
	if (err?.code === 'ENOENT') return `no such file or folder: ${err.path}`;
	if (err?.code === 'EACCES' || err?.code === 'EPERM') return `permission denied: ${err.path}`;
	if (err?.code === 'EISDIR') return `${err.path} is a folder`;
	return err instanceof Error ? err.message : String(e);
}

/**
 * Runs the CLI.
 *
 * @param {readonly string[]} argv The arguments (without node and the script).
 * @param {import('./index.js').IO} [io] Where output goes (stdout and stderr).
 * @returns {Promise<number>} The exit code: 0 ok, 1 a check failed or the command failed, 2 usage.
 */
export async function main(argv, io = { out: (s) => console.log(s), err: (s) => console.error(s) }) {
	const [verb, ...rest] = argv;
	if (!verb) { io.err(HELP); return 2; }
	if (verb === '--help' || verb === '-h') { io.out(HELP); return 0; }
	if (verb === '--version' || verb === '-v' || verb === 'version') { io.out(version); return 0; }
	if (verb === 'help') {
		const topic = COMMANDS[/** @type {keyof typeof COMMANDS} */ (rest[0])];
		if (rest[0] && !topic) { io.err(`logomarks: unknown command "${rest[0]}". Run "logomarks --help" for the list.`); return 2; }
		io.out(topic ? formatHelp(rest[0], topic.help) : HELP);
		return 0;
	}
	const command = COMMANDS[/** @type {keyof typeof COMMANDS} */ (verb)];
	if (!command) {
		io.err(`logomarks: unknown command "${verb}". Run "logomarks --help" for the list.`);
		return 2;
	}
	if (wantsHelp(rest)) { io.out(formatHelp(verb, command.help)); return 0; }
	try {
		return await command.run(parseArgs(rest, command.spec), io);
	} catch (e) {
		if (e instanceof UsageError) {
			io.err(`logomarks ${verb}: ${e.message}\nRun "logomarks ${verb} --help" for usage.`);
			return 2;
		}
		io.err(`logomarks ${verb}: ${explain(e)}`);
		if (process.env.LOGOMARKS_DEBUG) io.err(String(/** @type {Error} */ (e)?.stack ?? e));
		return 1;
	}
}
