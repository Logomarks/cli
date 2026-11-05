/**
 * @module logomarks/cli/commands/kit
 *
 * `logomarks kit <slug|file.svg> --name "Brand" -o dir/`: the brand kit
 * (`@logomarks/brand-kit`) written to a folder.
 */

import path from 'node:path';
import { kit } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { brandArgs, packArgs, asUsage, writeFiles } from '../options.js';
import { style } from '../style.js';
import { FONTS } from '../../brand/fonts.js';
import { STYLE_IDS } from '@logomarks/brand-kit';
import { wrapList } from '../help.js';

/** What `kit` takes. */
export const spec = { flags: ['json', 'animated', 'no-social'], options: { out: 'o', name: '', color: '', font: '', tagline: '', url: '', handle: '', styles: '', platforms: '' } };

/** `logomarks kit --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Build a brand kit on a mark and write it to a folder.',
	usage: ['<mark> --name "Brand" [-o dir/] [options]'],
	about: [
		'Writes mark/ (SVG on light, dark and colour; PNG 64–2048), favicon/ (.ico, favicon.svg,',
		'touch and maskable icons, manifest, head.html), lockup/, colors/ (CSS, a Tailwind theme',
		'and tokens: a 50–950 OKLCH scale with WCAG pairings), social/, brand-sheet.png and .svg,',
		'brand.json and README.md. Look at brand-sheet.png before handing the kit over.',
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
		['--no-social', 'Leave the social pack out.'],
		['-o, --out <dir>', 'The folder to write. Default <name>-kit.'],
	],
	examples: ["logomarks kit hex-gem --name \"Hexa Labs\" --color '#ff5c3a' --font space-grotesk -o hexa/", 'logomarks kit mark.svg --name Acme --no-social'],
};

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
