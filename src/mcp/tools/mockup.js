/**
 * @module logomarks/mcp/tools/mockup
 *
 * `mockup`: the brand on a 2D object, as an image; written to a file when
 * asked.
 */

import { z } from 'zod';
import { mockup, OBJECTS, DEFAULT_SIZE } from '../../mockup/index.js';
import { writeFile } from '../../util/files.js';
import { schema, readMark, readColor, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';
import { preview, PREVIEW } from '../preview.js';


/** Each object with its layouts, for the description. */
const objects = Object.entries(OBJECTS).map(([k, o]) => (o.layouts ? `${k} (${o.layouts.join('/')})` : k)).join(', ');

/** @type {import('../index.js').Tool<import('./mockup.js').MockupInput>} */
export const tool = {
	name: 'mockup',
	title: 'Brand mockup',
	description: [
		'Put a brand (a mark, its name and colour) on a 2D object and return the image.',
		'Garments, mugs and bags carry the mark; full-bleed prints carry the lockup on the brand colour.',
		`Objects, with their layouts (the first is the default): ${objects}.`,
		`Returns a preview up to ${PREVIEW} px; pass out to write the full-size file (.png, or .svg for the layered SVG).`,
	].join(' '),
	inputSchema: {
		mark: schema.mark,
		object: z.enum(/** @type {[string, ...string[]]} */ (Object.keys(OBJECTS))).describe('The object.'),
		name: schema.name,
		color: schema.color,
		font: schema.font,
		layout: z.string().optional().describe("One of the object's layouts (see the description)."),
		surface: z.string().optional().describe('What it lies on: oak, concrete, linen, paper, light, dark, or hex.'),
		view: z.enum(['front', 'angle']).optional().describe("A screen's or a sign's view."),
		base: z.string().optional().describe("The object's own colour: a garment, mug or bag (white, black, navy, or hex), a box's board, a device's finish."),
		size: z.number().int().min(200).max(4000).optional().describe(`The written file's longest side in pixels. Default ${DEFAULT_SIZE}.`),
		seed: schema.seed,
		out: z.string().optional().describe('Also write it here: .png, or .svg for the layered SVG. Relative to the working folder.'),
	},
	annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
	async run({ mark: ref, object, name, color, font, layout, surface, view, base, size = DEFAULT_SIZE, seed, out }, { cwd }) {
		const mark = readMark(ref, cwd);
		const file = out && resolvePath(cwd, out);
		const m = await mockup({ mark, object, name: name?.trim() || undefined, color: readColor(color), font: /** @type {import('../../brand/fonts.js').FontId | undefined} */ (font), layout, surface, view, base, size: file ? size : PREVIEW, seed });
		if (file) writeFile(file, file.toLowerCase().endsWith('.svg') ? m.svg : m.png);
		return result(text({ object, ...(file && { file, width: m.width, height: m.height }) }), image(await preview(m)));
	},
};
