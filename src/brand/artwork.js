/**
 * @module logomarks/brand/artwork
 *
 * Simple branded artwork at any size: the brand colour edge to edge, the
 * lockup (or the mark) centred on it in the colour that reads on it, and
 * optionally the mark large and faint, bleeding off one side. The social
 * images and every full-bleed print in a mockup are drawn with it.
 */

import { lockup } from './lockup.js';
import { markBody } from './mark.js';
import { mix } from './color.js';
import { CANVAS } from '../rules.js';
import { round as r } from '../util/round.js';

/**
 * Branded artwork.
 *
 * @param {import('./artwork.js').ArtworkOptions} o The brand, the size and the layout.
 * @returns {Promise<string>} The SVG.
 */
export async function artwork({ mark, name, font, palette, width, height, layout = 'horizontal', fill = 0.6, ground = palette.primary, markColor = palette.onPrimary, textColor = markColor, motif = false }) {
	const l = await lockup({ mark, name, font, layout, markColor, textColor, clear: 0 });
	const k = Math.min((fill * width) / l.width, (fill * 0.8 * height) / l.height);
	const w = l.width * k, h = l.height * k;
	const big = height * 1.5;
	const faint = motif
		? `<svg x="${r(width - big * 0.62)}" y="${r((height - big) / 2)}" width="${r(big)}" height="${r(big)}" viewBox="0 0 ${CANVAS} ${CANVAS}">${markBody(mark, mix(ground, markColor, 0.07))}</svg>`
		: '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${ground}"/>${faint}<svg x="${r((width - w) / 2)}" y="${r((height - h) / 2)}" width="${r(w)}" height="${r(h)}" viewBox="0 0 ${l.width} ${l.height}">${l.body}</svg></svg>`;
}

