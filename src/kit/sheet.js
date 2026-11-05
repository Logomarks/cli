/**
 * @module logomarks/kit/sheet
 *
 * The brand on one page: the name, the lockup on the brand colour, the logo
 * on light, dark and colour, the palette with its contrast, the typeface,
 * the small sizes and the social images. Labels in IBM Plex Mono, the
 * specimen in the brand's face.
 */

import { lockup } from '../brand/lockup.js';
import { artwork } from '../brand/artwork.js';
import { tile, MARK_URL } from '../brand/mark.js';
import { FONTS } from '../brand/fonts.js';
import { contrast, onColor, mix, AA, AAA, GRAPHIC } from '../brand/color.js';
import { text, panel, nest, image } from '../sheet/draw.js';
import { render } from '../raster/render.js';

/** The page: its width, margin, the gutter between tiles, and the space between sections. */
const PAGE = { width: 1600, margin: 72, gutter: 24, section: 64 };

/** The content's width. */
const INNER = PAGE.width - 2 * PAGE.margin;

/**
 * How a contrast rates.
 *
 * @param {number} ratio The contrast.
 * @returns {string} `AAA`, `AA`, `AA large` or `fails`.
 */
const rate = (ratio) => (ratio >= AAA ? 'AAA' : ratio >= AA ? 'AA' : ratio >= GRAPHIC ? 'AA large' : 'fails');

/**
 * Two colours' contrast, written with its rating.
 *
 * @param {string} fg The text.
 * @param {string} bg The ground.
 * @returns {string} `6.41:1 AA`.
 */
const ratio = (fg, bg) => `${contrast(fg, bg)}:1 ${rate(contrast(fg, bg))}`;

/**
 * The brand sheet.
 *
 * @param {import('./sheet.js').SheetOptions} o The brand, and the social images already drawn.
 * @returns {Promise<Uint8Array>} The PNG.
 */
export async function brandSheet({ mark, name, font, palette: p, social }) {
	const face = FONTS[font];
	const muted = mix(p.ink, p.paper, 0.45), line = mix(p.ink, p.paper, 0.85);
	const label = (/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ s, color = muted) => text(x, y, s, { size: 15, color });
	let y = PAGE.margin, out = '';

	/** A section's heading and rule; moves y below them. */
	const heading = (/** @type {string} */ n, /** @type {string} */ title) => {
		out += text(PAGE.margin, y + 16, `${n}  ${title.toUpperCase()}`, { size: 15, weight: 600, color: p.ink });
		out += `<rect x="${PAGE.margin}" y="${y + 30}" width="${INNER}" height="1" fill="${line}"/>`;
		y += 56;
	};

	// header
	out += label(PAGE.margin, y + 16, 'BRAND SHEET');
	out += text(PAGE.margin, y + 96, name, { size: 76, color: p.ink, font: face.family, weight: face.weight });
	const source = mark.live ? `${mark.name}, ${MARK_URL.replace('https://', '')}${mark.slug} (CC0)` : mark.name;
	out += label(PAGE.margin, y + 140, `Mark: ${source}   ·   Type: ${face.name}   ·   Colour: ${p.primary}`);
	y += 176;

	// hero
	const heroH = 520;
	const hero = await artwork({ mark: mark.svg, name, font, palette: p, width: INNER, height: heroH, fill: 0.5, motif: true });
	out += `<clipPath id="hero"><rect x="${PAGE.margin}" y="${y}" width="${INNER}" height="${heroH}" rx="20"/></clipPath><g clip-path="url(#hero)">${nest(hero, PAGE.margin, y, INNER, heroH)}</g>`;
	y += heroH + PAGE.section;

	// logo
	heading('01', 'Logo');
	const tw = (INNER - 2 * PAGE.gutter) / 3, th = 280;
	const grounds = [
		{ caption: 'On light', ground: p.paper, markColor: p.mark.onLight, textColor: p.text.onLight },
		{ caption: 'On dark', ground: p.ink, markColor: p.mark.onDark, textColor: p.text.onDark },
		{ caption: 'On colour', ground: p.primary, markColor: p.onPrimary, textColor: p.onPrimary },
	];
	for (const [row, layout] of /** @type {const} */ ([[0, 'horizontal'], [1, 'stacked']]))
		for (const [i, g] of grounds.entries()) {
			const x = PAGE.margin + i * (tw + PAGE.gutter), top = y + row * (th + PAGE.gutter);
			const l = await lockup({ mark: mark.svg, name, font, layout, markColor: g.markColor, textColor: g.textColor });
			out += panel(x, top, tw, th, g.ground, { r: 14, stroke: g.ground === p.paper ? line : undefined });
			out += nest(l.svg, x + 40, top + 28, tw - 80, th - 76);
			out += text(x + 20, top + th - 20, g.caption, { size: 13, color: mix(g.textColor, g.ground, 0.4) });
		}
	y += 2 * th + PAGE.gutter + 20;
	out += label(PAGE.margin, y + 16, 'Keep a quarter of the mark’s height clear on every side. Smallest: 16 px on screen, 8 mm in print.');
	y += 32 + PAGE.section;

	// colour
	heading('02', 'Colour');
	const steps = Object.entries(p.scale), sw = (INNER - (steps.length - 1) * 8) / steps.length, sh = 150;
	steps.forEach(([step, hex], i) => {
		const x = PAGE.margin + i * (sw + 8), ink = onColor(hex);
		out += panel(x, y, sw, sh, hex, { r: 10 });
		out += text(x + 12, y + sh - 34, step, { size: 14, weight: 600, color: ink });
		out += text(x + 12, y + sh - 14, hex, { size: 13, color: ink });
	});
	y += sh + PAGE.gutter;
	const cw = (INNER - 3 * PAGE.gutter) / 4, ch = 150;
	const chips = [
		{ title: 'Primary', bg: p.primary, fg: p.onPrimary, lines: [p.primary, `Text on it ${p.onPrimary}: ${ratio(p.onPrimary, p.primary)}`] },
		{ title: 'Ink', bg: p.ink, fg: p.paper, lines: [p.ink, `Paper on it: ${ratio(p.paper, p.ink)}`] },
		{ title: 'Paper', bg: p.paper, fg: p.ink, lines: [p.paper, `Primary text on it ${p.text.primaryOnLight}: ${ratio(p.text.primaryOnLight, p.paper)}`] },
		{ title: 'On dark', bg: p.ink, fg: p.text.primaryOnDark, lines: [p.text.primaryOnDark, `Primary text on ink: ${ratio(p.text.primaryOnDark, p.ink)}`] },
	];
	chips.forEach((c, i) => {
		const x = PAGE.margin + i * (cw + PAGE.gutter);
		out += panel(x, y, cw, ch, c.bg, { r: 14, stroke: c.bg === p.paper ? line : undefined });
		out += text(x + 20, y + 44, c.title, { size: 26, color: c.fg, font: face.family, weight: face.weight });
		c.lines.forEach((s, k) => (out += text(x + 20, y + 96 + k * 24, s, { size: 13, color: c.fg })));
	});
	y += ch + PAGE.section;

	// type
	heading('03', 'Type');
	out += text(PAGE.margin, y + 170, 'Aa', { size: 200, color: p.ink, font: face.family, weight: face.weight });
	const tx = PAGE.margin + 330;
	out += text(tx, y + 56, face.name, { size: 48, color: p.ink, font: face.family, weight: face.weight });
	out += text(tx, y + 110, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', { size: 30, color: p.ink, font: face.family, weight: face.weight });
	out += text(tx, y + 152, 'abcdefghijklmnopqrstuvwxyz 0123456789', { size: 30, color: p.ink, font: face.family, weight: face.weight });
	out += label(tx, y + 196, `${face.name} ${face.weight} · SIL Open Font License · fonts.google.com/specimen/${face.google.replace(/ /g, '+')}`);
	y += 220 + PAGE.section;

	// small sizes and social
	heading('04', 'Icons and social');
	const icon = { color: p.onPrimary, ground: p.primary };
	let x = PAGE.margin;
	for (const size of [16, 32, 48]) {
		out += nest(tile(mark.svg, { size, ...icon, pad: 0.08, radius: 0.22 }), x, y + 90 - size, size, size);
		out += text(x, y + 116, `${size}`, { size: 13, color: muted });
		x += size + 28;
	}
	out += nest(tile(mark.svg, { size: 90, ...icon, pad: 0.18, radius: 0.22 }), x + 12, y, 90, 90);
	out += text(x + 12, y + 116, 'app', { size: 13, color: muted });
	const ogW = 560, ogH = (ogW * 630) / 1200, xhW = 560, xhH = xhW / 3, sx = PAGE.margin + INNER - ogW - PAGE.gutter - xhW;
	out += image(social.og, sx, y, ogW, ogH) + label(sx, y + ogH + 24, 'Open Graph 1200 × 630');
	const hx = sx + ogW + PAGE.gutter;
	out += image(social['x-header'], hx, y, xhW, xhH) + label(hx, y + xhH + 24, 'X header 1500 × 500');
	out += `<clipPath id="avatar"><circle cx="${hx + 60}" cy="${y + xhH + 104}" r="60"/></clipPath><g clip-path="url(#avatar)">${image(social.avatar, hx, y + xhH + 44, 120, 120)}</g>`;
	out += label(hx + 140, y + xhH + 110, 'Avatar 400 × 400');
	y += Math.max(ogH + 24, xhH + 164) + PAGE.section;

	out += label(PAGE.margin, y, `${name} · made with logomarks kit · logomarks.ai`);
	const height = Math.round(y + PAGE.margin - 20);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE.width}" height="${height}" viewBox="0 0 ${PAGE.width} ${height}"><rect width="${PAGE.width}" height="${height}" fill="${p.paper}"/>${out}</svg>`;
	return /** @type {Uint8Array} */ ((await render(svg, { text: true, png: true })).png);
}
