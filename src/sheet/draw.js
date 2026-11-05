/**
 * @module logomarks/sheet/draw
 *
 * Small SVG builders the review card is made of: text, panels, a mark placed
 * in a box, a raster chip.
 */

import { body, viewBox } from '../svg/shapes.js';
import { COLORS, FONT } from './theme.js';

/**
 * Text made safe for XML.
 *
 * @param {string} s The text.
 * @returns {string} It, escaped.
 */
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * A line of text.
 *
 * @param {number} x Where it starts (or its middle, centred).
 * @param {number} y Its baseline.
 * @param {string} s The text.
 * @param {import('./draw.js').TextStyle} [o] How it looks.
 * @returns {string} The SVG.
 */
export const text = (x, y, s, { size = 13, color = COLORS.text, weight = 400, anchor = 'start', font } = {}) =>
	`<text x="${x}" y="${y}" font-family="${font ?? FONT}" font-weight="${weight}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;

/**
 * A rounded rectangle.
 *
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {string} fill Its colour.
 * @param {object} [o] Corners and outline.
 * @param {number} [o.r=10] Corner radius.
 * @param {string} [o.stroke] Outline colour.
 * @returns {string} The SVG.
 */
export const panel = (x, y, w, h, fill, { r = 10, stroke } = {}) =>
	`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.5"` : ''}/>`;

/**
 * A mark drawn in a square, its 512 canvas filling it.
 *
 * @param {string} svg The mark.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} size The square's side.
 * @param {string} color The ink.
 * @returns {string} The SVG.
 */
export const mark = (svg, x, y, size, color) =>
	`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 512 512" fill="${color}">${body(svg).replace(/fill="currentColor"/g, `fill="${color}"`)}</svg>`;

/**
 * A raster image placed at a size, scaled by nearest neighbour so its pixels show.
 *
 * @param {Uint8Array} png The image.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} size Its side on the sheet.
 * @returns {string} The SVG.
 */
export const pixels = (png, x, y, size) =>
	`<image x="${x}" y="${y}" width="${size}" height="${size}" image-rendering="optimizeSpeed" href="data:image/png;base64,${Buffer.from(png).toString('base64')}"/>`;

/**
 * An SVG placed in a box, scaled to fit and centred.
 *
 * @param {string} svg The SVG (with a `viewBox`).
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @returns {string} The SVG.
 */
export const nest = (svg, x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox(svg)?.join(' ')}">${body(svg)}</svg>`;

/**
 * A raster image placed in a box, smoothly scaled.
 *
 * @param {Uint8Array} png The image.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @returns {string} The SVG.
 */
export const image = (png, x, y, w, h) => `<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/png;base64,${Buffer.from(png).toString('base64')}"/>`;
