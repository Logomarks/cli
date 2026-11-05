/**
 * @module logomarks/cli/edited
 *
 * How the editing verbs hand back a result: the SVG to `-o` (or a PNG to
 * look at, for `.png`) or to stdout, and its checks; `--json` for both as
 * one object. Exit 1 when the result fails a check.
 */

import { markPreview } from '../edit/preview.js';
import { writeFile } from '../util/files.js';
import { reportLines } from './report.js';
import { style } from './style.js';

/**
 * Writes or prints an edited mark and its checks.
 *
 * @param {import('./args.js').Parsed} args The parsed arguments (`-o`, `--json`).
 * @param {import('./index.js').IO} io Where output goes.
 * @param {import('../edit/doc.js').Edited & Record<string, unknown>} r The result, and anything more to report.
 * @param {{ name: string, summary: string }} o The mark's name, and a line on what was done.
 * @returns {Promise<number>} The exit code: 0 when the result passes its checks, 1 otherwise.
 */
export async function output(args, io, { svg, checks, ...more }, { name, summary }) {
	const file = args.options.out;
	if (file) writeFile(file, file.toLowerCase().endsWith('.png') ? await markPreview(svg) : svg);
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: checks.ok, ...more, ...(file && { file }), svg, checks }, null, 2));
	else if (!file) {
		io.out(svg.trimEnd());
		io.err(`${summary}\n${reportLines(name, checks)}`);
	} else io.out(`${style.green('✓')} wrote ${style.bold(file)}: ${summary}\n${reportLines(file, checks)}`);
	return checks.ok ? 0 : 1;
}
