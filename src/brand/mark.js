/**
 * @module logomarks/brand/mark
 *
 * The mark a brand is built on: a live mark by slug or name (from the
 * bundled index), or your own SVG, fitted to the standard. Painted in a
 * colour and drawn at a size.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadIndex } from '../similar/store.js';
import { fitMark } from '@logomarks/marks-kit/fit';
import { body } from '@logomarks/marks-kit/svg';
import { render } from '../raster/render.js';
import { CANVAS } from '../rules.js';
import { round } from '../util/round.js';

/** Where a live mark's page is. */
export const MARK_URL = 'https://logomarks.ai/marks/';

/** A mark that wasn't found, with the closest slugs. */
export class MarkNotFound extends Error {
	/**
	 * @param {string} ref What was asked for.
	 * @param {string[]} suggestions The closest slugs.
	 */
	constructor(ref, suggestions) {
		super(`no live mark "${ref}"${suggestions.length ? `: did you mean ${suggestions.join(', ')}?` : ''}`);
		this.suggestions = suggestions;
	}
}

/**
 * Text as a slug: lower case, words joined by hyphens.
 *
 * @param {string} s The text.
 * @returns {string} The slug.
 */
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * A slug as a name: `hex-gem` → `Hex Gem`.
 *
 * @param {string} slug The slug.
 * @returns {string} The name.
 */
export const titleCase = (slug) => slug.split('-').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

/**
 * A live mark by slug or name, any case.
 *
 * @param {string} ref The slug (`hex-gem`) or name (`Hex Gem`).
 * @param {import('../similar/store.js').MarkIndex} [index] The live set (the bundled index).
 * @returns {import('../similar/store.js').IndexedMark | undefined} The mark.
 */
export function findMark(ref, index = loadIndex()) {
	const slug = slugify(ref);
	return index.marks.find((m) => m.slug === ref) ?? index.marks.find((m) => m.slug === slug || slugify(m.name) === slug);
}

/**
 * The live slugs closest to a query: the most of its words (all of it, run together, counts
 * double), then the shortest.
 *
 * @param {string} ref The query.
 * @param {import('../similar/store.js').MarkIndex} [index] The live set.
 * @param {number} [n] How many.
 * @returns {string[]} The slugs.
 */
export function suggest(ref, index = loadIndex(), n = 3) {
	const words = slugify(ref).split('-').filter(Boolean);
	const joined = words.join('');
	return index.marks
		.map((m) => ({ slug: m.slug, score: words.filter((w) => m.slug.includes(w)).length + (m.slug.replace(/-/g, '').includes(joined) ? 2 : 0) }))
		.filter((m) => m.score > 0)
		.sort((a, b) => b.score - a.score || a.slug.length - b.slug.length || a.slug.localeCompare(b.slug))
		.slice(0, n)
		.map((m) => m.slug);
}

/**
 * A mark from a slug, a name or an SVG file. A file is fitted to the
 * standard (512 canvas, longest side 448, centred, `currentColor`).
 *
 * @param {string} ref A live slug or name, or a path to an SVG.
 * @param {import('../similar/store.js').MarkIndex} [index] The live set.
 * @returns {import('./mark.js').Mark} The mark.
 * @throws {MarkNotFound} When it is neither a file nor a live mark.
 */
export function loadMark(ref, index) {
	if (/\.svg$/i.test(ref) || fs.existsSync(ref)) {
		const slug = slugify(path.basename(ref).replace(/\.svg$/i, '')) || 'mark';
		return { slug, name: titleCase(slug), svg: fitMark(fs.readFileSync(ref, 'utf8')).svg, live: false };
	}
	const all = index ?? loadIndex();
	const m = findMark(ref, all);
	if (!m) throw new MarkNotFound(ref, suggest(ref, all));
	return { slug: m.slug, name: m.name, svg: m.svg, live: true };
}

/**
 * The mark's paths, any `currentColor` in them made a colour.
 *
 * @param {string} svg The mark.
 * @param {string} color The colour.
 * @returns {string} The paths.
 */
const paths = (svg, color) => body(svg).replace(/fill="currentColor"/g, `fill="${color}"`);

/**
 * The mark's drawing in a colour, in a group, without its `<svg>`: to place in another SVG.
 *
 * @param {string} svg The mark.
 * @param {string} color The fill (`currentColor` keeps it).
 * @returns {string} Its paths.
 */
export const markBody = (svg, color) => `<g fill="${color}">${paths(svg, color)}</g>`;

/**
 * The mark as a file in a colour (`currentColor` leaves it to the page).
 *
 * @param {string} svg The mark.
 * @param {string} [color] The fill.
 * @returns {string} The SVG, 512 canvas, the fill on the root.
 */
export const paint = (svg, color = 'currentColor') =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" fill="${color}">${paths(svg, color)}</svg>\n`;

/**
 * The mark on a square, transparent or on a ground: the SVG to draw.
 *
 * @param {string} svg The mark.
 * @param {import('./mark.js').TileOptions} o Size and colours.
 * @returns {string} The SVG.
 */
export function tile(svg, { size, color, ground, pad = 0, radius = 0 }) {
	const at = round(-pad * CANVAS), side = round(CANVAS * (1 + 2 * pad));
	const bg = ground ? `<rect x="${at}" y="${at}" width="${side}" height="${side}" rx="${round(radius * side)}" fill="${ground}"/>` : '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${at} ${at} ${side} ${side}">${bg}${markBody(svg, color)}</svg>\n`;
}

/**
 * The mark drawn to a square PNG, transparent or on a ground.
 *
 * @param {string} svg The mark.
 * @param {import('./mark.js').TileOptions} o Size and colours.
 * @returns {Promise<Uint8Array>} The PNG.
 */
export async function markPng(svg, o) {
	return /** @type {Uint8Array} */ ((await render(tile(svg, o), { png: true })).png);
}
