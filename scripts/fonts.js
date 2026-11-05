#!/usr/bin/env node
/**
 * Writes the bundled typefaces (all SIL OFL 1.1) as plain TrueType, which
 * resvg reads, and one `OFL.txt` with every family's copyright and the
 * licence. Run once; the TTFs are committed in `data/fonts/`.
 *
 *   node scripts/fonts.js <a node_modules folder holding @fontsource/*>
 *
 * Most are Fontsource's latin subsets, unwrapped from WOFF: inter,
 * space-grotesk, instrument-sans, bricolage-grotesque, instrument-serif,
 * fraunces and shrikhand (`npm pack` them; nothing runs). The faces with a
 * Reserved Font Name (UPSTREAM in `src/brand/fonts.js`: Cagliostro, Limelight,
 * IBM Plex Mono) are fetched whole from google/fonts at a pinned commit, and
 * each must match its sha256.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { FONTS, UPSTREAM } from '../src/brand/fonts.js';

/** The @fontsource package a family comes from. */
const pkgOf = (/** @type {string} */ name) => name.toLowerCase().replace(/\s+/g, '-');

/** Each file to write: the brand faces, and Plex Mono regular for labels. */
const JOBS = [
	...Object.values(FONTS).map((f) => ({ file: f.file, pkg: pkgOf(f.name), weight: f.weight })),
	{ file: 'IBMPlexMono-Regular.ttf', pkg: 'ibm-plex-mono', weight: 400 },
];

/**
 * A WOFF 1.0 file as an sfnt: the tables inflated and laid out with a fresh directory.
 *
 * @param {Buffer} woff The WOFF bytes.
 * @returns {Buffer} The TrueType bytes.
 */
function woffToSfnt(woff) {
	if (woff.toString('latin1', 0, 4) !== 'wOFF') throw new Error('not a WOFF 1.0 file');
	const flavor = woff.readUInt32BE(4), count = woff.readUInt16BE(12);
	const tables = [];
	for (let i = 0; i < count; i++) {
		const e = 44 + i * 20;
		const tag = woff.toString('latin1', e, e + 4), offset = woff.readUInt32BE(e + 4), comp = woff.readUInt32BE(e + 8);
		const orig = woff.readUInt32BE(e + 12), checksum = woff.readUInt32BE(e + 16);
		const raw = woff.subarray(offset, offset + comp);
		tables.push({ tag, checksum, data: comp < orig ? zlib.inflateSync(raw) : raw });
	}
	const power = 2 ** Math.floor(Math.log2(count));
	const head = Buffer.alloc(12 + count * 16);
	head.writeUInt32BE(flavor, 0);
	head.writeUInt16BE(count, 4);
	head.writeUInt16BE(power * 16, 6);
	head.writeUInt16BE(Math.log2(power), 8);
	head.writeUInt16BE(count * 16 - power * 16, 10);
	const body = [];
	let at = head.length;
	tables.forEach((t, i) => {
		const e = 12 + i * 16;
		head.write(t.tag, e, 'latin1');
		head.writeUInt32BE(t.checksum, e + 4);
		head.writeUInt32BE(at, e + 8);
		head.writeUInt32BE(t.data.length, e + 12);
		const padded = Buffer.alloc(Math.ceil(t.data.length / 4) * 4);
		t.data.copy(padded);
		body.push(padded);
		at += padded.length;
	});
	return Buffer.concat([head, ...body]);
}

const src = process.argv[2];
if (!src) {
	console.log('Usage: node scripts/fonts.js <a node_modules folder holding @fontsource/*>');
	process.exit(2);
}
const out = new URL('../data/fonts/', import.meta.url);
fs.mkdirSync(out, { recursive: true });

/**
 * A pinned upstream file, checked against its sha256, and the `OFL.txt` beside it.
 *
 * @param {{ url: string, sha256: string }} pin Where it is, and its hash.
 * @returns {Promise<{ ttf: Buffer, licence: string }>} The file, byte for byte, and its licence.
 */
async function upstream(pin) {
	const get = async (/** @type {string} */ url) => {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`${url}: ${res.status}`);
		return Buffer.from(await res.arrayBuffer());
	};
	const ttf = await get(pin.url);
	const sha = crypto.createHash('sha256').update(ttf).digest('hex');
	if (sha !== pin.sha256) throw new Error(`${pin.url}: sha256 ${sha}, pinned ${pin.sha256}`);
	return { ttf, licence: (await get(pin.url.replace(/[^/]+$/, 'OFL.txt'))).toString('utf8') };
}

/**
 * A Fontsource latin subset as TrueType, and its licence.
 *
 * @param {string} pkg The @fontsource package.
 * @param {number} weight The weight.
 * @returns {{ ttf: Buffer, licence: string }} The file and its licence.
 */
function subset(pkg, weight) {
	const dir = path.join(src, '@fontsource', pkg);
	const ttf = woffToSfnt(fs.readFileSync(path.join(dir, 'files', `${pkg}-latin-${weight}-normal.woff`)));
	return { ttf, licence: fs.readFileSync(path.join(dir, 'LICENSE'), 'utf8') };
}

/** @type {Map<string, string>} */
const notices = new Map();
let licence = '';
for (const { file, pkg, weight } of JOBS) {
	const pin = UPSTREAM[/** @type {keyof typeof UPSTREAM} */ (file)];
	const face = pin ? await upstream(pin) : subset(pkg, weight);
	fs.writeFileSync(new URL(file, out), face.ttf);
	console.log(file, face.ttf.length, 'bytes', pin ? '(upstream, sha256 ok)' : '(latin subset)');
	const at = face.licence.indexOf('This Font Software is licensed');
	if (at < 0) throw new Error(`${pkg}: not the SIL Open Font License`);
	notices.set(pkg, face.licence.slice(0, at).trim());
	licence ||= face.licence.slice(at);
}
fs.writeFileSync(new URL('OFL.txt', out), `${[...notices.values()].join('\n')}\n\n${licence}`);
console.log('OFL.txt:', [...notices.keys()].join(', '));
