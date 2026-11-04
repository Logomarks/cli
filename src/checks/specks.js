/**
 * @module logomarks/checks/specks
 *
 * Stray specks, slivers and pin-holes a boolean left behind (speckcheck.mjs).
 * The mark is read as vectors (its filled area, by booleans); when the
 * booleans can't read it, as a scanline raster at 8 px a unit. Small parts
 * are reported unless they are tiny (two outlines touching), hairline
 * (invisible) or repeated (a dot field). A reviewed live mark's findings come
 * back as notes.
 */

import { SPECKS, REVIEWED } from '../rules.js';
import { area, perimeter, box } from '../geometry/polygon.js';
import { filledShape } from '../geometry/shape.js';
import { rings } from '../svg/rings.js';
import { frameOf, fill } from '../raster/scanline.js';
import { components } from '../raster/components.js';
import { finding } from './finding.js';

/**
 * Every piece and hole, read as vectors.
 *
 * @param {readonly import('../svg/shapes.js').Shape[]} paths The mark's shapes.
 * @param {string} seed Seeds the booleans' jitter.
 * @returns {import('./specks.js').Part[]} Its parts.
 */
function vectorParts(paths, seed) {
	/** @type {import('./specks.js').Part[]} */
	const out = [];
	for (const [outer, ...holes] of filledShape(paths, seed)) {
		const a = area(outer) - holes.reduce((s, h) => s + area(h), 0);
		const p = perimeter(outer) + holes.reduce((s, h) => s + perimeter(h), 0);
		out.push({ kind: 'piece', area: a, width: (2 * a) / p, box: box(outer) });
		for (const h of holes) out.push({ kind: 'hole', area: area(h), width: (2 * area(h)) / perimeter(h), box: box(h) });
	}
	return out;
}

/**
 * Every piece and hole, read from a scanline raster.
 *
 * @param {readonly import('../svg/shapes.js').Shape[]} paths The mark's shapes.
 * @returns {import('./specks.js').Part[]} Its parts.
 */
function rasterParts(paths) {
	const fp = paths.map((s) => ({ rings: rings(s.segs, 0.5), evenodd: s.evenodd }));
	const bm = fill(fp, frameOf(fp, SPECKS.rasterScale));
	const K = bm.scale;
	return components(bm)
		.filter((c) => c.ink || !c.border)
		.map((c) => {
			const a = c.pixels / (K * K);
			return {
				kind: c.ink ? 'piece' : 'hole',
				area: a,
				width: (2 * a) / Math.max(c.rim / K, 1e-9),
				box: /** @type {import('../geometry/polygon.js').Box} */ ([bm.x0 + c.box[0] / K, bm.y0 + c.box[1] / K, bm.x0 + c.box[2] / K, bm.y0 + c.box[3] / K]),
			};
		});
}

/**
 * Why a small part is left out, or '' when it is reported.
 *
 * @param {import('./specks.js').Part} p The part.
 * @param {readonly import('./specks.js').Part[]} parts All the mark's parts.
 * @param {number} tolerance How alike two areas must be to be repeats.
 * @returns {'' | 'tiny' | 'hairline' | 'repeated'} The reason.
 */
function skipReason(p, parts, tolerance) {
	if (p.area < SPECKS.tiny) return 'tiny';
	if (p.width < SPECKS.hairline) return 'hairline';
	const same = parts.filter((q) => q.kind === p.kind && Math.abs(q.area - p.area) <= tolerance * Math.max(p.area, q.area)).length;
	return same >= SPECKS.repeat ? 'repeated' : '';
}

/**
 * Speck findings for one mark.
 *
 * @param {readonly import('../svg/shapes.js').Shape[]} paths The mark's shapes.
 * @param {string} name The mark's name (its slug): seeds the jitter and looks up reviewed marks.
 * @returns {import('./finding.js').Finding[]} Specks, slivers and pin-holes, smallest first.
 */
export function speckFindings(paths, name) {
	/** @type {import('./finding.js').Finding[]} */
	const out = [];
	let parts, raster = false;
	try {
		parts = vectorParts(paths, name);
	} catch {
		parts = rasterParts(paths);
		raster = true;
		out.push(finding('raster-read', 'The booleans could not read this mark, so small parts were found on a raster (which can miss a speck touching the outline).'));
	}
	const tolerance = raster ? SPECKS.repeatTolerance.raster : SPECKS.repeatTolerance.vector;
	const reviewed = REVIEWED[/** @type {keyof typeof REVIEWED} */ (name)];
	const small = parts.filter((p) => p.area < (p.kind === 'piece' ? SPECKS.piece : SPECKS.hole)).sort((a, b) => a.area - b.area);
	for (const p of small) {
		if (skipReason(p, parts, tolerance)) continue;
		const o = { box: p.box, value: p.area, ...(reviewed && { severity: /** @type {const} */ ('info') }) };
		const note = reviewed ? ` Reviewed and kept: ${reviewed}.` : '';
		if (p.kind === 'hole') out.push(finding('pinhole', `A pin-hole of ${p.area.toFixed(1)} sq units.${note}`, o));
		else if (p.width < SPECKS.sliver) out.push(finding('sliver', `A sliver ${p.width.toFixed(2)} wide (${p.area.toFixed(1)} sq units).${note}`, o));
		else out.push(finding('speck', `A stray piece of ${p.area.toFixed(1)} sq units.${note}`, o));
	}
	return out;
}
