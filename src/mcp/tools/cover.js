/**
 * @module logomarks/mcp/tools/cover
 *
 * `render_cover`: a cover or social image with the mark on it, as an image;
 * written to a file when asked.
 */

import { z } from 'zod';
import { cover, RECIPES } from '../../cover/index.js';
import { writeFile } from '../../util/files.js';
import { schema, readMark, readColor, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';
import { preview, PREVIEW } from '../preview.js';

/** Each recipe and what it looks like, for the description. */
const recipes = Object.entries(RECIPES).map(([k, r]) => `${k} (${r.about.replace(/\.$/, '')})`).join('; ');

/** @type {import('../index.js').Tool<import('./cover.js').CoverInput>} */
export const tool = {
	name: 'render_cover',
	title: 'Render a cover image',
	description: [
		'Draw a cover with the mark on it and return the image; use it for an Open Graph image, a blog or launch header, or a square post.',
		`Recipes: ${recipes}.`,
		`Returns a preview up to ${PREVIEW} px; pass out to write the full-size file (.png, or .svg with the text as outlines).`,
	].join(' '),
	inputSchema: {
		mark: schema.mark,
		recipe: z.enum(/** @type {[string, ...string[]]} */ (Object.keys(RECIPES))).optional().describe(`The look: ${Object.keys(RECIPES).join(', ')}. Default mark.`),
		title: z.string().optional().describe('A headline; the mark moves out of its way.'),
		label: z.string().optional().describe('A small line over the title.'),
		color: schema.color,
		aspect: z.string().regex(/^(og|\d+(\.\d+)?(:\d+(\.\d+)?)?)$/, 'og, w:h (16:9) or a number').optional().describe('og (1200×630, the default), 1:1, 16:9, 4:5, 9:16, any w:h, or a number.'),
		width: z.number().int().min(200).max(6000).optional().describe("The written file's width in pixels. Default 1200."),
		seed: schema.seed,
		out: z.string().optional().describe('Also write the full-size file here: .png, or .svg (text as outlines). Relative to the working folder; an existing file is replaced.'),
	},
	annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
	async run({ mark: ref, recipe, title, label, color, aspect, width, seed, out }, { cwd }) {
		const mark = readMark(ref, cwd);
		const file = out && resolvePath(cwd, out);
		const c = await cover({ mark, recipe, title, label, seed, color: readColor(color), aspect: aspect && /^[\d.]+$/.test(aspect) ? Number(aspect) : aspect, width: file ? width : Math.min(width ?? PREVIEW, PREVIEW) });
		if (file) writeFile(file, file.toLowerCase().endsWith('.svg') ? c.svg : c.png);
		return result(text({ recipe: recipe ?? 'mark', ...(file && { file, width: c.width, height: c.height }) }), image(await preview(c)));
	},
};
