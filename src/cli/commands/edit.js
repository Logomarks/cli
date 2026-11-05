/**
 * @module logomarks/cli/commands/edit
 *
 * `logomarks edit <slug|file.svg> --ops '[…]' -o out.svg`: edits by part,
 * as JSON (`--ops @ops.json` reads a file), fitted and checked.
 */

import fs from 'node:fs';
import { editMark } from '../../edit/ops.js';
import { UsageError } from '../args.js';
import { markArg, asUsage } from '../options.js';
import { output } from '../edited.js';
import { OPS } from '../../edit/ops.js';
import { wrapList } from '../help.js';

/** What `edit` takes. */
export const spec = { flags: ['json'], options: { out: 'o', ops: '' } };

/** `logomarks edit --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Edit a mark by part, with a list of ops.',
	usage: ["<mark> --ops '<json>' [-o out.svg]", '<mark> --ops @ops.json [-o out.svg]'],
	about: [
		'Ops run in order; "parts" are indices from logomarks parts. The result is fitted and',
		'checked, and exit 1 means it fails a check. Each op\'s settings: docs/editing.md.',
		`Ops: ${wrapList(Object.keys(OPS), 66)}.`,
	],
	options: [
		['--ops <json | @file>', 'The ops as a JSON array, or @ and a file holding one.'],
		['-o, --out <file>', 'Write .svg, or .png drawn at 512. Default: the SVG to stdout.'],
	],
	examples: [
		`logomarks edit quad-cove --ops '[{"op":"delete","parts":[3]},{"op":"round","radius":18}]' -o mine.svg`,
		'logomarks edit mark.svg --ops @ops.json -o mine.png',
	],
};

/**
 * The ops option: JSON, or `@file` holding it.
 *
 * @param {string | undefined} value The option's value.
 * @returns {import('../../edit/ops.js').EditOp[]} The ops.
 * @throws {UsageError} When it's missing or isn't a JSON list.
 */
function opsArg(value) {
	if (!value) throw new UsageError('--ops takes a JSON list of edits, e.g. \'[{"op":"delete","parts":[0]}]\', or @ops.json');
	let ops;
	try {
		ops = JSON.parse(value.startsWith('@') ? fs.readFileSync(value.slice(1), 'utf8') : value);
	} catch (e) {
		throw new UsageError(`--ops: ${/** @type {Error} */ (e).message}`);
	}
	if (!Array.isArray(ops) || !ops.every((o) => o && typeof o.op === 'string')) throw new UsageError('--ops is a JSON list of objects, each with an "op"');
	return ops;
}

/**
 * Runs `edit`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0 when the result passes its checks, 1 otherwise.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const ops = opsArg(args.options.ops);
	const r = await asUsage(async () => editMark(mark.svg, ops, { name: mark.slug }));
	return output(args, io, r, { name: mark.slug, summary: `${mark.name}, ${ops.map((o) => o.op).join(', ')} (${r.parts.length} parts)` });
}
