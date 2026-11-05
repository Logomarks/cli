/**
 * @module logomarks/cli/commands/kit
 *
 * `logomarks kit <slug|file.svg> --name "Brand" -o dir/`: the brand kit
 * (`@arraypress/brand-kit`) written to a folder.
 */

import path from 'node:path';
import { kit } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { brandArgs, packArgs, asUsage, writeFiles } from '../options.js';
import { style } from '../style.js';

/** What `kit` takes. */
export const spec = { flags: ['json', 'animated', 'no-social'], options: { out: 'o', name: '', color: '', font: '', tagline: '', url: '', handle: '', styles: '', platforms: '' } };

/**
 * Runs `kit`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const brand = brandArgs(args);
	const dir = args.options.out ?? `${slugify(brand.name) || 'brand'}-kit`;
	const k = await asUsage(() => kit({ ...brand, ...packArgs(args), social: !args.flags.has('no-social') }));
	const n = writeFiles(dir, k.files);
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: true, dir, ...k.brand }, null, 2));
	else {
		io.out(`${style.green('✓')} wrote ${style.bold(`${n} files`)} to ${style.bold(dir)}: ${brand.name} in ${k.brand.colors.primary}, ${k.brand.font.name}, on ${brand.mark.name}.`);
		io.out(style.dim('  mark/  favicon/  lockup/  colors/  social/  brand.json  README.md'));
		io.out(`  Look at ${style.bold(path.join(dir, 'brand-sheet.png'))}.`);
	}
	return 0;
}
