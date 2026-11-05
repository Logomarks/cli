/**
 * @module logomarks/brand/brand
 *
 * A brand as `@arraypress/brand-kit` takes it, from what the CLI and the MCP
 * tools are given: a mark (live or a file), a name, a colour, a bundled
 * face, and the words for social images. A live mark is credited, CC0.
 */

import { brandFont } from './fonts.js';
import { MARK_URL } from './mark.js';

/**
 * The brand-kit inputs.
 *
 * @param {import('./brand.js').BrandOptions} o The mark, name, colour, face and words.
 * @returns {import('@arraypress/brand-kit').BrandInput} The inputs.
 */
export function brandInput({ mark, name, color, font, tagline, url, handle }) {
	return {
		svg: mark.svg,
		name: name?.trim() || mark.name,
		color,
		font: brandFont(font),
		tagline,
		url,
		handle,
		...(mark.live && { source: { name: mark.name, url: MARK_URL + mark.slug, license: 'CC0-1.0' } }),
	};
}
