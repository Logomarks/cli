/**
 * @module logomarks/cli/args
 *
 * A small argument parser: positionals, boolean flags, and options with a
 * value (`--top 3`, `--top=3`, `-o out.png`). Anything unknown is a usage
 * error.
 */

/** A usage error: the CLI prints it with the help and exits 2. */
export class UsageError extends Error {}

/**
 * Parses a command's arguments.
 *
 * @param {readonly string[]} argv The arguments after the verb.
 * @param {import('./args.js').ArgSpec} spec The flags and options it takes.
 * @returns {import('./args.js').Parsed} The positionals, flags and options.
 * @throws {UsageError} On an unknown flag or a missing value.
 */
export function parseArgs(argv, { flags = [], options = {} }) {
	/** @type {import('./args.js').Parsed} */
	const out = { positionals: [], flags: new Set(), options: {} };
	const alias = Object.fromEntries(Object.entries(options).filter(([, a]) => a).map(([name, a]) => [`-${a}`, name]));
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (!a.startsWith('-') || a === '-') { out.positionals.push(a); continue; }
		const [key, inline] = a.startsWith('--') ? [a.slice(2).split('=')[0], a.includes('=') ? a.slice(a.indexOf('=') + 1) : undefined] : [alias[a], undefined];
		if (key && flags.includes(key) && inline === undefined) { out.flags.add(key); continue; }
		if (!key || !(key in options)) throw new UsageError(`unknown option ${a}`);
		const value = inline ?? argv[++i];
		if (value === undefined) throw new UsageError(`${a} needs a value`);
		out.options[key] = value;
	}
	return out;
}
