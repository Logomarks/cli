/**
 * @module logomarks/similar/folder
 *
 * An index built on the spot, for comparing against marks that aren't in the
 * bundled one: a folder of SVGs (the site's svg folder while a batch is
 * drawn), or the candidates themselves (each against the others). Names, tags
 * come from a `marks.json` beside the folder when there is one; the letter
 * signatures cover badges (their holes) and letter and number marks (their ink),
 * as the bundled index does.
 */

import fs from 'node:fs';
import path from 'node:path';
import { outlineSignature, letterSignatures } from './signature.js';
import { slugOf } from '../util/files.js';

/** A badge, whose letter is its holes (every family: Badge, Pixel Badge, Stencil Badge …). */
export const isBadge = (/** @type {string} */ slug) => /(^|-)badge-/.test(slug);

/**
 * An index of SVG files.
 *
 * @param {readonly string[]} files The marks' files.
 * @param {import('./folder.js').FolderOptions} [o] Letter signatures too, names and tags by slug, and a tag for each.
 * @returns {Promise<import('./store.js').MarkIndex>} The index (its marks carry only slug, name, svg and outline).
 */
export async function indexOf(files, { letters = false, about = {}, candidate = false } = {}) {
	/** @type {import('./store.js').MarkIndex} */
	const index = { built: new Date().toISOString().slice(0, 10), marks: [], letters: [] };
	for (const file of files) {
		const svg = fs.readFileSync(file, 'utf8');
		const slug = slugOf(file), a = about[slug];
		const i = index.marks.push(/** @type {import('./store.js').IndexedMark} */ ({ slug, name: a?.name ?? slug, svg, outline: await outlineSignature(svg), ...(candidate && { candidate: true }), ...(a && { tags: a.tags }) })) - 1;
		if (!letters) continue;
		const lettery = candidate || a?.tags.includes('letter') || a?.tags.includes('number');
		if (!isBadge(slug) && !lettery) continue;
		const { holes, ink } = await letterSignatures(svg);
		if ((isBadge(slug) || candidate) && holes) index.letters.push({ mark: i, kind: 'hole', sig: holes });
		else if (lettery && !candidate) index.letters.push({ mark: i, kind: 'ink', sig: ink });
	}
	return index;
}

/**
 * An index of every SVG in a folder, named from the `marks.json` beside it when there is one.
 *
 * @param {string} dir The folder.
 * @param {{ letters?: boolean }} [o] Letter signatures too.
 * @returns {Promise<import('./store.js').MarkIndex>} The index.
 */
export async function folderIndex(dir, { letters = false } = {}) {
	const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).sort().map((f) => path.join(dir, f));
	const list = path.join(dir, '..', 'marks.json');
	/** @type {Record<string, { name: string, tags: string[] }>} */
	const about = fs.existsSync(list) ? Object.fromEntries(JSON.parse(fs.readFileSync(list, 'utf8')).map((/** @type {{ slug: string, name: string, tags: string[] }} */ m) => [m.slug, m])) : {};
	return indexOf(files, { letters, about });
}

/**
 * Two indexes as one (the second's letters renumbered).
 *
 * @param {import('./store.js').MarkIndex} a The first.
 * @param {import('./store.js').MarkIndex} b The second.
 * @returns {import('./store.js').MarkIndex} Both.
 */
export const joinIndexes = (a, b) => ({ built: a.built, marks: [...a.marks, ...b.marks], letters: [...a.letters, ...b.letters.map((l) => ({ ...l, mark: l.mark + a.marks.length }))] });
