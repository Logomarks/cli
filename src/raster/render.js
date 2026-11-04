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
 * resvg's font options: the bundled typefaces, or none.
 *
 * @param {boolean} text Whether the SVG has text.
 * @returns {import('@resvg/resvg-wasm').ResvgRenderOptions['font']} The options.
 */
function fontOptions(text) {
	if (!text) return { loadSystemFonts: false };
	fonts ??= fontFiles().map((u) => new Uint8Array(fs.readFileSync(u)));
	return { fontBuffers: fonts, defaultFontFamily: LABEL_FONT, monospaceFamily: LABEL_FONT };
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
 * An SVG with its text set as outlines (resvg's own tree, written back out),
 * and the box round what it draws.
 *
 * @param {string} svg The SVG, with `<text>` in the bundled typefaces.
 * @returns {Promise<import('./render.js').Outlined>} The outlined SVG and its box (null when it draws nothing).
 */
export async function outline(svg) {
	await initRenderer();
	const r = new Resvg(svg, { font: fontOptions(true) });
	const out = r.toString();
	const b = r.getBBox();
	const box = b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
	b?.free();
	r.free();
	return { svg: out, box };
}

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
