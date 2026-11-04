/**
 * @module logomarks/geometry/polygon
 *
 * Small measures of a polygon ring: signed area, perimeter, box, winding.
 */

/**
 * A ring's signed area: its sign says which way the ring runs.
 *
 * @param {import('./polygon.js').Ring} r The ring.
 * @returns {number} Its signed area.
 */
export function signedArea(r) {
	let a = 0;
	for (let i = 0; i < r.length; i++) {
		const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length];
		a += x1 * y2 - x2 * y1;
	}
	return a / 2;
}

/**
 * A ring's area.
 *
 * @param {import('./polygon.js').Ring} r The ring.
 * @returns {number} Its area.
 */
export const area = (r) => Math.abs(signedArea(r));

/**
 * A ring's perimeter.
 *
 * @param {import('./polygon.js').Ring} r The ring.
 * @returns {number} Its length.
 */
export const perimeter = (r) => r.reduce((s, p, i) => {
	const q = r[(i + 1) % r.length];
	return s + Math.hypot(q[0] - p[0], q[1] - p[1]);
}, 0);

/**
 * A ring's box.
 *
 * @param {import('./polygon.js').Ring} r The ring.
 * @returns {import('./polygon.js').Box} `[x0, y0, x1, y1]`.
 */
export function box(r) {
	let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	for (const [x, y] of r) {
		if (x < x0) x0 = x;
		if (x > x1) x1 = x;
		if (y < y0) y0 = y;
		if (y > y1) y1 = y;
	}
	return [x0, y0, x1, y1];
}

/**
 * The winding number of a ring round a point.
 *
 * @param {import('./polygon.js').Ring} r The ring.
 * @param {import('./polygon.js').Point} p The point.
 * @returns {number} How many times it winds round it, signed.
 */
export function winding(r, [px, py]) {
	let w = 0;
	for (let i = 0; i < r.length; i++) {
		const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length];
		const side = (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1);
		if (y1 <= py) { if (y2 > py && side > 0) w++; }
		else if (y2 <= py && side < 0) w--;
	}
	return w;
}

/**
 * A ring without repeated consecutive points.
 *
 * @param {import('./polygon.js').Ring} pts The ring.
 * @returns {import('./polygon.js').Ring} The ring, deduplicated.
 */
export const dedupe = (pts) => pts.filter((p, i) => {
	const q = pts[(i + 1) % pts.length];
	return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6;
});
