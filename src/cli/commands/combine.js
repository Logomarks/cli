/**
 * @module logomarks/cli/commands/combine
 *
 * `logomarks combine <a> <b> --op subtract --scale 0.5 -o out.svg`: two
 * marks made one, fitted and checked. Each is a live slug or an .svg file.
 */

import { combineMarks, COMBINE_OPS } from '../../edit/combine.js';
import { UsageError } from '../args.js';
import { markOf, numArg, asUsage } from '../options.js';
import { output } from '../edited.js';

/** What `combine` takes. */
export const spec = { flags: ['json'], options: { out: 'o', op: '', scale: '', rotate: '', flip: '', x: '', y: '' } };

/**
 * Runs `combine`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0 when the result passes its checks, 1 otherwise.
 */
export async function run(args, io) {
	if (args.positionals.length !== 2) throw new UsageError('combine takes two marks: slugs or .svg files');
	const [a, b] = args.positionals.map(markOf);
	const op = /** @type {import('../../edit/combine.js').CombineOp} */ (args.options.op ?? 'union');
	if (!COMBINE_OPS.includes(op)) throw new UsageError(`--op is one of ${COMBINE_OPS.join(', ')}`);
	const o = args.options;
	if (o.flip && o.flip !== 'horizontal' && o.flip !== 'vertical') throw new UsageError('--flip is horizontal or vertical');
	const transform = { scale: numArg('scale', o.scale), rotate: numArg('rotate', o.rotate), flip: /** @type {'horizontal' | 'vertical' | undefined} */ (o.flip), x: numArg('x', o.x), y: numArg('y', o.y) };
	const name = `${a.slug}-${op}-${b.slug}`;
	const r = await asUsage(async () => combineMarks(a.svg, b.svg, { op, transform, name }));
	return output(args, io, r, { name, summary: `${a.name} ${op} ${b.name}` });
}
