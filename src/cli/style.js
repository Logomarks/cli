/**
 * @module logomarks/cli/style
 *
 * Colour for the readable output, only on a terminal and never with
 * `NO_COLOR` set.
 */

const on = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

/**
 * A function that wraps text in an ANSI colour (or leaves it as it is).
 *
 * @param {number} code The colour's code.
 * @returns {(s: string) => string} The wrapper.
 */
const paint = (code) => (s) => (on ? `\x1b[${code}m${s}\x1b[0m` : s);

/** The output's colours. */
export const style = {
	red: paint(31),
	yellow: paint(33),
	green: paint(32),
	dim: paint(2),
	bold: paint(1),
};

/**
 * Text padded to a width, ignoring colour codes.
 *
 * @param {string} s The text.
 * @param {number} n The width.
 * @returns {string} The padded text.
 */
export const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.replace(/\x1b\[\d+m/g, '').length));
