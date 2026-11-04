/**
 * @module logomarks/cli/commands/check
 *
 * `logomarks check <file.svg…>`: every house rule, per mark. `--fix` refits
 * marks whose only fixable problems are the fit, in place.
 */

import fs from 'node:fs';
import { check, fix } from '../../checks/index.js';
import { svgFiles, slugOf } from '../files.js';
import { style, pad } from '../style.js';

/** What `check` takes. */
export const spec = { flags: ['json', 'fix', 'strict'], options: { ignore: '' } };

/** Severity labels for the readable output. */
const LABEL = { error: style.red('error  '), warning: style.yellow('warning'), info: style.dim('note   ') };

/**
 * A report as readable lines.
 *
 * @param {string} file The file.
 * @param {import('../../checks/index.js').Report} r Its report.
 * @param {boolean} fixed Whether it was refitted.
 * @returns {string} The lines.
 */
function lines(file, r, fixed) {
	const sym = !r.ok ? style.red('✗') : r.warnings ? style.yellow('!') : style.green('✓');
	const counts = [r.errors && `${r.errors} error${r.errors > 1 ? 's' : ''}`, r.warnings && `${r.warnings} warning${r.warnings > 1 ? 's' : ''}`].filter(Boolean).join(', ');
	const size = r.size ? `${r.size.w} × ${r.size.h}` : 'empty';
	const head = `${sym} ${style.bold(file)}  ${style.dim(size)}${counts ? `  ${counts}` : ''}${fixed ? style.green('  refitted') : ''}`;
	const body = r.findings.map((f) => `    ${LABEL[f.severity]}  ${pad(f.id, 12)} ${f.message}${f.box ? style.dim(`  [${f.box.join(', ')}]`) : f.point ? style.dim(`  (${f.point.join(', ')})`) : ''}`);
	return [head, ...body].join('\n');
}

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
