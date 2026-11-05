/**
 * @module logomarks/cli/commands/mockup
 *
 * `logomarks mockup <slug|file> --object card -o out.png`: the brand on a
 * 2D object. `-o` ending in `.svg` writes the layered SVG instead.
 */

import { mockup, OBJECTS } from '../../mockup/index.js';
import { UsageError } from '../args.js';
import { markArg, colorArg, fontArg, intArg, asUsage, writeFile } from '../options.js';
import { style } from '../style.js';

/** What `mockup` takes. */
export const spec = { flags: ['json'], options: { out: 'o', object: '', name: '', color: '', font: '', layout: '', surface: '', view: '', base: '', size: '', seed: '' } };

/**
 * Runs `mockup`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const { object, out: file, name, layout, surface, view, base, seed } = args.options;
	if (!object || !(object in OBJECTS)) throw new UsageError(`--object is one of ${Object.keys(OBJECTS).join(', ')}`);
	const out = file ?? `${object}.png`;
	const options = { mark, object, name: name?.trim() || undefined, color: colorArg(args.options.color), font: fontArg(args.options.font), layout, surface, view, base, seed, size: intArg('size', args.options.size, 200, 4000) };
	const m = await asUsage(() => mockup(options));
	writeFile(out, out.toLowerCase().endsWith('.svg') ? m.svg : m.png);
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: true, file: out, object, width: m.width, height: m.height }, null, 2));
	else io.out(`${style.green('✓')} wrote ${style.bold(out)}: ${options.name ?? mark.name} on a ${object}, ${m.width} × ${m.height}.`);
	return 0;
}
