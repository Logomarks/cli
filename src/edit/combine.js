/**
 * @module logomarks/edit/combine
 *
 * Two marks made one: the second placed over the first (scaled, turned,
 * moved), then joined, cut, crossed or exclusive-ored with the editor's
 * curve-keeping booleans, or simply placed.
 */

import { insertSvg, newParts, duplicateParts, deleteParts, booleanParts, scaleParts, rotateParts, flipParts, moveParts } from '@arraypress/vector-editor/ops';
import { parts } from '@arraypress/vector-editor/model';
import { toDoc, finish } from './doc.js';

/** The ways two marks combine. */
export const COMBINE_OPS = /** @type {const} */ (['union', 'subtract', 'intersect', 'exclude', 'place']);

/** The ids of a document's parts. */
const idsOf = (/** @type {import('@arraypress/vector-editor').Doc} */ doc) => parts(doc).map((p) => p.id);

/**
 * Copies of some parts, in place.
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @param {string[]} ids The parts.
 * @returns {{ doc: import('@arraypress/vector-editor').Doc, ids: string[] }} The document with them, and the copies' ids.
 */
function copy(doc, ids) {
	const next = duplicateParts(doc, ids);
	return { doc: next, ids: newParts(doc, next) };
}

/**
 * Every `keep` part with every `cut` part taken out of it (a part is one
 * boolean operand, so each takes fresh copies of the cutters); the cutters
 * are left as they were.
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @param {string[]} keep The parts to cut.
 * @param {string[]} cut The parts to cut with.
 * @returns {{ doc: import('@arraypress/vector-editor').Doc, ids: string[] }} The document, and what is left of `keep`.
 */
function cutOut(doc, keep, cut) {
	const left = [];
	for (const id of keep) {
		const c = copy(doc, cut);
		const next = booleanParts(c.doc, 'subtract', [id, ...c.ids]);
		left.push(...newParts(c.doc, next));
		doc = next;
	}
	return { doc, ids: left };
}

/** Each boolean, from a document holding both marks' parts. @type {Record<string, (doc: import('@arraypress/vector-editor').Doc, a: string[], b: string[]) => import('@arraypress/vector-editor').Doc>} */
const COMBINE = {
	place: (doc) => doc,
	union: (doc, a, b) => booleanParts(doc, 'union', [...a, ...b]),
	subtract: (doc, a, b) => deleteParts(cutOut(doc, a, b).doc, b),
	// A ∩ B = A − (A − B)
	intersect: (doc, a, b) => {
		const a2 = copy(doc, a);
		const outside = cutOut(a2.doc, a2.ids, b);
		return deleteParts(cutOut(outside.doc, a, outside.ids).doc, [...b, ...outside.ids]);
	},
	// (A − B) ∪ (B − A), each cut with copies of the other as it was
	exclude: (doc, a, b) => {
		const a2 = copy(doc, a), b2 = copy(a2.doc, b);
		const left = cutOut(b2.doc, a, b2.ids);
		return deleteParts(cutOut(left.doc, b, a2.ids).doc, [...a2.ids, ...b2.ids]);
	},
};

/**
 * The second mark placed: scaled and turned about its own centre, flipped, then moved.
 *
 * @param {import('@arraypress/vector-editor').Doc} doc The document.
 * @param {string[]} ids Its parts.
 * @param {import('./combine.js').Placement} t How.
 * @returns {import('@arraypress/vector-editor').Doc} The document.
 */
function place(doc, ids, { scale = 1, rotate = 0, flip, x = 0, y = 0 } = {}) {
	let d = scale === 1 ? doc : scaleParts(doc, ids, scale);
	if (rotate) d = rotateParts(d, ids, rotate);
	if (flip) d = flipParts(d, ids, flip);
	return x || y ? moveParts(d, ids, x, y) : d;
}

/**
 * Two marks combined.
 *
 * @param {string} a The first mark.
 * @param {string} b The second, on the same 512 canvas.
 * @param {import('./combine.js').CombineOptions} o The op and where the second goes.
 * @returns {import('./doc.js').Edited} The SVG and the checks.
 * @throws {RangeError} For an unknown op, or when nothing is left.
 */
export function combineMarks(a, b, { op, transform, name }) {
	const run = COMBINE[op];
	if (!run) throw new RangeError(`no op "${op}": one of ${COMBINE_OPS.join(', ')}`);
	const doc = toDoc(a);
	toDoc(b);
	const both = insertSvg(doc, b);
	const bIds = newParts(doc, both);
	return finish(run(place(both, bIds, transform), idsOf(doc), bIds), name);
}
