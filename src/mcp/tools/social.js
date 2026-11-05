/**
 * @module logomarks/mcp/tools/social
 *
 * `social_pack`: every platform image in each style (`@logomarks/brand-kit`),
 * written to a folder, with one image per style to look at.
 */

import path from 'node:path';
import { pngSize } from '@logomarks/brand-kit';
import { social } from '../../kit/index.js';
import { slugify } from '../../brand/mark.js';
import { writeFiles } from '../../util/files.js';
import { schema, readMark, readColor, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';
import { preview, PREVIEW } from '../preview.js';

/**
 * The first image of each style, as a preview to look at.
 *
 * @param {Map<string, string | Uint8Array>} files The pack.
 * @returns {Promise<Uint8Array[]>} One PNG per style.
 */
async function samples(files) {
	const firsts = new Map();
	for (const p of files.keys()) {
		const [style, file] = p.split('/');
		if (file?.endsWith('.png') && !firsts.has(style) && style !== 'email') firsts.set(style, p);
	}
	return Promise.all([...firsts.values()].map((p) => {
		const png = /** @type {Uint8Array} */ (files.get(p));
		return preview({ png, svg: /** @type {string} */ (files.get(p.replace(/\.png$/, '.svg'))), ...pngSize(png) });
	}));
}

/** @type {import('../index.js').Tool<import('./kit.js').BrandToolInput>} */
export const tool = {
	name: 'social_pack',
	title: 'Social pack',
	description: [
		'Draw the brand for every social platform at its current size, the logo kept inside each safe zone, and write it to a folder:',
		'Instagram (post, portrait, story, highlight), LinkedIn, X, YouTube (avatar, banner, thumbnail), Facebook, TikTok, Twitch, Discord, Threads and Bluesky,',
		'each in minimal, bold and pattern styles as <style>/<id>.png and .svg (animated SVGs too with animated), plus an email signature, the Open Graph card and a README of sizes and sources.',
		`Returns the folder’s absolute path and its files, and the first image of each style (a preview up to ${PREVIEW} px).`,
	].join(' '),
	inputSchema: {
		mark: schema.mark,
		name: schema.name,
		color: schema.color,
		font: schema.font,
		tagline: schema.tagline,
		url: schema.url,
		handle: schema.handle,
		platforms: schema.platforms,
		styles: schema.styles,
		animated: schema.animated,
		out: schema.out.describe('The folder to write (made if needed). Default "<name>-social" in the working folder.'),
	},
	annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
	async run({ mark: ref, color, font, out, ...o }, { cwd }) {
		const mark = readMark(ref, cwd);
		const name = o.name?.trim() || mark.name;
		const dir = resolvePath(cwd, out ?? `${slugify(name) || 'brand'}-social`);
		const pack = await social({ ...o, mark, name, color: readColor(color), font: /** @type {import('../../brand/fonts.js').FontId | undefined} */ (font) });
		writeFiles(dir, pack.files);
		const files = [...pack.files.keys()];
		return result(text({ dir, readme: path.join(dir, 'README.md'), count: files.length, files }), ...(await samples(pack.files)).map(image));
	},
};
