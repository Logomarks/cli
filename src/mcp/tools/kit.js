/**
 * @module logomarks/mcp/tools/kit
 *
 * `build_brand_kit`: the brand kit (`@logomarks/brand-kit`) written to a folder,
 * with its brand sheet to look at.
 */

import path from 'node:path';
import { z } from 'zod';
import { kit } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { writeFiles } from '../../util/files.js';
import { schema, readMark, readColor, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';

/** @type {import('../index.js').Tool<import('./kit.js').KitInput>} */
export const tool = {
	name: 'build_brand_kit',
	title: 'Build a brand kit',
	description: [
		'Build a brand kit on a chosen mark and write it to a folder; use it once someone has picked a mark and wants it set up as a brand.',
		'It writes mark/ (SVG on light, dark and colour, and one that follows dark mode; PNG 64 to 2048), favicon/ (.ico, favicon.svg, apple-touch-icon.png, any and maskable icons, site.webmanifest, head.html),',
		'lockup/ (horizontal and stacked on light, dark and colour, the name as outlines), colors/ (palette.css, a Tailwind theme and design tokens: a 50–950 OKLCH scale, text that clears WCAG AA),',
		'social/ (the social pack, as build_social_pack makes it), brand-sheet.png and .svg, brand.json and README.md.',
		'Returns the folder’s absolute path, how many files, brand.json (colours with their contrast, the font, the files) and the brand sheet as an image: look at it before handing the kit over.',
	].join(' '),
	inputSchema: {
		mark: schema.mark,
		name: schema.name,
		color: schema.color,
		font: schema.font,
		tagline: schema.tagline,
		url: schema.url,
		handle: schema.handle,
		styles: schema.styles,
		platforms: schema.platforms,
		animated: schema.animated,
		social: z.boolean().optional().describe('Include the social pack (social/), as build_social_pack makes it. Default true.'),
		out: z.string().optional().describe('The folder to write (made if needed; files in it are overwritten). Default "<name>-kit" in the working folder.'),
	},
	annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
	async run({ mark: ref, color, font, out, ...o }, { cwd }) {
		const mark = readMark(ref, cwd);
		const name = o.name?.trim() || mark.name;
		const dir = resolvePath(cwd, out ?? `${slugify(name) || 'brand'}-kit`);
		const k = await kit({ ...o, mark, name, color: readColor(color), font: /** @type {import('../../brand/fonts.js').FontId | undefined} */ (font) });
		const count = writeFiles(dir, k.files);
		const { files, ...brand } = k.brand;
		return result(text({ dir, sheet: path.join(dir, 'brand-sheet.png'), count, ...brand, files }), image(/** @type {Uint8Array} */ (k.files.get('brand-sheet.png'))));
	},
};
