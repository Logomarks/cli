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
import { FONTS } from '../../brand/fonts.js';
import { STYLE_IDS } from '@logomarks/brand-kit';
import { wrapList } from '../help.js';

/** What `social` takes. */
export const spec = { flags: ['json', 'animated'], options: { out: 'o', name: '', color: '', font: '', tagline: '', url: '', handle: '', styles: '', platforms: '' } };

/** `logomarks social --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: "Draw the brand for every social platform at its size, and write it to a folder.",
	usage: ['<mark> --name "Brand" [-o dir/] [options]'],
	about: [
		'Every platform image with the logo inside its safe zone, in each style, as',
		'<style>/<id>.png and .svg, plus an email signature, the Open Graph card and a README.',
	],
	options: [
		['--name <text>', "The brand's name. Default: the mark's name."],
		['--color <hex>', 'The brand colour, e.g. #ff5c3a. Default #d4ff3a.'],
		['--font <id>', `The typeface for the name (SIL OFL). Default inter.\n${wrapList(Object.keys(FONTS), 48)}.`],
		['--tagline <text>', 'A short line under the name on social images and the brand sheet.'],
		['--url <url>', "The brand's website, for the brand sheet and email signature."],
		['--handle <@name>', 'The social handle. Default: @ and the name.'],
		['--styles <ids>', `Social styles: ${STYLE_IDS.join(', ')}. Default: all.`],
		['--platforms <ids>', 'Social images by id or platform, e.g. instagram,x-header.\nDefault: every one.'],
		['--animated', 'Also write animated SVGs for avatars, stories and banners.'],
		['-o, --out <dir>', 'The folder to write. Default <name>-social.'],
	],
	examples: ['logomarks social hex-gem --name "Hexa Labs" --platforms instagram,linkedin --styles bold', 'logomarks social mark.svg --name Acme --animated -o acme-social/'],
};

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
