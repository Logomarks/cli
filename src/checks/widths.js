/**
 * @module logomarks/checks/widths
 *
 * Gaps and strokes, measured on a 2 px-a-unit raster as runs of even width
 * (`raster/channels.js`): anything under 10 units closes up or fades at
 * 32 px, and a mark keeps one gap width (22), or a clear 1:2 ratio. These are
 * judgements the live set sometimes makes on purpose (cube letters' 10 gaps,
 * cute animals' 16 features), so they are warnings.
 */

import { GAPS, MIN_FEATURE, WIDTH_SCALE, WIDTH_PRECISION, CHIPS } from '../rules.js';
import { rings } from '../svg/rings.js';
import { frameOf, fill } from '../raster/scanline.js';
import { channels } from '../raster/channels.js';
import { finding } from './finding.js';

/** Pixels a unit at the smallest chip that must still read (32 px). */
const AT_32 = CHIPS[0] / 512;

/**
 * Runs grouped by width: runs within `GAPS.same` of each other are one group.
 *
 * @param {readonly import('../raster/channels.js').Channel[]} runs The runs, narrowest first.
 * @returns {import('./widths.js').RunGroup[]} The groups, each with its mean width, total length and box.
 */
function groups(runs) {
	/** @type {import('./widths.js').RunGroup[]} */
	const out = [];
	for (const c of runs) {
		const g = out.find((x) => Math.abs(x.width - c.width) <= GAPS.same);
		if (!g) { out.push({ width: c.width, length: c.length, count: 1, box: [...c.box] }); continue; }
		g.width = (g.width * g.length + c.width * c.length) / (g.length + c.length);
		g.length += c.length;
		g.count++;
		g.box = [Math.min(g.box[0], c.box[0]), Math.min(g.box[1], c.box[1]), Math.max(g.box[2], c.box[2]), Math.max(g.box[3], c.box[3])];
	}
	return out;
}

/**
 * How a group reads in a message: "3 gaps 9.8 wide".
 *
 * @param {import('./widths.js').RunGroup} g The group.
 * @param {string} noun What it is.
 * @returns {string} The words.
 */
const describe = (g, noun) => `${g.count > 1 ? `${g.count} ${noun}s` : `A ${noun}`} ${g.width.toFixed(1)} wide`;

/**
 * Width findings for one mark: thin strokes, narrow gaps, uneven gaps.
 *
 * @param {readonly import('../svg/shapes.js').Shape[]} paths The mark's shapes.
 * @returns {import('./finding.js').Finding[]} What was found.
 */
export function widthFindings(paths) {
	const fp = paths.map((s) => ({ rings: rings(s.segs, 0.5), evenodd: s.evenodd }));
	const bm = fill(fp, frameOf(fp, WIDTH_SCALE, 4));
	const gaps = groups(channels(bm, 0, GAPS)), strokes = groups(channels(bm, 1, GAPS));
	const out = [];
	const under = (/** @type {import('./widths.js').RunGroup} */ g) => g.width < MIN_FEATURE - WIDTH_PRECISION;
	for (const g of strokes.filter(under)) {
		out.push(finding('thin', `${describe(g, 'stroke')}: under ${MIN_FEATURE}, it fades at 32 px (${(g.width * AT_32).toFixed(2)} px).`, { box: g.box, value: g.width }));
	}
	for (const g of gaps.filter(under)) {
		out.push(finding('narrow-gap', `${describe(g, 'gap')}: under ${MIN_FEATURE}, it closes up at 32 px (${(g.width * AT_32).toFixed(2)} px).`, { box: g.box, value: g.width }));
	}
	const main = gaps.slice().sort((a, b) => b.length - a.length)[0];
	for (const g of gaps.filter((s) => s !== main)) {
		out.push(finding('uneven-gaps', `${describe(g, 'gap')}, against the mark's main gap of ${main.width.toFixed(1)}: keep one gap width (${GAPS.house}), or a clear 1:2 ratio.`, { box: g.box, value: g.width }));
	}
	return out;
}
