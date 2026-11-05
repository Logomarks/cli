/**
 * @module logomarks/edit/ops
 *
 * `edit`: a short list of JSON ops run in order on a mark, each one of
 * `@logomarks/editor`'s pure ops. `parts` are indices in drawing
 * order as `listParts` gives them, at the time the op runs (a delete
 * renumbers what follows); none means every part.
 */

import {
	deleteParts, moveParts, rotateParts, scaleParts, flipParts, roundParts, offsetParts,
	setSymmetry, bakeSymmetry, canvasCenter, setPartAttributes, booleanParts,
} from '@logomarks/editor/ops';
import { parseColor } from '../util/color.js';
import { toDoc, partIds, listParts, finish } from './doc.js';

/**
 * A colour op's hex.
 *
 * @param {string} value The colour.
 * @returns {string} `#RRGGBB`.
 * @throws {RangeError} When it isn't one.
 */
function hex(value) {
	const c = parseColor(value);
	if (!c) throw new RangeError(`"${value}" isn't a hex colour`);
	return c;
}

/** A centre as the editor takes it. */
const at = (/** @type {[number, number] | undefined} */ p) => p && { x: p[0], y: p[1] };

/**
 * Each op: what it does, and how it runs on the document with its parts' ids.
 *
 * @type {Record<string, import('./ops.js').OpSpec>}
 */
export const OPS = {
	delete: { about: 'remove parts', run: (doc, ids) => deleteParts(doc, ids) },
	move: { about: 'move parts by dx, dy units', run: (doc, ids, o) => moveParts(doc, ids, o.dx ?? 0, o.dy ?? 0) },
	rotate: { about: 'rotate parts by angle degrees, clockwise, about their centre (or about)', run: (doc, ids, o) => rotateParts(doc, ids, o.angle ?? 0, at(o.about)) },
	scale: { about: 'scale parts by a factor (or [sx, sy]) about their centre (or about)', run: (doc, ids, o) => {
		const [sx, sy] = Array.isArray(o.by) ? o.by : [o.by ?? 1, o.by ?? 1];
		return scaleParts(doc, ids, sx, sy, at(o.about));
	} },
	flip: { about: 'flip parts horizontally (left to right) or vertically', run: (doc, ids, o) => flipParts(doc, ids, o.axis ?? 'horizontal', at(o.about)) },
	round: { about: 'round every corner of the parts to radius units (0 takes rounds out)', run: (doc, ids, o) => roundParts(doc, ids, o.radius ?? 0) },
	offset: { about: 'grow (positive distance) or shrink (negative) the parts; join miter or round', run: (doc, ids, o) => offsetParts(doc, ids, o.distance ?? 0, { join: o.join }) },
	mirror: { about: 'mirror the whole mark across the centre: vertical (left matches right), horizontal or both; overlaps are unioned', run: (doc, _ids, o) => bakeSymmetry(setSymmetry(doc, { kind: 'mirror', axis: o.axis ?? 'vertical', center: canvasCenter(doc) })) },
	radial: { about: 'repeat the whole mark count times about the centre', run: (doc, _ids, o) => bakeSymmetry(setSymmetry(doc, { kind: 'radial', count: o.count ?? 4, center: canvasCenter(doc) })) },
	union: { about: 'join the parts into one', run: (doc, ids) => booleanParts(doc, 'union', ids) },
	subtract: { about: 'cut the other parts out of the first', run: (doc, ids) => booleanParts(doc, 'subtract', ids) },
	color: { about: 'paint the whole mark in color (it is currentColor otherwise)', run: (doc, _ids, o) => ({ ...doc, fill: hex(o.color ?? '') }) },
	tone: { about: 'paint the parts in a second colour: two-tone (written as var(--tone-2, color))', run: (doc, ids, o) => ({ ...setPartAttributes(doc, ids, { tone: 1 }), tones: [doc.fill, hex(o.color ?? '')] }) },
};

/** The ops that act on the whole mark, so take no `parts`. */
const WHOLE = new Set(['mirror', 'radial', 'color']);

/**
 * A mark edited by a list of ops.
 *
 * @param {string} svg The mark.
 * @param {readonly import('./ops.js').EditOp[]} ops The ops, in order.
 * @param {{ name?: string }} [o] The mark's name, for the checks.
 * @returns {import('./ops.js').EditResult} The SVG, the checks, and its parts after.
 * @throws {RangeError} For an unknown op or a part the mark doesn't have (naming the op by its place).
 */
export function editMark(svg, ops, { name } = {}) {
	let doc = toDoc(svg);
	ops.forEach((op, i) => {
		const spec = OPS[op.op];
		try {
			if (!spec) throw new RangeError(`no op "${op.op}": one of ${Object.keys(OPS).join(', ')}`);
			doc = spec.run(doc, WHOLE.has(op.op) ? [] : partIds(doc, op.parts), op);
		} catch (e) {
			throw new RangeError(`op ${i} (${op.op}): ${/** @type {Error} */ (e).message}`);
		}
	});
	const done = finish(doc, name);
	return { ...done, parts: listParts(toDoc(done.svg)) };
}

/**
 * A mark's parts, by index: what an op's `parts` refer to.
 *
 * @param {string} svg The mark.
 * @returns {import('./doc.js').PartInfo[]} The parts.
 */
export const markParts = (svg) => listParts(toDoc(svg));
