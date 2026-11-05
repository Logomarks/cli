/**
 * @module logomarks/cli/commands/check
 *
 * `logomarks check <file.svg…>`: every house rule, per mark. `--fix` refits
 * marks whose only fixable problems are the fit, in place.
 */

import fs from 'node:fs';
import { check, fix } from '../../checks/index.js';
import { svgFiles, slugOf } from '../files.js';
import { style } from '../style.js';
import { reportLines as lines } from '../report.js';

/** What `check` takes. */
export const spec = { flags: ['json', 'fix', 'strict'], options: { ignore: '' } };

/** `logomarks check --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Check SVG marks against the house rules.',
	usage: ['<file.svg | folder>… [options]'],
	about: [
		'Measures the fit (512 canvas, longest side 448, centred), the markup, specks, slivers,',
		'pin-holes, clipping, gap widths and features too small for 32 px. Each finding has an id,',
		'a severity and a box. Exit 0 when every mark passes, 1 when any fails.',
	],
	options: [
		['--fix', 'Refit to the grid in place (the only automatic fix).'],
		['--strict', 'Count warnings as failures too.'],
		['--ignore <ids>', 'Leave these finding ids out, e.g. speck,uneven-gaps.'],
	],
	examples: ['logomarks check mark.svg', 'logomarks check marks/ --fix', 'logomarks check out/*.svg --strict --json'],
};

/**
 * Runs `check`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0 when every mark passes, 1 otherwise.
 */
export async function run(args, io) {
	const files = svgFiles(args.positionals);
	const ignore = (args.options.ignore ?? '').split(',').filter(Boolean);
	const strict = args.flags.has('strict');
	const results = files.map((file) => {
		const svg = fs.readFileSync(file, 'utf8');
		const name = slugOf(file);
		let report = check(svg, { name, ignore, strict });
		const fitted = args.flags.has('fix') ? fix(svg, report) : null;
		if (fitted) {
			fs.writeFileSync(file, fitted);
			report = check(fitted, { name, ignore, strict });
		}
		return { file, fixed: Boolean(fitted), report };
	});
	const failed = results.filter((r) => !r.report.ok).length;
	if (args.flags.has('json')) {
		io.out(JSON.stringify({ ok: !failed, passed: results.length - failed, failed, marks: results.map(({ file, fixed, report }) => ({ file, fixed, ...report })) }, null, 2));
	} else {
		for (const { file, fixed, report } of results) io.out(lines(file, report, fixed));
		const warned = results.filter((r) => r.report.ok && r.report.warnings).length;
		io.out(`\n${results.length - failed} of ${results.length} passed${warned ? ` (${warned} with warnings)` : ''}${failed ? style.red(`, ${failed} failed`) : ''}`);
	}
	return failed ? 1 : 0;
}
