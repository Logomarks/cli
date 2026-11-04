/**
 * @module logomarks/brand/type
 *
 * A line of text set in a bundled face as outlines, so the SVG it goes into
 * needs no fonts. resvg shapes it (kerning included) and writes its own tree
 * back out; the glyph paths are taken from that.
 */

import { outline } from '../raster/render.js';
import { esc } from '../sheet/draw.js';
import { FONTS } from './fonts.js';

/** The size a line is set at; scale the result. */
export const SIZE = 100;

/** Where the line sits in the probe: room for any ascender, descender and side bearing. */
const AT = { x: SIZE, y: SIZE * 2.5 };

/** @type {Map<string, number>} */
const caps = new Map();

/**
 * A line set in the probe canvas, as paths and a box.
 *
 * @param {string} text The line.
 * @param {import('./fonts.js').Font} font The face.
 * @returns {Promise<{ paths: string, box: { x: number, y: number, w: number, h: number } | null }>} Glyph paths (no fill) and the ink box, probe coordinates.
 */
async function probe(text, font) {
	const width = AT.x * 2 + SIZE * 1.5 * text.length;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${SIZE * 4}"><text x="${AT.x}" y="${AT.y}" font-family="${font.family}" font-size="${SIZE}" letter-spacing="${font.tracking * SIZE}" xml:space="preserve">${esc(text)}</text></svg>`;
	const out = await outline(svg);
	const paths = [...out.svg.matchAll(/<path\b[^>]*\sd="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('');
	return { paths, box: out.box };
}

/**
 * A line of text as outlines, at {@link SIZE}, its baseline on y = 0 and its pen starting at x = 0.
 *
 * @param {string} text The line.
 * @param {import('./fonts.js').FontId} id The face.
 * @returns {Promise<import('./type.js').Set>} The paths, the ink box and the face's cap height.
 */
export async function typeset(text, id) {
	const font = FONTS[id];
	const [line, cap] = await Promise.all([probe(text, font), caps.has(id) ? null : probe('H', font)]);
	if (cap?.box) caps.set(id, cap.box.h);
	const b = line.box ?? { x: AT.x, y: AT.y, w: 0, h: 0 };
	return {
		paths: `<g transform="translate(${-AT.x} ${-AT.y})">${line.paths}</g>`,
		box: { x: b.x - AT.x, y: b.y - AT.y, w: b.w, h: b.h },
		cap: caps.get(id) ?? SIZE * 0.7,
	};
}
