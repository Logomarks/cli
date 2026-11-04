/**
 * @module logomarks/similar/store
 *
 * The bundled index of live marks: each mark's slug, name and SVG, its 48 px
 * coverage (the outline signature before its blur), and for badges and
 * letter marks a letter signature. One brotli-compressed file, built by
 * `npm run index` from the Logomarks data, so `similar` and `sheet` work
 * offline. Layout: a 4-byte JSON length, the JSON (marks and letters), then
 * the signature bytes.
 */

import fs from 'node:fs';
import zlib from 'node:zlib';
import { SIMILAR, LETTERS } from '../rules.js';
import { blur } from './signature.js';

/** Where the bundled index lives. */
export const INDEX_FILE = new URL('../../data/index.bin', import.meta.url);

/** The file format's version. */
const VERSION = 1;

/** Letter signatures are quarters (2×2 supersampling): stored ×4. */
const QUARTERS = 4;

/** @type {Map<string, import('./store.js').MarkIndex>} */
const cache = new Map();

/**
 * Writes an index.
 *
 * @param {import('./store.js').IndexInput} input The marks and their signatures.
 * @param {string | URL} [file] Where (the bundled index).
 * @returns {number} The file's size in bytes.
 */
export function writeIndex({ marks, coverages, letters }, file = INDEX_FILE) {
	const head = Buffer.from(JSON.stringify({
		version: VERSION,
		built: new Date().toISOString().slice(0, 10),
		size: SIMILAR.size,
		letterSize: LETTERS.size,
		marks: marks.map((m) => [m.slug, m.name, m.svg]),
		letters: letters.map((l) => [l.mark, l.kind]),
	}));
	const length = Buffer.alloc(4);
	length.writeUInt32LE(head.length);
	const bytes = (/** @type {ArrayLike<number>} */ a, /** @type {number} */ k) => Uint8Array.from(a, (v) => Math.round(v * k));
	const body = Buffer.concat([length, head, ...coverages.map((c) => bytes(c, 255)), ...letters.map((l) => bytes(l.sig, QUARTERS))]);
	const out = zlib.brotliCompressSync(body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } });
	fs.writeFileSync(file, out);
	return out.length;
}

/**
 * Reads an index (once per file) and blurs its coverages into outline signatures.
 *
 * @param {string | URL} [file] Which (the bundled index).
 * @returns {import('./store.js').MarkIndex} The index.
 * @throws {Error} When the file is missing or from another version.
 */
export function loadIndex(file = INDEX_FILE) {
	const key = String(file);
	const hit = cache.get(key);
	if (hit) return hit;
	const body = zlib.brotliDecompressSync(fs.readFileSync(file));
	const n = body.readUInt32LE(0);
	const raw = JSON.parse(body.toString('utf8', 4, 4 + n));
	if (raw.version !== VERSION) throw new Error(`index version ${raw.version}, expected ${VERSION}: run npm run index`);
	const S = raw.size * raw.size, L = raw.letterSize * raw.letterSize;
	let at = 4 + n;
	const take = (/** @type {number} */ len, /** @type {number} */ k) => {
		const a = Float32Array.from(body.subarray(at, at + len), (v) => v / k);
		at += len;
		return a;
	};
	/** @type {import('./store.js').MarkIndex} */
	const index = {
		built: raw.built,
		marks: raw.marks.map((/** @type {[string, string, string]} */ [slug, name, svg]) => ({ slug, name, svg, outline: blur(take(S, 255), raw.size) })),
		letters: raw.letters.map((/** @type {[number, 'hole' | 'ink']} */ [mark, kind]) => ({ mark, kind, sig: take(L, QUARTERS) })),
	};
	cache.set(key, index);
	return index;
}
