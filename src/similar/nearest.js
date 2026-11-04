/**
 * @module logomarks/similar/nearest
 *
 * The live marks nearest a candidate, by outline (dupcheck.mjs) or, for a
 * letter badge, by its knocked-out letter (holecheck.mjs).
 */

import { SIMILAR, LETTERS } from '../rules.js';
import { outlineSignature, letterSignatures, variants, iou } from './signature.js';
import { loadIndex } from './store.js';

/**
 * How close a score is.
 *
 * @param {number} score The score.
 * @param {{ tooClose: number, nearCopy: number }} t The thresholds.
 * @returns {import('./nearest.js').Verdict} The verdict.
 */
const verdict = (score, t) => (score >= t.nearCopy ? 'near-copy' : score >= t.tooClose ? 'too-close' : 'ok');

/**
 * The best score of a candidate's 8 variants against one stored signature.
 *
 * @param {Float32Array[]} vs The candidate's variants.
 * @param {Float32Array} sig The stored signature.
 * @returns {number} The score.
 */
const best = (vs, sig) => vs.reduce((m, v) => Math.max(m, iou(v, sig)), 0);

/**
 * The live marks nearest a candidate.
 *
 * @param {string} svg The candidate.
 * @param {import('./nearest.js').SimilarOptions} [o] How many, and what to compare.
 * @returns {Promise<import('./nearest.js').Match[]>} The nearest, closest first.
 */
export async function similar(svg, { top = 5, letters = false, index = loadIndex(), exclude } = {}) {
	/** @type {import('./nearest.js').Match[]} */
	let out;
	if (letters) {
		const { holes } = await letterSignatures(svg);
		if (!holes) return [];
		const vs = variants(holes);
		out = index.letters.map((l) => {
			const m = index.marks[l.mark], score = best(vs, l.sig);
			return { slug: m.slug, name: m.name, score, verdict: verdict(score, LETTERS), by: l.kind === 'hole' ? 'letter (hole)' : 'letter (ink)' };
		});
	} else {
		const vs = variants(await outlineSignature(svg));
		out = index.marks.map((m) => {
			const score = best(vs, m.outline);
			return { slug: m.slug, name: m.name, score, verdict: verdict(score, SIMILAR), by: 'outline' };
		});
	}
	return out
		.filter((m) => m.slug !== exclude)
		.sort((a, b) => b.score - a.score)
		.slice(0, top)
		.map((m) => ({ ...m, score: Math.round(m.score * 1000) / 1000 }));
}
