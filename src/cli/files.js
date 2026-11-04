/**
 * @module logomarks/cli/files
 *
 * The SVG files a command was given: files as they are, folders expanded to
 * the `.svg` files in them.
 */

import fs from 'node:fs';
import path from 'node:path';
import { UsageError } from './args.js';

/**
 * Every SVG named, folders expanded (sorted, not recursive).
 *
 * @param {readonly string[]} paths Files and folders.
 * @returns {string[]} The files.
 * @throws {UsageError} When nothing is named or a path is missing.
 */
export function svgFiles(paths) {
	if (!paths.length) throw new UsageError('name at least one .svg file or folder');
	return paths.flatMap((p) => {
		if (!fs.existsSync(p)) throw new UsageError(`no such file: ${p}`);
		if (!fs.statSync(p).isDirectory()) return [p];
		return fs.readdirSync(p).filter((f) => f.endsWith('.svg')).sort().map((f) => path.join(p, f));
	});
}

/**
 * A mark's name from its file: the slug.
 *
 * @param {string} file The file.
 * @returns {string} Its name without the folder and `.svg`.
 */
export const slugOf = (file) => path.basename(file).replace(/\.svg$/i, '');
