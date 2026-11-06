/**
 * @module logomarks/mcp/tools/glitch
 *
 * `glitch_mark`: a glitch edition of a mark, fitted and checked.
 */

import { z } from 'zod';
import { glitchMark, PRESETS, PRESET_ABOUT } from '../../edit/glitch.js';
import { schema, readSource } from '../inputs.js';
import { edited } from '../edited.js';

/** @type {import('../index.js').Tool<import('./glitch.js').GlitchInput>} */
export const tool = {
	name: 'glitch_mark',
	title: 'Glitch a mark',
	description: [
		'Make a glitch edition of a mark: cut with the house gap (22) and the pieces slid, as the Logomarks glitch editions are. Use it to make a live mark more your own.',
		`Presets: ${Object.entries(PRESET_ABOUT).map(([k, v]) => `${k} (${v})`).join('; ')}.`,
		'A seed places the cuts: the same seed gives the same SVG, byte for byte; another seed is a shuffle. A placement that would leave a speck or a sliver is nudged, then reseeded; when none is clean the call fails, so try another seed.',
		'Returns { ok, glitch, svg (512 canvas, longest side 448, centred; the file path instead with out), checks } and the result as an image: look at it.',
	].join(' '),
	inputSchema: {
		mark: schema.source,
		svg: schema.sourceSvg,
		preset: z.enum(/** @type {[import('../../edit/glitch.js').GlitchPreset, ...import('../../edit/glitch.js').GlitchPreset[]]} */ (Object.keys(PRESETS))).describe(`The kind of glitch: ${Object.keys(PRESETS).join(', ')}.`),
		angle: z.number().min(-180).max(180).optional().describe('The cut direction in degrees, clockwise from across. Default: the mark’s own slope (shear), across the lanes (lane), else 0.'),
		place: z.number().min(0).max(1).optional().describe('Where the first cut crosses, 0–1 across the mark. Default: seeded.'),
		slide: z.number().min(0).max(200).optional().describe('How far the sides slide apart along the cut, in units; a band’s largest nudge. Default 44 (twice the gap).'),
		gap: z.number().min(4).max(80).optional().describe('The gap at each cut, in units. Default 22 (the house gap).'),
		cuts: z.number().int().min(1).max(5).optional().describe('Cuts for slice (1–3), bands for bands (3–5). Default: seeded.'),
		seed: z.number().int().min(0).optional().describe('Places the cuts: the same seed gives the same SVG, another is a shuffle. Default 1.'),
		out: schema.out,
	},
	annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
	async run({ mark, svg, out, ...o }, { cwd }) {
		const source = readSource({ mark, svg }, cwd);
		return edited(glitchMark(source.svg, { ...o, name: source.name }), { out, cwd });
	},
};
