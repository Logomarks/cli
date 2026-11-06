/**
 * @module logomarks/cli/commands/glitch
 *
 * `logomarks glitch <slug|file.svg> --preset shear -o out.svg`: a glitch
 * edition, fitted and checked. The same seed gives the same bytes.
 */

import { glitchMark, PRESETS } from '../../edit/glitch.js';
import { UsageError } from '../args.js';
import { markArg, numArg, intArg, asUsage } from '../options.js';
import { output } from '../edited.js';

/** What `glitch` takes. */
export const spec = { flags: ['json'], options: { out: 'o', preset: '', angle: '', place: '', slide: '', gap: '', cuts: '', seed: '' } };

/** `logomarks glitch --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Make a glitch edition of a mark: cut with the house gap and slid.',
	usage: ['<mark> [--preset shear] [-o out.svg] [options]'],
	about: [
		'The result is fitted and checked, and the same seed gives the same bytes. Without -o the',
		'SVG goes to stdout and the checks to stderr. Exit 1 when the result fails a check: try',
		'another seed.',
	],
	options: [
		['--preset <name>', `${Object.keys(PRESETS).join(', ')}. Default shear.`],
		['--seed <n>', 'Places the cuts; another seed is a shuffle. Default 1.'],
		['--angle <deg>', "Cut direction, clockwise from across. Default: the mark's slope\n(shear), across the lanes (lane), else 0."],
		['--place <0–1>', 'Where the first cut crosses the mark. Default: seeded.'],
		['--slide <units>', 'How far the sides slide apart along the cut. Default 44.'],
		['--gap <units>', 'The gap at each cut. Default 22.'],
		['--cuts <n>', 'Cuts for slice (1–3), bands for bands (3–5). Default: seeded.'],
		['-o, --out <file>', 'Write .svg, or .png drawn at 512.'],
	],
	examples: ['logomarks glitch quad-cove --preset shear --seed 3 -o glitched.svg', 'logomarks glitch mark.svg --preset bands --cuts 4 -o preview.png'],
};

/**
 * Runs `glitch`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0 when the result passes its checks, 1 otherwise.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const preset = /** @type {import('../../edit/glitch.js').GlitchPreset} */ (args.options.preset ?? 'shear');
	if (!(preset in PRESETS)) throw new UsageError(`--preset is one of ${Object.keys(PRESETS).join(', ')}`);
	const o = args.options;
	const r = await asUsage(async () => glitchMark(mark.svg, {
		preset, name: mark.slug, angle: numArg('angle', o.angle), place: numArg('place', o.place), slide: numArg('slide', o.slide),
		gap: numArg('gap', o.gap), cuts: intArg('cuts', o.cuts, 1, 5), seed: intArg('seed', o.seed, 0, 2 ** 31),
	}));
	const g = r.glitch;
	return output(args, io, r, { name: mark.slug, summary: `${mark.name}, ${preset} at seed ${g.seed} (${g.cuts} cut${g.cuts > 1 ? 's' : ''}, ${g.angle}°, ${g.pieces} pieces)` });
}
