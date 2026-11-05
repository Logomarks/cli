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
import { markParts, smallParts } from '@arraypress/marks-kit/analyse';
import { finding } from './finding.js';

/**
 * A mark's specks, slivers and pin-holes, smallest first.
 *
 * @param {readonly import('@arraypress/marks-kit/svg').FilledPath[]} paths The mark's shapes.
 * @param {string} name The mark's name (its slug: seeds the booleans' jitter, and finds a reviewed mark).
 * @returns {import('./finding.js').Finding[]} Specks, slivers and pin-holes, smallest first.
 */
export function speckFindings(paths, name) {
	/** @type {import('./finding.js').Finding[]} */
	const out = [];
	const read = markParts(paths, { seed: name });
	if (read.raster) out.push(finding('raster-read', 'The booleans could not read this mark, so small parts were found on a raster (which can miss a speck touching the outline).'));
	const reviewed = REVIEWED[/** @type {keyof typeof REVIEWED} */ (name)];
	for (const p of smallParts(read.parts, { piece: SPECKS.piece, hole: SPECKS.hole, raster: read.raster })) {
		if (p.skip) continue;
		const o = { box: p.box, value: p.area, ...(reviewed && { severity: /** @type {const} */ ('info') }) };
		const note = reviewed ? ` Reviewed and kept: ${reviewed}.` : '';
		if (p.kind === 'hole') out.push(finding('pinhole', `A pin-hole of ${p.area.toFixed(1)} sq units.${note}`, o));
		else if (p.width < SPECKS.sliver) out.push(finding('sliver', `A sliver ${p.width.toFixed(2)} wide (${p.area.toFixed(1)} sq units).${note}`, o));
		else out.push(finding('speck', `A stray piece of ${p.area.toFixed(1)} sq units.${note}`, o));
	}
	return out;
}
