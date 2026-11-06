/**
 * @module logomarks/edit/preview
 *
 * Edited marks to look at: the result on white, its two tones drawn as
 * their colours; and its parts numbered, so an agent can name them in an
 * edit.
 */

import { render } from '../raster/render.js';
import { mark, text, panel } from '../sheet/draw.js';

/** The preview's side in pixels. */
export const PREVIEW_SIZE = 512;

/**
 * A colour variable drawn as its fallback (`var(--tone-2, #FF5C3A)` → `#FF5C3A`), which resvg can't resolve.
 *
 * @param {string} svg The mark.
 * @returns {string} It, with plain fills.
 */
const plainFills = (svg) => svg.replace(/var\(--[\w-]+,\s*(#[0-9a-fA-F]{3,8})\s*\)/g, '$1');

/**
 * A PNG of an SVG drawn at the preview's size.
 *
 * @param {string} body The markup, on the 512 canvas.
 * @returns {Promise<Uint8Array>} The PNG.
 */
const png = async (body) =>
	/** @type {Uint8Array} */ ((await render(`<svg xmlns="http://www.w3.org/2000/svg" width="${PREVIEW_SIZE}" height="${PREVIEW_SIZE}" viewBox="0 0 512 512"><rect width="512" height="512" fill="#FFFFFF"/>${body}</svg>`, { text: true, png: true })).png);

/**
 * The mark on white, in its own colours (`currentColor` as near-black).
 *
 * @param {string} svg The mark.
 * @returns {Promise<Uint8Array>} The PNG.
 */
export const markPreview = (svg) => png(mark(plainFills(svg), 0, 0, 512, '#111111'));

/**
 * The mark in grey with each part's box and index, as `listParts` numbers them.
 *
 * @param {string} svg The mark.
 * @param {readonly import('./doc.js').PartInfo[]} parts Its parts.
 * @returns {Promise<Uint8Array>} The PNG.
 */
export function partsPreview(svg, parts) {
	const labels = parts.map(({ index, box: [x0, y0, x1, y1], centre: [cx, cy] }) =>
		`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="#FF5C3A" stroke-width="1.5" stroke-dasharray="4 3"/>${panel(cx - 15, cy - 13, 30, 26, '#111111', { r: 6 })}${text(cx, cy + 6, String(index), { size: 16, weight: 600, color: '#FFFFFF', anchor: 'middle' })}`);
	return png(mark(svg, 0, 0, 512, '#C9C9C9') + labels.join(''));
}
