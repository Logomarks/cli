/**
 * @module logomarks/cli/options
 *
 * The options the brand verbs share, read and checked: the mark, a colour,
 * a typeface, a whole number, a list; the brand and the social pack's
 * choices; and writing a file, folders made as needed.
 */

import { UsageError } from './args.js';
import { loadMark, MarkNotFound } from '../brand/mark.js';
import { parseColor } from '../util/color.js';
import { fontId, FONTS } from '../brand/fonts.js';
import { STYLE_IDS } from '@logomarks/brand-kit';

export { writeFile, writeFiles } from '../util/files.js';

/**
 * The mark the positionals name: a live slug or name (words may be unquoted), or an SVG file.
 *
 * @param {readonly string[]} positionals The positionals.
 * @returns {import('../brand/mark.js').Mark} The mark.
 * @throws {UsageError} When none is named or it isn't found.
 */
export function markArg(positionals) {
	if (!positionals.length) throw new UsageError('name a live mark (slug or name) or an .svg file');
	return markOf(positionals.join(' '));
}

/**
 * One mark by slug, name or file.
 *
 * @param {string} ref The reference.
 * @returns {import('../brand/mark.js').Mark} The mark.
 * @throws {UsageError} When it isn't found or can't be read.
 */
export function markOf(ref) {
	try {
		return loadMark(ref);
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

/**
 * A number option.
 *
 * @param {string} name The option (for the message).
 * @param {string | undefined} value Its value.
 * @returns {number | undefined} The number, or undefined when it wasn't given.
 * @throws {UsageError} When it isn't a number.
 */
export function numArg(name, value) {
	if (value === undefined) return undefined;
	const n = Number(value);
	if (value.trim() === '' || !Number.isFinite(n)) throw new UsageError(`--${name} takes a number, not "${value}"`);
	return n;
}

/**
 * A comma-separated option as a list.
 *
 * @param {string | undefined} value The option's value.
 * @returns {string[] | undefined} The items, trimmed; undefined when it wasn't given.
 */
export const listArg = (value) => value?.split(',').map((v) => v.trim()).filter(Boolean);

/**
 * The brand the brand verbs build on: the mark, and `--name --color --font --tagline --url --handle`.
 *
 * @param {import('./args.js').Parsed} args The parsed arguments.
 * @returns {import('../brand/brand.js').BrandOptions & { mark: import('../brand/mark.js').Mark, name: string }} The brand.
 * @throws {UsageError} When the mark, colour or face is wrong.
 */
export function brandArgs(args) {
	const mark = markArg(args.positionals);
	const { tagline, url, handle } = args.options;
	return { mark, name: args.options.name?.trim() || mark.name, color: colorArg(args.options.color), font: fontArg(args.options.font), tagline, url, handle };
}

/**
 * What goes in a social pack: `--platforms`, `--styles`, `--animated`.
 *
 * @param {import('./args.js').Parsed} args The parsed arguments.
 * @returns {import('../kit/index.js').PackOptions} The choices.
 * @throws {UsageError} For a style that isn't one.
 */
export function packArgs(args) {
	const styles = listArg(args.options.styles);
	const bad = styles?.filter((s) => !(/** @type {readonly string[]} */ (STYLE_IDS)).includes(s));
	if (bad?.length) throw new UsageError(`--styles takes ${STYLE_IDS.join(', ')}, not ${bad.join(', ')}`);
	return { styles: /** @type {import('@logomarks/brand-kit').StyleId[] | undefined} */ (styles), platforms: listArg(args.options.platforms), animated: args.flags.has('animated') };
}

/**
 * Runs a brand-kit call, its RangeErrors (an unknown platform or style) as usage errors.
 *
 * @template T
 * @param {() => Promise<T>} build The call.
 * @returns {Promise<T>} Its result.
 * @throws {UsageError} For a RangeError.
 */
export async function asUsage(build) {
	try {
		return await build();
	} catch (e) {
		if (e instanceof RangeError || e instanceof TypeError) throw new UsageError(e.message.replace(/^brand-kit: /, ''));
		throw e;
	}
}
