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

/** `logomarks combine --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Combine two marks into one.',
	usage: ['<a> <b> [--op union] [-o out.svg] [options]'],
	about: [
		"b is placed over a on the 512 canvas (both fitted first), then combined. The result is",
		'fitted and checked; exit 1 when it fails a check.',
	],
	options: [
		['--op <op>', `${COMBINE_OPS.join(', ')}. Default union.`],
		['--scale <factor>', 'Scale b about its own centre. Default 1.'],
		['--rotate <deg>', 'Turn b clockwise about its own centre. Default 0.'],
		['--flip <axis>', 'Flip b: horizontal or vertical.'],
		['--x <units>, --y <units>', 'Move b across and down. Default 0.'],
		['-o, --out <file>', 'Write .svg, or .png drawn at 512. Default: the SVG to stdout.'],
	],
	examples: ['logomarks combine quad-cove shear-a --op subtract --scale 0.5 -o combined.svg', 'logomarks combine a.svg b.svg --op place --x 120 -o both.png'],
};

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
