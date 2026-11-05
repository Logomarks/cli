/**
 * @module logomarks/util/color
 *
 * Reading a colour someone typed: `#rgb`, `#rrggbb` (the `#` optional), or
 * `black` and `white`. Everything else about colour is
 * `@arraypress/color-utils` and `@arraypress/brand-kit`'s palette.
 */

/**
 * A colour as `#RRGGBB`.
 *
 * @param {string} input The colour.
 * @returns {string | null} It, upper case; null when it isn't one.
 */
export function parseColor(input) {
	const s = input.trim().toLowerCase();
	if (s === 'black') return '#000000';
	if (s === 'white') return '#FFFFFF';
	const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
	if (!m) return null;
	const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
	return `#${h.toUpperCase()}`;
}
