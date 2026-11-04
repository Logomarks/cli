/**
 * @module logomarks/cli/commands/kit
 *
 * `logomarks kit <slug|file.svg> --name "Brand" -o dir/`: a free brand
 * starter kit written to a folder.
 */

import path from 'node:path';
import { kit } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { markArg, colorArg, fontArg, writeFile } from '../options.js';
import { style } from '../style.js';

/** What `kit` takes. */
export const spec = { flags: ['json'], options: { out: 'o', name: '', color: '', font: '' } };

/**
 * Runs `kit`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const name = args.options.name?.trim() || mark.name;
	const color = colorArg(args.options.color);
	const font = fontArg(args.options.font);
	const dir = args.options.out ?? `${slugify(name) || 'brand'}-kit`;
	const k = await kit({ mark, name, color, font });
	for (const f of k.files) writeFile(path.join(dir, f.path), f.data);
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: true, dir, ...k.brand }, null, 2));
	else {
		io.out(`${style.green('✓')} wrote ${style.bold(`${k.files.length} files`)} to ${style.bold(dir)}: ${name} in ${k.brand.colors.primary}, ${k.brand.font.name}, on ${mark.name}.`);
		io.out(style.dim('  mark/  favicon/  lockup/  social/  colors/  brand.json'));
		io.out(`  Look at ${style.bold(path.join(dir, 'brand-sheet.png'))}.`);
	}
	return 0;
}
