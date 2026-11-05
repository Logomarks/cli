/**
 * @module logomarks/mcp/tools/get
 *
 * `get_mark`: a mark's SVG, painted in a colour, or a PNG to look at; and
 * written to a file when asked.
 */

import { z } from 'zod';
import { paint, markPng, MARK_URL } from '../../brand/mark.js';
import { writeFile } from '../../util/files.js';
import { schema, readMark, readColor, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';

/** A PNG's side when a .png is written without one. */
const PNG_SIZE = 512;

/** @type {import('../index.js').Tool<import('./get.js').GetInput>} */
export const tool = {
	name: 'get_mark',
	title: 'Get a mark',
	description: [
		'Get a mark to use: a live Logomark by slug or name (CC0, free to use), or your own .svg fitted to the 512 grid.',
		'The SVG is 512×512, longest side 448, centred, filled paths in currentColor (or in color, when given).',
		'Pass size to also get a PNG image to look at. Pass out to write the file (.svg, or .png at size, default 512); the result then gives its path instead of the SVG text.',
		'Returns { slug, name, url, licence, color, svg | file }.',
	].join(' '),
	inputSchema: {
		mark: schema.mark,
		color: z.string().optional().describe('Paint it in this hex colour, e.g. "#ff5c3a". Default: currentColor (the SVG) or black (a PNG).'),
		size: z.number().int().min(16).max(4096).optional().describe('Also return a PNG this many pixels square (16–4096), to look at. Default: none.'),
		out: z.string().optional().describe('Write the mark here: .svg, or .png (at size, default 512). Relative to the working folder; an existing file is replaced.'),
	},
	annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
	async run({ mark: ref, color: c, size, out }, { cwd }) {
		const mark = readMark(ref, cwd);
		const color = readColor(c);
		const svg = paint(mark.svg, color);
		const png = size || out?.toLowerCase().endsWith('.png') ? await markPng(mark.svg, { size: size ?? PNG_SIZE, color: color ?? '#000000' }) : null;
		const file = out && resolvePath(cwd, out);
		if (file) writeFile(file, file.toLowerCase().endsWith('.png') ? /** @type {Uint8Array} */ (png) : svg);
		const about = { slug: mark.slug, name: mark.name, ...(mark.live ? { url: MARK_URL + mark.slug, licence: 'CC0-1.0' } : { live: false }), color: color ?? 'currentColor', ...(file && { file }) };
		return result(text(file ? about : { ...about, svg }), ...(png && size ? [image(png)] : []));
	},
};
