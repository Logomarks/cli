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

/** `logomarks cover --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Draw a cover (an OG image, a header or a post) with the mark on it.',
	usage: ['<mark> [--recipe mark] [--title "…"] [-o cover.png] [options]'],
	about: [`Recipes: ${Object.keys(RECIPES).join(', ')}.`],
	options: [
		['--recipe <id>', 'The look. Default mark.'],
		['--title <text>', 'A headline; the mark moves out of its way.'],
		['--label <text>', 'A small line over the title.'],
		['--color <hex>', 'The brand colour, e.g. #ff5c3a. Default #d4ff3a.'],
		['--aspect <ratio>', 'og (1200×630), 1:1, 16:9, 4:5, 9:16, any w:h, or a number.\nDefault og.'],
		['--width <px>', 'The width, 200–6000. Default 1200.'],
		['--seed <text>', "Drives every random choice. Default: the mark's slug."],
		['-o, --out <file>', 'Write .png, or .svg (text as outlines). Default cover.png.'],
	],
	examples: ['logomarks cover hex-gem --recipe aurora --title "Introducing Hexa" -o cover.png', 'logomarks cover mark.svg --recipe stripes --aspect 1:1 -o post.png'],
};

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
