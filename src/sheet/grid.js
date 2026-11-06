/**
 * @module logomarks/sheet/grid
 *
 * A plain contact sheet: marks in a grid, light on dark, each labelled with
 * its name (what batchsheet.mjs and peek.mjs drew), for a quick look at a
 * whole batch before the full review cards.
 */

import { render } from '../raster/render.js';
import { text, panel, mark } from './draw.js';
import { COLORS } from './theme.js';

/** A cell's width and height, in pixels. */
const W = 190, H = 220;

/**
 * The marks in a labelled grid, `cols` across.
 *
 * @param {readonly { name: string, svg: string }[]} marks The marks.
 * @param {{ cols?: number }} [o] How many across (8).
 * @returns {Promise<Uint8Array>} The sheet as a PNG.
 */
export async function gridSheet(marks, { cols = 8 } = {}) {
	const across = Math.max(1, Math.min(cols, marks.length)), rows = Math.ceil(marks.length / across);
	const cells = marks.map((m, i) => {
		const x = (i % across) * W, y = Math.floor(i / across) * H;
		return panel(x + 6, y + 6, W - 12, H - 12, COLORS.card, { r: 12 }) + mark(m.svg, x + 30, y + 22, W - 60, COLORS.darkInk) + text(x + W / 2, y + H - 24, m.name, { size: 13, color: COLORS.text, anchor: 'middle' });
	});
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${across * W}" height="${rows * H}"><rect width="100%" height="100%" fill="${COLORS.page}"/>${cells.join('')}</svg>`;
	const { png } = await render(svg, { text: true, png: true });
	return /** @type {Uint8Array} */ (png);
}
