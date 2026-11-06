/**
 * @module logomarks/mockup
 *
 * The brand on a 2D object, with `@logomarks/mockups` (its layered SVG,
 * rasterised by resvg here). What goes on the object depends on it: a
 * garment, mug or bag carries the mark alone; anything printed edge to edge
 * (a card, a poster, a sleeve, a screen, a billboard) carries the brand in
 * one of `@logomarks/brand-kit`'s styles, drawn to its proportions. The hand layouts and the 3D scenes are
 * left out, and so is the bus shelter (one of its blurs stops resvg 2.6).
 */

import * as mockups from '@logomarks/mockups';
import { resolveBrand, artwork, markSvg, markTile } from '@logomarks/brand-kit';
import { contrastRatio, readableText, WCAG } from '@arraypress/color-utils';
import { brandInput } from '../brand/brand.js';
import { parseColor } from '../util/color.js';
import { nest } from '../sheet/draw.js';
import { render } from '../raster/render.js';

/** The output's side in pixels when none is given. */
export const DEFAULT_SIZE = 1600;

/**
 * A colour name the garments know (`navy`), or hex, as hex: for the objects that take hex only.
 *
 * @param {string} base The colour.
 * @returns {string} Its hex (the input when it's neither).
 */
const hexOf = (base) => /** @type {Record<string, string>} */ (mockups.GARMENT_COLORS)[base] ?? parseColor(base) ?? base;

/**
 * The colour a mark is printed in on an object: the brand's when it reads, else the brand's ink or paper.
 *
 * @param {import('@logomarks/brand-kit').Brand} b The brand.
 * @param {string | undefined} base The object's colour (a name from the mockups, or hex; white when unset).
 * @returns {string} The ink.
 */
function inkOn(b, base) {
	const ground = (base && parseColor(hexOf(base))) || '#FFFFFF';
	const p = b.palette;
	return contrastRatio(p.primary, ground) >= WCAG.LARGE ? p.primary : readableText(ground, p.paper, p.ink);
}

/**
 * The mark alone, printed in a colour.
 *
 * @param {import('@logomarks/brand-kit').Brand} b The brand.
 * @param {string} color The ink.
 * @returns {string} The SVG.
 */
const print = (b, color) => markSvg(b.mark, color);

/**
 * Branded artwork for a print, sized to it (`@logomarks/brand-kit`'s styles).
 *
 * @param {import('@logomarks/brand-kit').Brand} b The brand.
 * @param {number} width Pixels.
 * @param {number} height Pixels.
 * @param {Partial<import('@logomarks/brand-kit').ArtworkOptions>} [o] The style (bold) and the kind (by shape; `logo`: the mark alone).
 * @returns {Promise<string>} The SVG.
 */
const art = (b, width, height, o = {}) => artwork(b, { width, height, ...o });

/**
 * The lockup in the brand's colours for paper, with no clear space.
 *
 * @param {import('@logomarks/brand-kit').Brand} b The brand.
 * @returns {import('@logomarks/brand-kit').Lockup} The lockup.
 */
const paperLockup = (b) => {
	const g = b.grounds['on-light'];
	return b.lockup('horizontal', { markColor: g.mark, textColor: g.text, clear: 0 });
};

/**
 * An A4 letter: the lockup top left, a band of the brand colour at the foot.
 *
 * @param {import('@logomarks/brand-kit').Brand} b The brand.
 * @returns {string} The SVG, 1240 × 1754.
 */
function letter(b) {
	const l = paperLockup(b);
	const w = 1240, h = 1754, logoH = 64;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${b.palette.paper}"/>${nest(l.svg, 110, 110, (logoH * l.width) / l.height, logoH)}<rect y="${h - 18}" width="${w}" height="18" fill="${b.palette.primary}"/></svg>`;
}

/**
 * A landing page: a bar with the lockup, then the brand colour with the lockup large.
 *
 * @param {import('@logomarks/brand-kit').Brand} b The brand.
 * @returns {Promise<string>} The SVG, 1440 × 900.
 */
async function page(b) {
	const l = paperLockup(b);
	const hero = await art(b, 1440, 780);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900"><rect width="1440" height="900" fill="${b.palette.paper}"/>${nest(l.svg, 64, 40, (40 * l.width) / l.height, 40)}${nest(hero, 0, 120, 1440, 780)}</svg>`;
}

/**
 * The 2D objects: each one's mockup function, which option takes `base` (the object's own colour), and its art.
 *
 * @type {Record<string, import('./index.js').ObjectSpec>}
 */
export const OBJECTS = {
	card: { make: mockups.card, layouts: ['pair', 'flat', 'stack', 'fan'], options: async (b) => ({ art: await art(b, 1700, 1100, { kind: 'logo' }), back: await art(b, 1700, 1100, { style: 'minimal' }) }) },
	letterhead: { make: mockups.letterhead, layouts: ['set', 'flat', 'envelope'], options: async (b) => ({ art: letter(b), logo: print(b, b.palette.primary), card: await art(b, 1700, 1100, { kind: 'logo' }) }) },
	ticket: { make: mockups.ticket, layouts: ['pair'], options: async (b) => ({ art: await art(b, 1397, 508) }) },
	lanyard: { make: mockups.lanyard, options: async (b) => ({ art: await art(b, 1050, 1480), name: b.name }) },
	sticker: { make: mockups.sticker, layouts: ['laptop', 'bottle', 'sheet'], base: 'color', hex: true, options: async (b) => ({ art: print(b, b.palette.primary), shape: 'contour' }) },
	tote: { make: mockups.tote, base: 'color', options: async (b, base) => ({ art: print(b, inkOn(b, base)) }) },
	tee: { make: mockups.tee, base: 'color', options: async (b, base) => ({ art: print(b, inkOn(b, base)) }) },
	hoodie: { make: mockups.hoodie, base: 'color', options: async (b, base) => ({ art: print(b, inkOn(b, base)) }) },
	cap: { make: mockups.cap, base: 'color', options: async (b, base) => ({ art: print(b, inkOn(b, base)) }) },
	mug: { make: mockups.mug, layouts: ['single', 'pair'], base: 'color', hex: true, options: async (b, base) => ({ art: print(b, inkOn(b, base)) }) },
	bag: { make: mockups.bag, base: 'paper', options: async (b, base) => ({ art: print(b, inkOn(b, base === 'kraft' || !base ? '#C8A27A' : base)) }) },
	box: { make: mockups.box, base: 'board', options: async (b) => ({ art: await art(b, 1600, 1600, { style: 'minimal' }) }) },
	poster: { make: mockups.poster, options: async (b) => ({ art: await art(b, 1414, 2000) }) },
	vinyl: { make: mockups.vinyl, options: async (b) => ({ art: await art(b, 1600, 1600) }) },
	cd: { make: mockups.cd, options: async (b) => ({ art: await art(b, 1600, 1600) }) },
	cassette: { make: mockups.cassette, options: async (b) => ({ art: await art(b, 1600, 1600, { kind: 'logo' }), title: b.name }) },
	phone: { make: mockups.phone, base: 'finish', options: async (b) => ({ art: print(b, b.palette.onPrimary), screen: 'home', name: b.name, iconBackground: b.palette.primary, wallpaper: b.palette.scale['900'] }) },
	laptop: { make: mockups.laptop, base: 'finish', options: async (b) => ({ art: await page(b), domain: `${b.slug}.com`, title: b.name, icon: markTile(b.mark, { size: 128, color: b.palette.onPrimary, ground: b.palette.primary, pad: 0.08, radius: 0.22 }) }) },
	billboard: { make: mockups.billboard, options: async (b) => ({ art: await art(b, 1500, 500) }) },
	shopfront: { make: mockups.shopfront, options: async (b) => ({ art: b.mark.svg, name: b.name, color: b.palette.primary, ink: b.palette.onPrimary }) },
};

/**
 * A mockup.
 *
 * @param {import('./index.js').MockupOptions} o The mark, the brand, the object and how to show it.
 * @returns {Promise<import('./index.js').Mockup>} The PNG and the SVG it was drawn from.
 * @throws {TypeError} For an object or option the mockups don't take.
 */
export async function mockup({ mark, name, color, font, object, layout, surface, view, base, size = DEFAULT_SIZE, seed }) {
	const spec = OBJECTS[object];
	if (!spec) throw new TypeError(`no object "${object}": one of ${Object.keys(OBJECTS).join(', ')}`);
	if (layout && !spec.layouts?.includes(layout)) throw new TypeError(spec.layouts ? `${object} layouts: ${spec.layouts.join(', ')}` : `${object} has one layout`);
	if (base && !spec.base) throw new TypeError(`${object} has no base colour`);
	const brand = await resolveBrand(brandInput({ mark, name, color, font }));
	const options = {
		...(await spec.options(brand, base)),
		size,
		...((layout ?? spec.layouts?.[0]) && { layout: layout ?? spec.layouts?.[0] }),
		...(surface && { surface }),
		...(view && { view }),
		...(seed && { seed }),
		...(base && spec.base && { [spec.base]: spec.hex ? hexOf(base) : base }),
	};
	const m = spec.make(/** @type {never} */ (options));
	const png = /** @type {Uint8Array} */ ((await render(m.svg, { png: true, width: size })).png);
	return { png, svg: m.svg, width: m.width, height: m.height };
}
