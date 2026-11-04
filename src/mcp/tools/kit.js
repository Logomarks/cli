/**
 * @module logomarks/mcp/tools/kit
 *
 * `brand_kit`: a free brand starter kit, written to a folder, with its
 * brand sheet to look at.
 */

import path from 'node:path';
import { z } from 'zod';
import { kit } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { writeFile } from '../../util/files.js';
import { schema, readMark, readColor, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';

/** @type {import('../index.js').Tool<import('./kit.js').KitInput>} */
export const tool = {
	name: 'brand_kit',
	title: 'Brand starter kit',
	description: [
		'Build a free brand starter kit on a mark and write it to a folder:',
		'mark/ (SVG; PNG at 16 to 1024, on light and dark), favicon/ (.ico, favicon.svg, apple-touch-icon.png, app icons, site.webmanifest),',
		'lockup/ (horizontal and stacked, the name as outlines), colors/palette.css (a 50–950 scale; text colours that clear AA),',
		'social/ (avatar, X header, OG image), brand.json (the <head> lines for the favicons are in head) and brand-sheet.png.',
		'Returns the folder\'s absolute path, the brand (colours, font, files) and the brand sheet as an image: look at it before handing the kit over.',
	].join(' '),
	inputSchema: {
		mark: schema.mark,
		name: schema.name,
		color: schema.color,
		font: schema.font,
		out: z.string().optional().describe('The folder to write (made if needed; files in it are overwritten). Default "<name>-kit" in the working folder.'),
	},
	annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
	async run({ mark: ref, name: given, color, font, out }, { cwd }) {
		const mark = readMark(ref, cwd);
		const name = given?.trim() || mark.name;
		const dir = resolvePath(cwd, out ?? `${slugify(name) || 'brand'}-kit`);
		const k = await kit({ mark, name, color: readColor(color), font: /** @type {import('../../brand/fonts.js').FontId | undefined} */ (font) });
		for (const f of k.files) writeFile(path.join(dir, f.path), f.data);
		const { files, ...brand } = k.brand;
		return result(text({ dir, sheet: path.join(dir, 'brand-sheet.png'), count: files.length, ...brand, files }), image(k.sheet));
	},
};
