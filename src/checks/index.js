/**
 * @module logomarks/checks
 *
 * `check`: every house rule a mark can be measured against, as findings
 * with ids, severities, plain-English messages and locations. `fix`: the
 * one safe repair, refitting to the grid.
 */

import { shapes, bounds } from '@arraypress/marks-kit/svg';
import { fitMark } from '@arraypress/marks-kit/fit';
import { finding } from './finding.js';
import { fitFindings } from './fit.js';
import { speckFindings } from './specks.js';
import { widthFindings } from './widths.js';

/** Severities, most serious first, for sorting. */
const RANK = { error: 0, warning: 1, info: 2 };

/**
 * Checks one mark.
 *
 * @param {string} svg The file's text.
 * @param {import('./index.js').CheckOptions} [o] Its name, and what to leave out.
 * @returns {import('./index.js').Report} The findings, most serious first.
 */
export function check(svg, { name = 'mark', ignore = [], strict = false } = {}) {
	const paths = shapes(svg);
	/** @type {import('./finding.js').Finding[]} */
	let findings;
	/** @type {import('./index.js').Report['size']} */
	let size = null;
	if (!paths.length) findings = [finding('empty', 'There are no filled shapes to check.')];
	else {
		const b = bounds(paths);
		size = { w: Math.round(b.w * 10) / 10, h: Math.round(b.h * 10) / 10 };
		findings = [...fitFindings(svg, b, paths), ...speckFindings(paths, name), ...widthFindings(paths)];
	}
	findings = findings.filter((f) => !ignore.includes(f.id)).sort((a, b) => RANK[a.severity] - RANK[b.severity]);
	const count = (/** @type {import('./finding.js').Severity} */ s) => findings.filter((f) => f.severity === s).length;
	const errors = count('error'), warnings = count('warning');
	return { name, ok: errors === 0 && (!strict || warnings === 0), errors, warnings, notes: count('info'), size, findings };
}

/**
 * Refits a mark when that is all it needs: the fit findings (size, centre,
 * clipping, viewBox, fill, precision) are repaired by `fitMark()`; a mark with
 * groups, transforms or strokes is left alone, since the refit would drop them.
 *
 * @param {string} svg The file's text.
 * @param {import('./index.js').Report} [report] Its report (checked here when not given).
 * @returns {string | null} The fitted file, or null when there is nothing safe to fix.
 */
export function fix(svg, report = check(svg)) {
	if (report.findings.some((f) => f.id === 'markup' || f.id === 'empty')) return null;
	if (!report.findings.some((f) => f.fixable)) return null;
	return fitMark(svg).svg;
}
