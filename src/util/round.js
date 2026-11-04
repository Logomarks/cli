/**
 * @module logomarks/util/round
 *
 * Numbers rounded for SVG attributes.
 */

/**
 * A number rounded to a few decimal places.
 *
 * @param {number} v The number.
 * @param {number} [places] Decimal places (2).
 * @returns {number} It, rounded.
 */
export const round = (v, places = 2) => Math.round(v * 10 ** places) / 10 ** places;
