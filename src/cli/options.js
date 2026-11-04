/**
 * @module logomarks/cli/options
 *
 * The options the brand verbs share, read and checked: the mark, a colour,
 * a typeface, a whole number; and writing a file, folders made as needed.
 */

import { UsageError } from './args.js';
import { loadMark, MarkNotFound } from '../brand/mark.js';
import { parseColor } from '../brand/color.js';
import { fontId, FONTS } from '../brand/fonts.js';

export { writeFile } from '../util/files.js';

/**
 * The mark the positionals name: a live slug or name (words may be unquoted), or an SVG file.
 *
 * @param {readonly string[]} positionals The positionals.
 * @returns {import('../brand/mark.js').Mark} The mark.
 * @throws {UsageError} When none is named or it isn't found.
 */
export function markArg(positionals) {
	if (!positionals.length) throw new UsageError('name a live mark (slug or name) or an .svg file');
	try {
		return loadMark(positionals.join(' '));
	} catch (e) {
		if (e instanceof MarkNotFound) throw new UsageError(e.message);
		throw new UsageError(`can't read the mark: ${/** @type {Error} */ (e).message}`);
	}
}

/**
 * A colour option.
 *
 * @param {string | undefined} value The option's value.
 * @returns {string | undefined} `#RRGGBB`, or undefined when it wasn't given.
 * @throws {UsageError} When it isn't a colour.
 */
export function colorArg(value) {
	if (value === undefined) return undefined;
	const hex = parseColor(value);
	if (!hex) throw new UsageError(`--color takes a hex colour (#ff5c3a), not "${value}"`);
	return hex;
}

/**
 * A typeface option.
 *
 * @param {string | undefined} value The option's value.
 * @returns {import('../brand/fonts.js').FontId | undefined} The face's id, or undefined when it wasn't given.
 * @throws {UsageError} When it isn't bundled.
 */
export function fontArg(value) {
	if (value === undefined) return undefined;
	const id = fontId(value);
	if (!id) throw new UsageError(`--font is one of ${Object.keys(FONTS).join(', ')}`);
	return id;
}

/**
 * A whole-number option.
 *
 * @param {string} name The option (for the message).
 * @param {string | undefined} value Its value.
 * @param {number} min The smallest allowed.
 * @param {number} max The largest allowed.
 * @returns {number | undefined} The number, or undefined when it wasn't given.
 * @throws {UsageError} When it isn't a whole number in range.
 */
export function intArg(name, value, min, max) {
	if (value === undefined) return undefined;
	const n = Number(value);
	if (!Number.isInteger(n) || n < min || n > max) throw new UsageError(`--${name} takes a whole number from ${min} to ${max}`);
	return n;
}
