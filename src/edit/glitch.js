/**
 * @module logomarks/edit/glitch
 *
 * A glitch edition of a mark in one step (`@logomarks/editor`'s
 * `glitch`): cut with the house gap and the pieces slid, the cuts placed by
 * a seed, so the same seed gives the same bytes.
 */

import { glitch, GLITCH_DEFAULTS } from '@logomarks/editor/ops';
import { toDoc, finish } from './doc.js';

/** The presets by the names the CLI and the tools use, and the editor's own. */
export const PRESETS = /** @type {const} */ ({ shear: 'shear', slice: 'slice', bands: 'bandShift', stepped: 'stepped', lane: 'laneChange' });

/** What each preset does. */
export const PRESET_ABOUT = {
	shear: 'one cut along the mark’s own slope, the sides slid apart',
	slice: '1–3 parallel cuts, alternate bands slid',
	bands: '3–5 bands across, each nudged by a seeded amount',
	stepped: 'a stair-step cut, the sides slid apart',
	lane: 'one cut across a Track mark’s lanes, one side slid one lane',
};

/**
 * A glitch edition.
 *
 * @param {string} svg The mark.
 * @param {import('./glitch.js').GlitchOptions} o The preset and its settings.
 * @returns {import('./glitch.js').Glitched} The SVG, the checks, and what the glitch did.
 * @throws {RangeError} For an unknown preset, or when no placement cuts the mark cleanly.
 */
export function glitchMark(svg, { preset, angle, place, slide, gap, cuts, seed = GLITCH_DEFAULTS.seed, name }) {
	const kind = PRESETS[preset];
	if (!kind) throw new RangeError(`no preset "${preset}": one of ${Object.keys(PRESETS).join(', ')}`);
	// Unset settings may be undefined: vector-editor 0.2.2 and later keep its defaults for them.
	const r = glitch(toDoc(svg), [], kind, { angle, position: place, offset: slide, gap, count: cuts, seed });
	if (r.rejected) throw new RangeError(`no clean ${preset} for this mark at seed ${seed}: every placement left a speck or a sliver. Try another seed, angle or place.`);
	if (!r.cuts.length) throw new RangeError(preset === 'lane' ? 'a lane change needs a Track mark (parallel lines with a gap); none was found' : `the ${preset} cut misses the mark: try another place or angle`);
	return {
		...finish(r.doc, name),
		glitch: { preset, seed, angle: Math.round(r.angle * 10) / 10, cuts: r.cuts.length, pieces: r.pieces.length, nudged: r.nudged, removed: r.removed, pitch: r.pitch },
	};
}
