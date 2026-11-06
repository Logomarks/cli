/**
 * @module logomarks/mcp/tools/edit
 *
 * `edit_mark`: a list of edits by part, run in order, the result fitted and
 * checked; and `list_parts`, the parts by index, to name them.
 */

import { z } from 'zod';
import { editMark, markParts, OPS } from '../../edit/ops.js';
import { partsPreview } from '../../edit/preview.js';
import { schema, readSource } from '../inputs.js';
import { edited } from '../edited.js';
import { result, text, image } from '../content.js';

/** A point on the 512 canvas. */
const point = z.tuple([z.number(), z.number()]);

/** One op. */
const op = z.object({
	op: z.enum(/** @type {[import('../../edit/ops.js').OpName, ...import('../../edit/ops.js').OpName[]]} */ (Object.keys(OPS))),
	parts: z.array(z.number().int().min(0)).optional().describe('Part indices from list_parts, as they stand when this op runs (a delete renumbers what follows). Default every part.'),
	dx: z.number().optional().describe('move: units across.'),
	dy: z.number().optional().describe('move: units down.'),
	angle: z.number().optional().describe('rotate: degrees, clockwise.'),
	by: z.union([z.number().positive(), z.tuple([z.number().positive(), z.number().positive()])]).optional().describe('scale: a factor, or [sx, sy].'),
	about: point.optional().describe('rotate, scale, flip: the point to turn about, on the 512 canvas. Default the parts’ centre.'),
	axis: z.enum(['horizontal', 'vertical', 'both']).optional().describe('flip: horizontal (left to right) or vertical. mirror: vertical (left matches right; the default), horizontal or both.'),
	radius: z.number().min(0).optional().describe('round: the corner radius in units.'),
	distance: z.number().optional().describe('offset: units to grow (positive) or shrink (negative).'),
	join: z.enum(['miter', 'round']).optional().describe('offset: sharp corners (miter, the default) or round.'),
	count: z.number().int().min(2).max(24).optional().describe('radial: copies about the centre (4).'),
	color: z.string().optional().describe('color, tone: hex.'),
});

/** @type {import('../index.js').Tool<import('./edit.js').EditInput>} */
export const tool = {
	name: 'edit_mark',
	title: 'Edit a mark',
	description: [
		'Edit a mark by part with a list of ops, run in order (the vector editor’s own operations: curves kept, booleans exact). Use it to change a live mark or fix one you drew.',
		`Ops: ${Object.entries(OPS).map(([k, v]) => `${k} (${v.about})`).join('; ')}.`,
		'Call list_parts first to see each part’s index, box and area. Example: [{"op":"delete","parts":[3]},{"op":"round","radius":12},{"op":"mirror","axis":"vertical"}].',
		'Returns { ok, parts (after), svg (512 canvas, longest side 448, centred; the file path instead with out), checks } and the result as an image. Fix any speck, sliver or gap the checks report.',
	].join(' '),
	inputSchema: {
		mark: schema.source,
		svg: schema.sourceSvg,
		ops: z.array(op).min(1).describe('The edits, in order.'),
		out: schema.out,
	},
	annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
	async run({ mark, svg, ops, out }, { cwd }) {
		const source = readSource({ mark, svg }, cwd);
		return edited(editMark(source.svg, ops, { name: source.name }), { out, cwd });
	},
};

/** @type {import('../index.js').Tool<import('./edit.js').PartsInput>} */
export const parts = {
	name: 'list_parts',
	title: 'List a mark’s parts',
	description: [
		'List a mark’s parts by index in drawing order; call it before edit_mark, whose ops name parts by these indices. Each part has its box [x0, y0, x1, y1] and centre on the 512 canvas, its area (holes taken out), its holes and its tone.',
		'Returns { count, parts } and an image of the mark with every part boxed and numbered.',
	].join(' '),
	inputSchema: { mark: schema.source, svg: schema.sourceSvg },
	annotations: { readOnlyHint: true, openWorldHint: false },
	async run({ mark, svg }, { cwd }) {
		const source = readSource({ mark, svg }, cwd);
		const list = markParts(source.svg);
		return result(text({ count: list.length, parts: list }), image(await partsPreview(source.svg, list)));
	},
};
