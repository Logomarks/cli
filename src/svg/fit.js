/**
 * @module logomarks/svg/fit
 *
 * Fits a mark to the standard: 512 canvas, longest side exactly 448,
 * centred, filled paths in `currentColor`, coordinates on the 0.1 grid. The
 * only fix the CLI makes on its own: it is deterministic and keeps the
 * drawing. From `fit.mjs`.
 */

import { CANVAS, FIT } from '../rules.js';
import { shapes } from './shapes.js';
import { bounds } from './outline.js';

/**
 * A number to one decimal, as short as it can be written.
 *
 * @param {number} v The number.
 * @returns {string} It, written.
 */
const r1 = (v) => {
	const s = (Math.round(v * 10) / 10).toFixed(1);
	return s === '-0.0' ? '0' : s.endsWith('.0') ? s.slice(0, -2) : s;
};

/**
 * A number snapped to the 0.1 grid.
 *
 * @param {number} v The number.
 * @returns {number} It, snapped.
 */
const snap = (v) => Math.round(v * 10) / 10;

/**
 * Segments as compact relative path data. Points are snapped to the 0.1 grid
 * first and the relative steps taken between snapped points, so rounding never
 * drifts. Arc radii are rounded down: a semicircle stays exact (a radius a
 * hair too big would bulge the arc).
 *
 * @param {readonly import('./path.js').Segment[]} segs The segments.
 * @param {(x: number, y: number) => number[]} f Where each point goes.
 * @param {number} k The scale `f` applies (for arc radii).
 * @returns {string} The path data.
 */
function serialise(segs, f, k) {
	let d = '';
	let last = '';
	let cx = 0, cy = 0, sx = 0, sy = 0;
	// a command letter is only written when it changes, as optimised SVGs do
	const cmd = (/** @type {string} */ c, /** @type {string} */ nums) => {
		const out = c === last && c !== 'm' && c !== 'z' ? (nums.startsWith('-') ? '' : ' ') + nums : c + nums;
		last = c;
		return out;
	};
	const rel = (/** @type {number} */ x, /** @type {number} */ y) => `${r1(x - cx)} ${r1(y - cy)}`;
	for (const s of segs) {
		if (s[0] === 'Z') {
			d += 'z';
			last = 'z';
			cx = sx; cy = sy;
		} else if (s[0] === 'M') {
			const [x, y] = f(s[1], s[2]).map(snap);
			d += d ? cmd('m', rel(x, y)) : cmd('M', `${r1(x)} ${r1(y)}`);
			cx = sx = x; cy = sy = y;
		} else if (s[0] === 'A') {
			const [x, y] = f(s[6], s[7]).map(snap);
			const r = (/** @type {number} */ v) => r1(Math.floor(v * k * 10) / 10);
			d += cmd('a', `${r(s[1])} ${r(s[2])} ${r1(s[3])} ${s[4] ? 1 : 0} ${s[5] ? 1 : 0} ${rel(x, y)}`);
			cx = x; cy = y;
		} else {
			const pts = [];
			for (let i = 1; i < s.length; i += 2) pts.push(f(/** @type {number} */ (s[i]), /** @type {number} */ (s[i + 1])).map(snap));
			d += cmd(s[0].toLowerCase(), pts.map(([x, y]) => rel(x, y)).join(' '));
			[cx, cy] = pts[pts.length - 1];
		}
	}
	return d;
}

/**
 * A mark fitted to the standard.
 *
 * @param {string} svg The file's text.
 * @returns {import('./fit.js').Fitted} The fitted file and the box it had.
 * @throws {Error} When the file has no filled shapes.
 */
export function fitMark(svg) {
	const all = shapes(svg);
	if (!all.length) throw new Error('no filled shapes found');
	const before = bounds(all);
	const k = FIT / Math.max(before.w, before.h);
	const tx = CANVAS / 2 - (before.x + before.w / 2) * k, ty = CANVAS / 2 - (before.y + before.h / 2) * k;
	const f = (/** @type {number} */ x, /** @type {number} */ y) => [x * k + tx, y * k + ty];
	const paths = all.map((s) => `<path${s.evenodd ? ' fill-rule="evenodd"' : ''} d="${serialise(s.segs, f, k)}"/>`).join('');
	return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" fill="currentColor">${paths}</svg>\n`, before };
}
