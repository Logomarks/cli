/**
 * @module logomarks/cli/commands/get
 *
 * `logomarks get <slug|name>`: a live mark's SVG (from the bundled index) to
 * stdout or a file, in a colour, or a PNG at a size.
 */

import { paint, markPng, MARK_URL } from '../../brand/mark.js';
import { UsageError } from '../args.js';
import { markArg, colorArg, intArg, writeFile } from '../options.js';
import { style } from '../style.js';

/** What `get` takes. */
export const spec = { flags: ['json'], options: { out: 'o', color: '', size: '', format: '' } };

/** A PNG's side when none is given. */
const PNG_SIZE = 512;

/**
 * Runs `get`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const { out, format: asked } = args.options;
	const color = colorArg(args.options.color);
	const size = intArg('size', args.options.size, 16, 4096);
	const format = asked ?? (out?.toLowerCase().endsWith('.png') || size ? 'png' : 'svg');
	if (format !== 'svg' && format !== 'png') throw new UsageError('--format is svg or png');
	if (format === 'png' && !out) throw new UsageError('a PNG needs -o file.png');
	const svg = paint(mark.svg, color);
	const data = format === 'png' ? await markPng(mark.svg, { size: size ?? PNG_SIZE, color: color ?? '#000000' }) : svg;
	if (out) writeFile(out, data);
	const about = { slug: mark.slug, name: mark.name, ...(mark.live && { url: MARK_URL + mark.slug, licence: 'CC0-1.0' }), format, color: color ?? (format === 'png' ? '#000000' : 'currentColor'), ...(format === 'png' && { size: size ?? PNG_SIZE }) };
	if (args.flags.has('json')) io.out(JSON.stringify({ ...about, ...(out ? { file: out } : { svg }) }, null, 2));
	else if (out) io.out(`${style.green('✓')} wrote ${style.bold(out)}: ${mark.name}${mark.live ? style.dim(` (CC0, ${about.url})`) : ''}`);
	else io.out(svg.trimEnd());
	return 0;
}
