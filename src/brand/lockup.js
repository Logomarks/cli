/**
 * @module logomarks/brand/lockup
 *
 * The mark and the brand's name together: side by side (`horizontal`), the
 * name under the mark (`stacked`), or the mark alone (`mark`). Laid out on
 * the ink, not the canvas, so every mark sits the same: the name's cap
 * height a set share of the mark's height, centred on it, a quarter of the
 * mark's height clear all round. The name is outlines: the SVG needs no font.
 */

import { shapes } from '../svg/shapes.js';
import { bounds } from '../svg/outline.js';
import { markBody } from './mark.js';
import { typeset } from './type.js';
import { round as r } from '../util/round.js';

/** Proportions, as shares of the mark's drawn height. */
export const LOCKUP = {
	/** The mark's drawn height, in the lockup's units. */
	mark: 200,
	/** A wide mark is sized by its width over this, so it doesn't run long. */
	wide: 1.5,
	/** The name's cap height: beside the mark, under it. */
	cap: { horizontal: 0.42, stacked: 0.3 },
	/** The space between mark and name: beside, under. */
	gap: { horizontal: 0.3, stacked: 0.24 },
	/** Clear space all round. */
	clear: 0.25,
};


/** The lockup layouts. */
export const LAYOUTS = /** @type {const} */ (['horizontal', 'stacked', 'mark']);

/**
 * A lockup.
 *
 * @param {import('./lockup.js').LockupOptions} o The mark, name, face, layout and colours.
 * @returns {Promise<import('./lockup.js').Lockup>} The SVG, its inner markup and its size.
 */
export async function lockup({ mark, name, font, layout = 'horizontal', markColor, textColor = markColor, ground, clear = LOCKUP.clear }) {
	const ink = bounds(shapes(mark));
	const H = LOCKUP.mark;
	const k = H / Math.max(ink.h, ink.w / LOCKUP.wide);
	const mw = ink.w * k, mh = ink.h * k;
	/** Places the mark's ink box at (x, y). */
	const placeMark = (/** @type {number} */ x, /** @type {number} */ y) =>
		`<g transform="translate(${r(x - ink.x * k)} ${r(y - ink.y * k)}) scale(${r(k, 5)})">${markBody(mark, markColor)}</g>`;

	let parts, box;
	if (layout === 'mark' || !name.trim()) {
		parts = placeMark(0, 0);
		box = { x: 0, y: 0, w: mw, h: mh };
	} else {
		const set = await typeset(name, font);
		const s = (LOCKUP.cap[layout] * H) / set.cap;
		const tw = set.box.w * s, th = set.box.h * s;
		/** Places the name's pen origin (baseline) at (x, y). */
		const placeName = (/** @type {number} */ x, /** @type {number} */ y) => `<g transform="translate(${r(x)} ${r(y)}) scale(${r(s, 5)})" fill="${textColor}">${set.paths}</g>`;
		if (layout === 'horizontal') {
			const baseline = mh / 2 + (set.cap * s) / 2;
			const x = mw + LOCKUP.gap.horizontal * H - set.box.x * s;
			parts = placeMark(0, 0) + placeName(x, baseline);
			const top = Math.min(0, baseline + set.box.y * s), bottom = Math.max(mh, baseline + set.box.y * s + th);
			box = { x: 0, y: top, w: mw + LOCKUP.gap.horizontal * H + tw, h: bottom - top };
		} else {
			const w = Math.max(mw, tw);
			const baseline = mh + LOCKUP.gap.stacked * H + set.cap * s;
			parts = placeMark((w - mw) / 2, 0) + placeName((w - tw) / 2 - set.box.x * s, baseline);
			box = { x: 0, y: 0, w, h: baseline + set.box.y * s + th };
		}
	}
	const pad = clear * H;
	const width = r(box.w + 2 * pad), height = r(box.h + 2 * pad);
	const body = `${ground ? `<rect width="${width}" height="${height}" fill="${ground}"/>` : ''}<g transform="translate(${r(pad - box.x)} ${r(pad - box.y)})">${parts}</g>`;
	return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>\n`, body, width, height };
}

