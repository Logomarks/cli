/**
 * @module logomarks/util/files
 *
 * Files in and out: the SVGs a list of paths names (folders expanded), a
 * mark's name from its file, and writing a file with its folder made.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Every SVG named, folders expanded (sorted, not recursive).
 *
 * @param {readonly string[]} paths Files and folders.
 * @returns {string[]} The files, as given (or joined to their folder).
 * @throws {Error} When a path is missing.
 */
export function expandSvgs(paths) {
	return paths.flatMap((p) => {
		if (!fs.existsSync(p)) throw new Error(`no such file: ${p}`);
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

/**
 * Writes a file, making its folder.
 *
 * @param {string} file Where.
 * @param {string | Uint8Array} data What.
 */
export function writeFile(file, data) {
	fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
	fs.writeFileSync(file, data);
}
