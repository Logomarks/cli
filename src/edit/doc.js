/**
 * @module logomarks/edit/doc
 *
 * A mark as an editable document (`@arraypress/vector-editor`'s model, no
 * DOM), its parts listed by index, and a result finished the house way:
 * fitted to 448 on the 512 canvas, centred, and checked (fit, specks,
 * slivers, pin-holes, gaps).
 */

import { parseSvg, parts as partsOf, partBounds, ring } from '@arraypress/vector-editor/model';
import { exportSvg } from '@arraypress/vector-editor/export';
import { fitMark } from '@arraypress/marks-kit/fit';
import { area } from '@arraypress/marks-kit/geometry';
import { check } from '../checks/index.js';
import { round } from '../util/round.js';

/**
 * A mark as a document.
 *
 * @param {string} svg The mark.
 * @returns {import('@arraypress/vector-editor').Doc} The document.
 * @throws {Error} When it has no filled shapes.
 */
export function toDoc(svg) {
	const doc = parseSvg(svg);
	if (!partsOf(doc).length) throw new Error('the mark has no filled shapes');
	return doc;
}

/**
 * A contour's area.
 *
 * @param {import('@arraypress/vector-editor').Contour} c The contour.
 * @returns {number} Square units.
 */
const contourArea = (c) => area(ring(c).map((p) => [p.x, p.y]));

/**
 * Every part, by index in drawing order: what the ops' `parts` refer to.
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @returns {import('./doc.js').PartInfo[]} The parts.
 */
export function listParts(doc) {
	return partsOf(doc).map((p, index) => {
		const [x0, y0, x1, y1] = partBounds(p);
		return {
			index,
			box: [x0, y0, x1, y1].map((v) => round(v, 1)),
			centre: [round((x0 + x1) / 2, 1), round((y0 + y1) / 2, 1)],
			area: round(contourArea(p.outer) - p.holes.reduce((s, h) => s + contourArea(h), 0)),
			holes: p.holes.length,
			tone: p.outer.tone ?? 0,
		};
	});
}

/**
 * Part indices as ids; none (or undefined) is every part.
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @param {readonly number[] | undefined} indices The indices.
 * @returns {string[]} The ids.
 * @throws {RangeError} For an index the mark doesn't have.
 */
export function partIds(doc, indices) {
	const all = partsOf(doc);
	if (!indices?.length) return all.map((p) => p.id);
	return indices.map((i) => {
		if (!Number.isInteger(i) || !all[i]) throw new RangeError(`no part ${i}: the mark has ${all.length} (0–${all.length - 1}); list_parts shows them`);
		return all[i].id;
	});
}

/**
 * Whether a document is coloured beyond `currentColor` (a second tone, or a fill).
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @returns {boolean} True when it is.
 */
const coloured = (doc) => doc.fill !== 'currentColor' || partsOf(doc).some((p) => p.outer.tone);

/**
 * A result finished: fitted (448 on 512, centred, by marks-kit; a coloured
 * one by the editor's own fit, which keeps its fills) and checked.
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @param {string} [name] The mark's name, for the report.
 * @returns {import('./doc.js').Edited} The SVG and the checks.
 * @throws {Error} When nothing is left.
 */
export function finish(doc, name = 'mark') {
	if (!partsOf(doc).length) throw new Error('nothing is left of the mark');
	const svg = coloured(doc) ? exportSvg(doc, { fit: true, tones: 'var' }) : fitMark(exportSvg(doc)).svg;
	return { svg, checks: check(svg, { name }) };
}
