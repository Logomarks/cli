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
