/**
 * @module logomarks/geometry/shape
 *
 * A mark's filled area as polygons, every path unioned with its own fill
 * rule: the kit's `svgShape()`. The booleans retry with a tiny seeded jitter
 * when polygon-clipping trips on near-coincident edges (the kit's
 * `robust()`), without patching the library or `Math.random`.
 */

import pc from 'polygon-clipping';
import { rings } from '../svg/rings.js';
import { signedArea, winding } from './polygon.js';
import { seeded } from '../util/rng.js';

/** Retries before giving up; the jitter doubles each time, from 0.001 to ~0.1 units. */
const RETRIES = 7;

/**
 * Booleans that retry with a growing jitter instead of throwing.
 *
 * @param {string} seed Seeds the jitter, so a run repeats.
 * @returns {import('./shape.js').Booleans} Union, difference and xor.
 */
export function booleans(seed) {
	const rand = seeded(seed);
	/** @type {(g: any, e: number) => any} */
	const jitter = (g, e) => (typeof g[0] === 'number' ? [g[0] + (rand() - 0.5) * e, g[1] + (rand() - 0.5) * e] : g.map((/** @type {any} */ x) => jitter(x, e)));
	/** @type {(op: (...g: any[]) => any) => (...g: any[]) => import('./polygon.js').Polygon[]} */
	const robust = (op) => (...g) => {
		for (let t = 0; ; t++) {
			try {
				return op(...(t ? g.map((x) => jitter(x, 0.001 * 2 ** t)) : g));
			} catch (e) {
				if (t >= RETRIES) throw e;
			}
		}
	};
	const union = robust(pc.union), difference = robust(pc.difference), xor = robust(pc.xor);
	return {
		union: (...g) => (g.length ? union(...g) : []),
		difference: (a, ...b) => (b.length ? difference(a, ...b) : /** @type {import('./polygon.js').Polygon[]} */ (a)),
		xor: (...g) => (g.length ? xor(...g) : []),
	};
}

/**
 * One path's filled area. Even-odd paths xor every ring; nonzero paths test
 * the winding just either side of each ring's longest edge, so reversed
 * holes, islands and same-way overlaps all come out right.
 *
 * @param {import('./polygon.js').Ring[]} rs The path's rings.
 * @param {boolean} evenodd Its fill rule.
 * @param {import('./shape.js').Booleans} b The booleans.
 * @returns {import('./polygon.js').Polygon[]} Its area.
 */
function fillOf(rs, evenodd, b) {
	if (evenodd) return b.xor(...rs.map((r) => [r]));
	const sorted = rs.slice().sort((p, q) => Math.abs(signedArea(q)) - Math.abs(signedArea(p)));
	const total = (/** @type {import('./polygon.js').Point} */ pt) => rs.reduce((s, r) => s + winding(r, pt), 0);
	/** @type {import('./polygon.js').Polygon[]} */
	let g = [];
	for (const r of sorted) {
		let k = 0, longest = 0;
		r.forEach((p, i) => {
			const q = r[(i + 1) % r.length], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
			if (L > longest) { k = i; longest = L; }
		});
		const p = r[k], q = r[(k + 1) % r.length], e = 0.05;
		const nx = ((q[1] - p[1]) / longest) * e, ny = ((q[0] - p[0]) / longest) * e;
		const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
		/** @type {import('./polygon.js').Point} */
		const a = [m[0] - nx, m[1] + ny];
		/** @type {import('./polygon.js').Point} */
		const c = [m[0] + nx, m[1] - ny];
		const [inside, outside] = winding(r, a) ? [a, c] : [c, a];
		const fi = total(inside) !== 0, fo = total(outside) !== 0;
		if (fi && !fo) g = b.union(g, [r]);
		else if (!fi && fo) g = b.difference(g, [r]);
	}
	return g;
}

/**
 * A mark's filled area: every path's rings, filled by its rule, unioned.
 *
 * @param {readonly import('../svg/shapes.js').Shape[]} paths The mark's shapes.
 * @param {string} [seed=''] Seeds the retry jitter.
 * @returns {import('./polygon.js').Polygon[]} Its pieces, each an outer ring and its holes.
 * @throws {Error} When polygon-clipping can't read it even with jitter.
 */
export function filledShape(paths, seed = '') {
	const b = booleans(seed);
	return b.union(...paths.map((s) => fillOf(rings(s.segs).filter((r) => Math.abs(signedArea(r)) > 0.5), s.evenodd, b)));
}
