/**
 * @module logomarks/mcp/inputs
 *
 * The inputs the tools share: their schemas (zod, which the server turns
 * into JSON Schema for the caller), and reading them: a mark, a colour, the
 * marks to check, and where to write. Relative paths resolve against the
 * server's working folder (the project the agent is in).
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { loadMark } from '../brand/mark.js';
import { parseColor } from '../brand/color.js';
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
