/**
 * @module logomarks/cli/report
 *
 * A check report as readable lines: a mark's verdict, size and counts, then
 * each finding with its id, message and where it is.
 */

import { style, pad } from './style.js';

/** Severity labels. */
const LABEL = { error: style.red('error  '), warning: style.yellow('warning'), info: style.dim('note   ') };

/**
 * A report as readable lines.
 *
 * @param {string} file The file (or the mark's name).
 * @param {import('../checks/index.js').Report} r Its report.
 * @param {boolean} [fixed] Whether it was refitted.
 * @returns {string} The lines.
 */
export function reportLines(file, r, fixed = false) {
	const sym = !r.ok ? style.red('✗') : r.warnings ? style.yellow('!') : style.green('✓');
	const counts = [r.errors && `${r.errors} error${r.errors > 1 ? 's' : ''}`, r.warnings && `${r.warnings} warning${r.warnings > 1 ? 's' : ''}`].filter(Boolean).join(', ');
	const size = r.size ? `${r.size.w} × ${r.size.h}` : 'empty';
	const head = `${sym} ${style.bold(file)}  ${style.dim(size)}${counts ? `  ${counts}` : ''}${fixed ? style.green('  refitted') : ''}`;
	const body = r.findings.map((f) => `    ${LABEL[f.severity]}  ${pad(f.id, 12)} ${f.message}${f.box ? style.dim(`  [${f.box.join(', ')}]`) : f.point ? style.dim(`  (${f.point.join(', ')})`) : ''}`);
	return [head, ...body].join('\n');
}
