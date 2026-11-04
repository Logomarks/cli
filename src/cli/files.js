/**
 * @module logomarks/cli/files
 *
 * The SVG files a command was given: files as they are, folders expanded to
 * the `.svg` files in them.
 */

import { UsageError } from './args.js';
import { expandSvgs } from '../util/files.js';

export { slugOf } from '../util/files.js';

/**
 * Every SVG named, folders expanded (sorted, not recursive).
 *
 * @param {readonly string[]} paths Files and folders.
 * @returns {string[]} The files.
 * @throws {UsageError} When nothing is named or a path is missing.
 */
export function svgFiles(paths) {
	if (!paths.length) throw new UsageError('name at least one .svg file or folder');
	try {
		return expandSvgs(paths);
	} catch (e) {
		throw new UsageError(/** @type {Error} */ (e).message);
	}
}
