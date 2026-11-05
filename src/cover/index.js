/**
 * @module logomarks/cover
 *
 * Covers (blog headers, Open Graph cards, posts) with the mark on them, from
 * `@arraypress/covers` recipes: a curated handful that suit a mark. The
 * cover is SVG with its text as outlines; resvg draws the PNG.
 */

import { renderSvg, resolvePalette } from '@arraypress/covers';
import { palette as makePalette, DEFAULT_COLOR } from '@arraypress/brand-kit';
import { render } from '../raster/render.js';

/** The mark laid over a recipe that has no icon of its own: centred, or top left when there's a title. */
const overlay = (/** @type {string} */ mark, /** @type {boolean} */ titled, /** @type {string} */ color) => ({
	type: 'icon',
	svg: mark,
	size: titled ? '14vmin' : '20vmin',
	anchor: titled ? 'top-left' : 'center',
	color,
});

/**
 * The curated recipes: each one's covers options from the mark and the brand.
 *
 * @type {Record<string, import('./index.js').CoverRecipe>}
 */
export const RECIPES = {
	mark: { about: 'The mark centred on the brand colour.', options: ({ mark }) => ({ recipe: 'mark', icon: mark }) },
	gradient: { about: 'The mark on a gradient from the brand colour.', options: ({ mark }) => ({ recipe: 'mark', icon: mark, background: 'gradient' }) },
	tile: { about: 'The mark on a raised tile over a soft tint, a glow and rings.', options: ({ mark }) => ({ recipe: 'iconTile', icon: mark }) },
	stripes: { about: 'A band of tapering stripes and the mark on a disc at its edge.', options: ({ mark }) => ({ recipe: 'stripes', icon: mark }) },
	aurora: { about: 'Soft sweeps of the brand’s hues, the mark over them.', options: (b) => ({ recipe: 'aurora', ...mesh(b) }) },
	grid: { about: 'The same sweeps under a dotted grid.', options: (b) => ({ recipe: 'gridTitle', ...mesh(b) }) },
	cutout: { about: 'A matte field, cut-paper shapes and the mark drawn by hand.', options: ({ mark }) => ({ recipe: 'cutout', icon: mark }) },
};

/**
 * The mesh recipes' palette (the brand's own tints, so the sweeps stay in its hue) and the mark laid over them.
 *
 * @param {import('./index.js').CoverBrand} b The brand.
 * @returns {object} The covers options.
 */
function mesh({ mark, color, titled }) {
	const p = makePalette(color);
	const palette = { accent: p.primary, colors: [p.primary, p.scale['300'], p.scale['700']] };
	return { palette, mesh: { hueSpan: 60 }, layers: [overlay(mark, titled, titled ? resolvePalette(palette).text : '#FFFFFF')] };
}

/**
 * A cover.
 *
 * @param {import('./index.js').CoverOptions} o The mark, the recipe, the words and the size.
 * @returns {Promise<import('./index.js').Cover>} The PNG and the SVG.
 * @throws {TypeError} For a recipe that isn't one of `RECIPES`.
 */
export async function cover({ mark, recipe = 'mark', title, label, color = DEFAULT_COLOR, aspect = 'og', width = 1200, seed }) {
	const r = RECIPES[recipe];
	if (!r) throw new TypeError(`no recipe "${recipe}": one of ${Object.keys(RECIPES).join(', ')}`);
	const options = { palette: color, ...r.options({ mark: mark.svg, color, titled: Boolean(title) }) };
	const svg = await renderSvg(/** @type {never} */ ({ seed: seed ?? mark.slug, aspect, width, ...(title && { title }), ...(label && { label }), ...options }));
	const out = await render(svg, { png: true });
	return { png: /** @type {Uint8Array} */ (out.png), svg, width: out.width, height: out.height };
}
