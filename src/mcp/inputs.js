/**
 * @module logomarks/mcp/inputs
 *
 * The inputs the tools share: their schemas (zod, which the server turns
 * into JSON Schema for the caller), and reading them: a mark, a colour, the
 * marks to check, the mark an edit starts from, and where to write. Relative paths resolve against the
 * server's working folder (the project the agent is in).
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { fitMark } from '@arraypress/marks-kit/fit';
import { PLATFORMS, STYLE_IDS } from '@arraypress/brand-kit';
import { loadMark } from '../brand/mark.js';
import { parseColor } from '../util/color.js';
import { FONTS } from '../brand/fonts.js';
import { expandSvgs, slugOf } from '../util/files.js';

/** The schemas the tools share. */
export const schema = {
	mark: z.string().min(1).describe('The mark: a live slug ("hex-gem") or name ("Hex Gem") from find_marks, or the path to your own .svg file (fitted to the 512 grid first).'),
	color: z.string().optional().describe('The brand colour as hex, e.g. "#ff5c3a". Defaults to the Logomarks yellow.'),
	font: z.enum(/** @type {[string, ...string[]]} */ (Object.keys(FONTS))).optional().describe('The typeface for the brand name (all SIL OFL). Defaults to inter.'),
	name: z.string().optional().describe("The brand's name, set beside the mark. Defaults to the mark's name."),
	svg: z.string().optional().describe('One mark as SVG text. Use this or paths.'),
	svgName: z.string().optional().describe('A name for the svg (its slug), shown in the results. Defaults to "mark".'),
	paths: z.array(z.string()).optional().describe('.svg files or folders of them (not recursive). Use this or svg.'),
	ignore: z.array(z.string()).optional().describe('Finding ids to leave out, e.g. ["uneven-gaps"].'),
	strict: z.boolean().optional().describe('Count warnings as failures too. Default false.'),
	seed: z.string().optional().describe('Drives every random choice; the same seed gives the same image. Defaults to the mark\'s slug.'),
	source: z.string().optional().describe('The mark: a live slug or name, or the path to an .svg file. Use this or svg.'),
	sourceSvg: z.string().optional().describe('The mark as SVG text (fitted to the 512 grid first). Use this or mark.'),
	out: z.string().optional().describe('Also write the result here (.svg). Relative to the working folder.'),
	tagline: z.string().optional().describe('A short line under the name on social images and the brand sheet.'),
	url: z.string().optional().describe("The brand's website, for the brand sheet and the email signature."),
	handle: z.string().optional().describe('The social handle, e.g. "@hexalabs". Defaults to @ and the name.'),
	platforms: z.array(z.string()).optional().describe(`Social images by id or platform name (default every one): ${Object.keys(PLATFORMS).join(', ')}; or ${[...new Set(Object.values(PLATFORMS).map((p) => p.platform))].join(', ')}.`),
	styles: z.array(z.enum(/** @type {[import('@arraypress/brand-kit').StyleId, ...import('@arraypress/brand-kit').StyleId[]]} */ ([...STYLE_IDS]))).optional().describe('minimal (the logo on paper), bold (the brand colour edge to edge, the mark cropped large), pattern (the mark repeated). Default all three.'),
	animated: z.boolean().optional().describe('Also write animated SVGs for avatars, stories and banners. Default false.'),
};

/**
 * A path, resolved against the working folder.
 *
 * @param {string} cwd The working folder.
 * @param {string} p The path.
 * @returns {string} The absolute path.
 */
export const resolvePath = (cwd, p) => path.resolve(cwd, p);

/**
 * A mark by slug, name or file (a relative file resolved against the working folder).
 *
 * @param {string} ref The reference.
 * @param {string} cwd The working folder.
 * @returns {import('../brand/mark.js').Mark} The mark.
 * @throws {import('../brand/mark.js').MarkNotFound} When it is neither.
 */
export function readMark(ref, cwd) {
	const file = resolvePath(cwd, ref);
	return loadMark(fs.existsSync(file) ? file : ref);
}

/**
 * A colour input.
 *
 * @param {string | undefined} value The value.
 * @returns {string | undefined} `#RRGGBB`, or undefined when it wasn't given.
 * @throws {Error} When it isn't a colour.
 */
export function readColor(value) {
	if (value === undefined) return undefined;
	const hex = parseColor(value);
	if (!hex) throw new Error(`color takes a hex colour such as "#ff5c3a", not "${value}"`);
	return hex;
}

/**
 * The marks a check names: one as SVG text, or files and folders.
 *
 * @param {{ svg?: string, svgName?: string, paths?: string[] }} input The inputs.
 * @param {string} cwd The working folder.
 * @returns {import('./inputs.js').SvgInput[]} Each mark's name, file (absolute; none for text) and SVG.
 * @throws {Error} When neither or both are given, a path is missing, or a folder has no SVGs.
 */
export function readSvgs({ svg, svgName, paths }, cwd) {
	if (svg !== undefined && paths?.length) throw new Error('pass svg or paths, not both');
	if (svg !== undefined) return [{ name: svgName?.trim() || 'mark', svg }];
	if (!paths?.length) throw new Error('pass svg (the SVG text) or paths (.svg files or folders)');
	const files = expandSvgs(paths.map((p) => resolvePath(cwd, p)));
	if (!files.length) throw new Error(`no .svg files in ${paths.join(', ')}`);
	return files.map((file) => ({ name: slugOf(file), file, svg: fs.readFileSync(file, 'utf8') }));
}

/**
 * A mark as SVG from a live slug or name, an .svg path, or SVG text (fitted to the grid).
 *
 * @param {string} ref The reference, or the SVG itself.
 * @param {string} cwd The working folder.
 * @returns {{ name: string, svg: string }} Its name and SVG.
 * @throws {import('../brand/mark.js').MarkNotFound} When it is none of them.
 */
export function readAnyMark(ref, cwd) {
	if (ref.trimStart().startsWith('<')) return { name: 'mark', svg: fitMark(ref).svg };
	const m = readMark(ref, cwd);
	return { name: m.slug, svg: m.svg };
}

/**
 * The mark an edit starts from: a live mark or file (`mark`), or SVG text (`svg`).
 *
 * @param {{ mark?: string, svg?: string }} input The inputs.
 * @param {string} cwd The working folder.
 * @returns {{ name: string, svg: string }} Its name and SVG, fitted.
 * @throws {Error} When neither or both are given.
 */
export function readSource({ mark, svg }, cwd) {
	if (mark !== undefined && svg !== undefined) throw new Error('pass mark or svg, not both');
	if (mark === undefined && svg === undefined) throw new Error('pass mark (a live slug or name, or an .svg path) or svg (the SVG text)');
	return mark !== undefined ? readAnyMark(mark, cwd) : { name: 'mark', svg: fitMark(/** @type {string} */ (svg)).svg };
}
