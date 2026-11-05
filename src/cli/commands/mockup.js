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
import { FONTS } from '../../brand/fonts.js';
import { wrapList } from '../help.js';

/** What `mockup` takes. */
export const spec = { flags: ['json'], options: { out: 'o', object: '', name: '', color: '', font: '', layout: '', surface: '', view: '', base: '', size: '', seed: '' } };

/** `logomarks mockup --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Put a brand on an object and write the image.',
	usage: ['<mark> --object <object> [-o file.png] [options]'],
	about: [
		`Objects: ${wrapList(Object.keys(OBJECTS), 80)}.`,
		'Garments, mugs and bags carry the mark; prints carry the lockup on the brand colour.',
	],
	options: [
		['--object <id>', 'The object (required).'],
		['--name <text>', "The brand's name. Default: the mark's name."],
		['--color <hex>', 'The brand colour, e.g. #ff5c3a. Default #d4ff3a.'],
		['--font <id>', `The typeface for the name (SIL OFL). Default inter.\n${wrapList(Object.keys(FONTS), 48)}.`],
		['--layout <id>', "One of the object's layouts (a wrong one lists them)."],
		['--surface <id>', 'What it lies on: oak, concrete, linen, paper, light, dark or a hex.'],
		['--view <front | angle>', "A screen's or a sign's view."],
		['--base <colour>', "The object's own colour: white, black, navy or a hex."],
		['--size <px>', 'The longest side, 200–4000. Default 1600.'],
		['--seed <text>', "Drives every random choice. Default: the mark's slug."],
		['-o, --out <file>', 'Write .png, or .svg for the layered SVG. Default <object>.png.'],
	],
	examples: ['logomarks mockup hex-gem --name "Hexa Labs" --object card -o card.png', 'logomarks mockup mark.svg --object tee --base black -o tee.png'],
};

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
