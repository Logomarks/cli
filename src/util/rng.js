/**
 * @module logomarks/util/rng
 *
 * A small random generator seeded by a string, so anything random (the
 * booleans' retry jitter) repeats on every run. The kit's `seeded()`.
 */

/**
 * A generator seeded by a string.
 *
 * @param {string} str The seed (a mark's slug).
 * @returns {() => number} Numbers in [0, 1), the same sequence for the same seed.
 */
export function seeded(str) {
	let a = [...str].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
