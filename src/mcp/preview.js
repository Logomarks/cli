/**
 * @module logomarks/mcp/preview
 *
 * The image a tool hands back to look at: no larger than it needs to be.
 * Mockups and covers carry textures and gradients, so a full-size PNG runs
 * to megabytes; the agent gets a preview, and the file gets the full size.
 */

import { render } from '../raster/render.js';

/** The longest side of an image handed back, in pixels. */
export const PREVIEW = 800;

/**
 * An image to hand back: the PNG itself when it is small enough, else the SVG drawn again with its longest side at `PREVIEW`.
 *
 * @param {{ png: Uint8Array, svg: string, width: number, height: number }} img The image and its SVG.
 * @returns {Promise<Uint8Array>} The PNG to return.
 */
export async function preview({ png, svg, width, height }) {
	const longest = Math.max(width, height);
	if (longest <= PREVIEW) return png;
	return /** @type {Uint8Array} */ ((await render(svg, { width: Math.round((width * PREVIEW) / longest), text: true, png: true })).png);
}
