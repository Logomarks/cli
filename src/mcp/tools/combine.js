/**
 * @module logomarks/mcp/tools/combine
 *
 * `combine_marks`: two marks made one, fitted and checked.
 */

import { z } from 'zod';
import { combineMarks, COMBINE_OPS } from '../../edit/combine.js';
import { readAnyMark, schema } from '../inputs.js';
import { edited } from '../edited.js';

/** A mark, by any means. */
const markRef = z.string().min(1);

/** @type {import('../index.js').Tool<import('./combine.js').CombineInput>} */
export const tool = {
	name: 'combine_marks',
	title: 'Combine two marks',
	description: [
		'Combine two marks into one with the vector editor’s booleans (curves kept): union, subtract (b cut out of a), intersect, exclude (where exactly one covers), or place (both, as they are).',
		'b is placed on a’s 512 canvas first: transform scales and turns it about its own centre, flips it, then moves it by x, y units. Both are fitted to the grid first, so scale 0.5 makes b half a’s size.',
		'Returns { ok, svg (512 canvas, longest side 448, centred; the file path instead with out), checks } and the result as an image.',
	].join(' '),
	inputSchema: {
		a: markRef.describe('The first mark: a live slug or name, an .svg path, or SVG text.'),
		b: markRef.describe('The second, the same ways.'),
		op: z.enum(/** @type {[import('../../edit/combine.js').CombineOp, ...import('../../edit/combine.js').CombineOp[]]} */ ([...COMBINE_OPS])).describe(`How to combine them: ${COMBINE_OPS.join(', ')}.`),
		transform: z.object({
			scale: z.number().positive().optional().describe('Scale b about its own centre. Default 1.'),
			rotate: z.number().optional().describe('Turn b clockwise about its own centre, in degrees. Default 0.'),
			flip: z.enum(['horizontal', 'vertical']).optional().describe('Flip b. Default: no flip.'),
			x: z.number().optional().describe('Move b across, in units. Default 0.'),
			y: z.number().optional().describe('Move b down, in units. Default 0.'),
		}).optional().describe('Where b goes over a. Default: centred, as it is.'),
		out: schema.out,
	},
	annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
	async run({ a, b, op, transform, out }, { cwd }) {
		const [first, second] = [readAnyMark(a, cwd), readAnyMark(b, cwd)];
		return edited(combineMarks(first.svg, second.svg, { op, transform, name: `${first.name}-${op}-${second.name}` }), { out, cwd });
	},
};
