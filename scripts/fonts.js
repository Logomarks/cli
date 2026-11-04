#!/usr/bin/env node
/**
 * Writes the sheet's typeface: IBM Plex Mono (SIL OFL 1.1), latin, regular
 * and semibold, from @fontsource WOFF files to plain TrueType, which resvg
 * reads. Run once; the TTFs are committed in `data/fonts/`.
 *
 *   node scripts/fonts.js <@fontsource/ibm-plex-mono folder>
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const WEIGHTS = { Regular: 400, SemiBold: 600 };

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
	console.log('Usage: node scripts/fonts.js <path to @fontsource/ibm-plex-mono>');
	process.exit(2);
}
const out = new URL('../data/fonts/', import.meta.url);
fs.mkdirSync(out, { recursive: true });
for (const [name, weight] of Object.entries(WEIGHTS)) {
	const ttf = woffToSfnt(fs.readFileSync(path.join(src, 'files', `ibm-plex-mono-latin-${weight}-normal.woff`)));
	fs.writeFileSync(new URL(`IBMPlexMono-${name}.ttf`, out), ttf);
	console.log(`IBMPlexMono-${name}.ttf`, ttf.length, 'bytes');
}
