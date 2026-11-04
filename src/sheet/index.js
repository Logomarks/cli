/**
 * @module logomarks/sheet
 *
 * `sheet`: review cards for a set of marks, one under another, rendered to a
 * PNG for an AI (or a person) to look at.
 */

import { check } from '../checks/index.js';
import { similar } from '../similar/nearest.js';
import { loadIndex } from '../similar/store.js';
import { render } from '../raster/render.js';
import { COLORS, CARD } from './theme.js';
import { card } from './card.js';
import { text } from './draw.js';

/** The page's margin and the space between cards. */
const MARGIN = 16;

/** The title strip's height. */
const TITLE = 44;

/**
 * A review sheet.
 *
 * @param {readonly import('./index.js').SheetMark[]} marks The marks, each with its name.
 * @param {import('./index.js').SheetOptions} [o] Checks and neighbours.
 * @returns {Promise<import('./index.js').Sheet>} The sheet as PNG and SVG, and each mark's report and neighbours.
 */
export async function sheet(marks, { index = loadIndex(), strict = false, ignore = [] } = {}) {
	/** @type {import('./index.js').Sheet['marks']} */
	const results = [];
	let y = MARGIN + TITLE, cards = '';
	for (const { name, svg } of marks) {
		const report = check(svg, { name, strict, ignore });
		const matches = report.size ? await similar(svg, { top: 3, index, exclude: name }) : [];
		const c = await card({ name, svg, report, matches, index }, y);
		cards += `<g transform="translate(${MARGIN} 0)">${c.svg}</g>`;
		y += c.height + MARGIN;
		results.push({ name, report, matches });
	}
	const width = CARD.width + 2 * MARGIN;
	const failed = results.filter((r) => !r.report.ok).length;
	const title = text(MARGIN + 4, MARGIN + 24, `Logomarks review · ${marks.length} mark${marks.length === 1 ? '' : 's'} · ${failed ? `${failed} failing` : 'all passing'} · live set of ${index.marks.length} (${index.built})`, { size: 14, color: COLORS.muted });
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y}" viewBox="0 0 ${width} ${y}"><rect width="${width}" height="${y}" fill="${COLORS.page}"/>${title}${cards}</svg>`;
	const png = /** @type {Uint8Array} */ ((await render(svg, { text: true, png: true })).png);
	return { png, svg, marks: results };
}
