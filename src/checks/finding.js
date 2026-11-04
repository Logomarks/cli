/**
 * @module logomarks/checks/finding
 *
 * The findings a check can report, by id, and a constructor that rounds
 * locations for output. Ids are stable: an AI can act on them.
 */

/**
 * Every finding id: its usual severity, whether `--fix` repairs it, and how
 * to fix it by hand.
 *
 * @type {Record<import('./finding.js').FindingId, import('./finding.js').FindingKind>}
 */
export const FINDINGS = {
	empty: { severity: 'error', fixable: false, fix: 'Draw the mark as filled <path> elements.' },
	viewbox: { severity: 'error', fixable: true, fix: 'Use viewBox="0 0 512 512" (--fix refits).' },
	size: { severity: 'error', fixable: true, fix: 'Scale so the longest side is exactly 448 (--fix refits).' },
	centre: { severity: 'error', fixable: true, fix: 'Centre the outline on (256, 256) (--fix refits).' },
	clipped: { severity: 'error', fixable: true, fix: 'Part of the outline is outside 0–512 and is cut off (--fix refits).' },
	markup: { severity: 'error', fixable: false, fix: 'Flatten to filled paths: expand strokes, apply transforms, drop groups, styles, masks, text and images.' },
	fill: { severity: 'warning', fixable: true, fix: 'Fill with currentColor only; holes are real holes, never a painted background (--fix refits).' },
	precision: { severity: 'warning', fixable: true, fix: 'Round coordinates to one decimal place (--fix refits).' },
	speck: { severity: 'error', fixable: false, fix: 'A stray piece a boolean left behind: render it large, and remove it if it is not meant.' },
	sliver: { severity: 'error', fixable: false, fix: 'A thin leftover piece along a cut: remove it, or grow the cut with a true offset.' },
	pinhole: { severity: 'error', fixable: false, fix: 'A tiny hole an overlap left: union the overlapping parts, or remove the hole if it is not meant.' },
	thin: { severity: 'warning', fixable: false, fix: 'Thicken it to at least 10 units, or remove it: it vanishes at 32 px.' },
	'narrow-gap': { severity: 'warning', fixable: false, fix: 'Open the gap to at least 10 units (the house gap is 22): it closes up at 32 px.' },
	'uneven-gaps': { severity: 'warning', fixable: false, fix: 'Use one gap width throughout (22), or a clear 1:2 ratio.' },
	'raster-read': { severity: 'info', fixable: false, fix: 'The vector booleans could not read this mark; small parts were found on a raster, which can miss a speck touching the outline.' },
};

/**
 * A finding, with its location rounded to one decimal.
 *
 * @param {import('./finding.js').FindingId} id What was found.
 * @param {string} message A plain-English sentence.
 * @param {object} [o] Where and how much.
 * @param {import('../geometry/polygon.js').Box} [o.box] Where, as a box on the canvas.
 * @param {import('../geometry/polygon.js').Point} [o.point] Where, as a point.
 * @param {number} [o.value] The measured number (an area, a width).
 * @param {import('./finding.js').Severity} [o.severity] Overrides the usual severity.
 * @returns {import('./finding.js').Finding} The finding.
 */
export function finding(id, message, { box, point, value, severity } = {}) {
	const r = (/** @type {number} */ v) => Math.round(v * 10) / 10;
	const kind = FINDINGS[id];
	return {
		id,
		severity: severity ?? kind.severity,
		message,
		...(box && { box: /** @type {import('../geometry/polygon.js').Box} */ (box.map(r)) }),
		...(point && { point: /** @type {import('../geometry/polygon.js').Point} */ (point.map(r)) }),
		...(value !== undefined && { value: r(value) }),
		fixable: kind.fixable,
		fix: kind.fix,
	};
}
