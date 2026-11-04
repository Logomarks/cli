/**
 * @module logomarks/cli/commands/cover
 *
 * `logomarks cover <slug|file> --recipe mark --title … -o out.png`: a
 * cover with the mark on it. `-o` ending in `.svg` writes the SVG instead.
 */

import { cover, RECIPES } from '../../cover/index.js';
import { UsageError } from '../args.js';
import { markArg, colorArg, intArg, writeFile } from '../options.js';
import { style } from '../style.js';

/** What `cover` takes. */
export const spec = { flags: ['json'], options: { out: 'o', recipe: '', title: '', label: '', color: '', aspect: '', width: '', seed: '' } };

/**
 * Runs `cover`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const { recipe = 'mark', title, label, aspect, seed } = args.options;
	if (!(recipe in RECIPES)) throw new UsageError(`--recipe is one of ${Object.keys(RECIPES).join(', ')}`);
	if (aspect && !/^(og|\d+(\.\d+)?(:\d+(\.\d+)?)?)$/.test(aspect)) throw new UsageError('--aspect is og, w:h (16:9) or a number');
	const out = args.options.out ?? 'cover.png';
	const c = await cover({ mark, recipe, title, label, seed, color: colorArg(args.options.color), aspect: aspect && /^[\d.]+$/.test(aspect) ? Number(aspect) : aspect, width: intArg('width', args.options.width, 200, 6000) });
	writeFile(out, out.toLowerCase().endsWith('.svg') ? c.svg : c.png);
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: true, file: out, recipe, width: c.width, height: c.height }, null, 2));
	else io.out(`${style.green('✓')} wrote ${style.bold(out)}: ${recipe}, ${c.width} × ${c.height}.`);
	return 0;
}
