/**
 * @module logomarks/raster/render
 *
 * SVG to pixels with resvg compiled to WebAssembly: the same engine (and
 * version) as the internal tools' `@resvg/resvg-js`, with no native
 * binaries. The module is initialised once, on first use; text uses the
 * bundled typefaces (IBM Plex Mono unless an SVG names another).
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { fontFiles, LABEL_FONT } from '../brand/fonts.js';

const require = createRequire(import.meta.url);

/** @type {Promise<void> | null} */
let ready = null;
/** @type {Uint8Array[] | null} */
let fonts = null;

/**
 * Loads the WebAssembly module (once).
 *
 * @returns {Promise<void>} Resolves when rendering is ready.
 */
export function initRenderer() {
	ready ??= initWasm(fs.readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm')));
	return ready;
}

/**
 * The bundled typefaces' bytes (read once).
 *
 * @returns {Uint8Array[]} One per file.
 */
const bundledFonts = () => (fonts ??= fontFiles().map((u) => new Uint8Array(fs.readFileSync(u))));

/**
 * Loads the WebAssembly module and reads the typefaces now, so the first
 * render of a long-lived process (the MCP server) is as quick as the rest.
 *
 * @returns {Promise<void>} Resolves when both are ready.
 */
export async function warmRenderer() {
	bundledFonts();
	await initRenderer();
}

/**
 * resvg's font options: the bundled typefaces, or none.
 *
 * @param {boolean} text Whether the SVG has text.
 * @returns {import('@resvg/resvg-wasm').ResvgRenderOptions['font']} The options.
 */
function fontOptions(text) {
	if (!text) return { loadSystemFonts: false };
	return { fontBuffers: bundledFonts(), defaultFontFamily: LABEL_FONT, monospaceFamily: LABEL_FONT };
}

/**
 * Renders an SVG.
 *
 * @param {string} svg The SVG's text.
 * @param {import('./render.js').RenderOptions} [o] Size, text and output.
 * @returns {Promise<import('./render.js').Rendered>} Its pixels (and PNG bytes, when asked).
 */
export async function render(svg, { width, text = false, png = false } = {}) {
	await initRenderer();
	const r = new Resvg(svg, { ...(width && { fitTo: { mode: 'width', value: width } }), font: fontOptions(text) });
	const img = r.render();
	const out = { width: img.width, height: img.height, pixels: img.pixels, ...(png && { png: img.asPng() }) };
	img.free();
	r.free();
	return out;
}

/**
 * An SVG drawn to a PNG: the rasteriser `@logomarks/brand-kit` is handed, so
 * the kit needs no sharp. Its text is already outlines.
 *
 * @param {string} svg The SVG.
 * @param {{ width: number }} size The PNG's width (the height follows the SVG's own shape).
 * @returns {Promise<Uint8Array>} The PNG.
 */
export const rasterize = async (svg, { width }) => /** @type {Uint8Array} */ ((await render(svg, { width, png: true })).png);

/**
 * A mark's alpha channel at a size, filled black (as the tools do: `currentColor` → `#000`).
 *
 * @param {string} svg The mark.
 * @param {number} size The width in pixels.
 * @returns {Promise<Float32Array>} Coverage 0–1, row by row.
 */
export async function coverage(svg, size) {
	const { pixels, width, height } = await render(svg.replace(/fill="currentColor"/g, 'fill="#000"'), { width: size });
	const a = new Float32Array(width * height);
	for (let i = 0; i < a.length; i++) a[i] = pixels[i * 4 + 3] / 255;
	return a;
}
