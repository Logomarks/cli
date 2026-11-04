/**
 * @module logomarks/kit
 *
 * A free brand starter kit from a mark, a name, a colour and a typeface: the
 * mark as SVG and PNG, favicons, lockups, a palette, social images,
 * `brand.json` and a one-page brand sheet. Returned as files in memory; the
 * CLI writes them to a folder.
 */

import { palette as makePalette, DEFAULT_COLOR } from '../brand/color.js';
import { FONTS, DEFAULT_FONT } from '../brand/fonts.js';
import { paint, tile, markPng, slugify, MARK_URL } from '../brand/mark.js';
import { lockup } from '../brand/lockup.js';
import { artwork } from '../brand/artwork.js';
import { ico } from '../brand/ico.js';
import { render } from '../raster/render.js';
import { brandSheet } from './sheet.js';

/** The mark's PNG sizes. */
export const PNG_SIZES = [16, 32, 48, 180, 192, 512, 1024];

/** The social images: avatar, X header, Open Graph. */
export const SOCIAL = {
	avatar: { width: 400, height: 400 },
	'x-header': { width: 1500, height: 500 },
	og: { width: 1200, height: 630 },
};

/** The favicon's tile: the mark's margin and the corner radius, as shares of the tile (the .ico and favicon.svg). */
const FAVICON = { pad: 0.08, radius: 0.22 };

/** App icons are full-bleed squares the OS rounds and masks: the mark sits in its safe zone. */
const APP_ICON = { apple: 0.18, maskable: 0.28 };

/** How wide a lockup PNG is drawn. */
const LOCKUP_PNG = 2000;

/**
 * The PNG of an SVG.
 *
 * @param {string} svg The SVG.
 * @param {number} [width] Its width in pixels (its own otherwise).
 * @returns {Promise<Uint8Array>} The PNG.
 */
const png = async (svg, width) => /** @type {Uint8Array} */ ((await render(svg, { png: true, width })).png);

/**
 * A brand kit.
 *
 * @param {import('./index.js').KitOptions} o The mark, name, colour and typeface.
 * @returns {Promise<import('./index.js').Kit>} Every file, `brand.json`'s contents and the sheet.
 */
export async function kit({ mark, name, color = DEFAULT_COLOR, font = DEFAULT_FONT }) {
	const pal = makePalette(color);
	const svg = mark.svg;
	/** @type {import('./index.js').KitFile[]} */
	const files = [];
	const add = (/** @type {string} */ path, /** @type {string | Uint8Array} */ data) => files.push({ path, data });

	// the mark
	add('mark/mark.svg', paint(svg));
	add('mark/mark-color.svg', paint(svg, pal.primary));
	add('mark/mark-on-light.svg', paint(svg, pal.mark.onLight));
	add('mark/mark-on-dark.svg', paint(svg, pal.mark.onDark));
	for (const size of PNG_SIZES) add(`mark/png/mark-${size}.png`, await markPng(svg, { size, color: pal.primary }));
	add('mark/png/mark-on-light-1024.png', await markPng(svg, { size: 1024, color: pal.mark.onLight, ground: pal.paper, pad: 0.25 }));
	add('mark/png/mark-on-dark-1024.png', await markPng(svg, { size: 1024, color: pal.mark.onDark, ground: pal.ink, pad: 0.25 }));

	// favicons
	const icon = { color: pal.onPrimary, ground: pal.primary };
	add('favicon/favicon.ico', ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await markPng(svg, { size, ...icon, ...FAVICON }) })))));
	add('favicon/favicon.svg', tile(svg, { size: 32, ...icon, ...FAVICON }).replace(/ width="32" height="32"/, ''));
	add('favicon/apple-touch-icon.png', await markPng(svg, { size: 180, ...icon, pad: APP_ICON.apple }));
	for (const size of [192, 512]) add(`favicon/icon-${size}.png`, await markPng(svg, { size, ...icon, pad: APP_ICON.maskable }));
	add('favicon/site.webmanifest', `${JSON.stringify(manifest(name, pal.primary), null, 2)}\n`);

	// lockups
	const ways = {
		'on-light': { markColor: pal.mark.onLight, textColor: pal.text.onLight },
		'on-dark': { markColor: pal.mark.onDark, textColor: pal.text.onDark },
		'on-color': { markColor: pal.onPrimary, ground: pal.primary },
	};
	for (const layout of /** @type {const} */ (['horizontal', 'stacked']))
		for (const [way, colors] of Object.entries(ways)) {
			const l = await lockup({ mark: svg, name, font, layout, ...colors });
			add(`lockup/${layout}-${way}.svg`, l.svg);
			add(`lockup/${layout}-${way}.png`, await png(l.svg, LOCKUP_PNG));
		}

	// social
	const brand = { mark: svg, name, font, palette: pal };
	/** @type {Record<string, Uint8Array>} */
	const social = {
		avatar: await markPng(svg, { size: SOCIAL.avatar.width, ...icon, pad: 0.3 }),
		'x-header': await png(await artwork({ ...brand, ...SOCIAL['x-header'], fill: 0.5, motif: true })),
		og: await png(await artwork({ ...brand, ...SOCIAL.og, motif: true })),
	};
	for (const [k, bytes] of Object.entries(social)) {
		const { width, height } = SOCIAL[/** @type {keyof typeof SOCIAL} */ (k)];
		add(`social/${k}-${width}x${height}.png`, bytes);
	}

	// colours
	add('colors/palette.css', css(pal));

	const face = FONTS[font];
	/** @type {import('./index.js').BrandJson} */
	const json = {
		name,
		slug: slugify(name) || 'brand',
		mark: { slug: mark.slug, name: mark.name, ...(mark.live && { url: MARK_URL + mark.slug, licence: 'CC0-1.0' }) },
		colors: pal,
		font: { id: font, name: face.name, weight: face.weight, licence: 'OFL-1.1', url: `https://fonts.google.com/specimen/${face.google.replace(/ /g, '+')}` },
		usage: { clearSpace: 'a quarter of the mark’s height on every side', minimum: { screen: '16 px', print: '8 mm' } },
		head: HEAD,
		files: [...files.map((f) => f.path), 'brand.json', 'brand-sheet.png'],
	};
	const sheet = await brandSheet({ mark, name, font, palette: pal, social });
	add('brand-sheet.png', sheet);
	add('brand.json', `${JSON.stringify(json, null, 2)}\n`);
	return { brand: json, files, sheet };
}

/** The HTML that wires the favicons up. */
const HEAD = [
	'<link rel="icon" href="/favicon.ico" sizes="32x32">',
	'<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
	'<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
	'<link rel="manifest" href="/site.webmanifest">',
].join('\n');

/**
 * The web app manifest.
 *
 * @param {string} name The brand.
 * @param {string} color Its colour.
 * @returns {object} The manifest.
 */
const manifest = (name, color) => ({
	name,
	short_name: name,
	icons: [
		{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
		{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
	],
	theme_color: color,
	background_color: color,
	display: 'standalone',
});

/**
 * The palette as CSS custom properties.
 *
 * @param {import('../brand/color.js').Palette} p The palette.
 * @returns {string} The stylesheet.
 */
function css(p) {
	const vars = {
		primary: p.primary,
		'on-primary': p.onPrimary,
		ink: p.ink,
		paper: p.paper,
		...p.scale,
		'text-primary-on-light': p.text.primaryOnLight,
		'text-primary-on-dark': p.text.primaryOnDark,
	};
	return `:root {\n${Object.entries(vars).map(([k, v]) => `\t--brand-${k}: ${v};`).join('\n')}\n}\n`;
}
