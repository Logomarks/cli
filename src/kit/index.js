/**
 * @module logomarks/kit
 *
 * The brand kit and the social pack, from `@logomarks/brand-kit`: the CLI's
 * marks and bundled faces handed in, PNGs drawn by resvg (WebAssembly), so
 * neither needs sharp. Every file comes back in memory, by path.
 */

import { brandKit, socialPack } from '@logomarks/brand-kit';
import { brandInput } from '../brand/brand.js';
import { rasterize } from '../raster/render.js';

/**
 * A brand kit: the mark, favicons, lockups, colours, the brand sheet, `brand.json`, a README and the social pack.
 *
 * @param {import('./index.js').KitOptions} o The brand, and what goes in the social pack.
 * @returns {Promise<import('@logomarks/brand-kit').BrandKit>} The files and `brand.json`'s contents.
 */
export function kit({ styles, platforms, animated = false, social, ...brand }) {
	return brandKit({ ...brandInput(brand), styles, platforms, animated, social, rasterize });
}

/**
 * A social pack: every platform image in each style, the email signature, the Open Graph card and a README.
 *
 * @param {import('./index.js').SocialOptions} o The brand, the images and the styles.
 * @returns {Promise<import('@logomarks/brand-kit').SocialPack>} The files and the brand.
 */
export function social({ styles, platforms, animated = false, ...brand }) {
	return socialPack(brandInput(brand), { styles, platforms, animated, rasterize });
}
