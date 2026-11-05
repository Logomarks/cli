/**
 * @module logomarks/cli/commands/social
 *
 * `logomarks social <slug|file.svg> --name "Brand" -o dir/`: the social pack
 * (`@logomarks/brand-kit`): every platform image in each style, the email
 * signature and the Open Graph card, written to a folder.
 */

import path from 'node:path';
import { social } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { brandArgs, packArgs, asUsage, writeFiles } from '../options.js';
import { style } from '../style.js';

/** What `social` takes. */
export const spec = { flags: ['json', 'animated'], options: { out: 'o', name: '', color: '', font: '', tagline: '', url: '', handle: '', styles: '', platforms: '' } };

/**
 * Runs `social`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const brand = brandArgs(args);
	const dir = args.options.out ?? `${slugify(brand.name) || 'brand'}-social`;
	const pack = await asUsage(() => social({ ...brand, ...packArgs(args) }));
	const files = [...pack.files.keys()];
	writeFiles(dir, pack.files);
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: true, dir, count: files.length, files }, null, 2));
	else {
		const images = files.filter((f) => f.endsWith('.png'));
		io.out(`${style.green('✓')} wrote ${style.bold(`${files.length} files`)} to ${style.bold(dir)}: ${images.length} images of ${brand.name}.`);
		io.out(`  Sizes and sources: ${style.bold(path.join(dir, 'README.md'))}.`);
	}
	return 0;
}
