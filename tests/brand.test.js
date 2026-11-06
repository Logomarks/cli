import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseColor, loadMark, findMark, MarkNotFound, paint, markPng, FONTS, brandFont, brandInput } from '../src/index.js';
import { fontId, fontFiles, UPSTREAM } from '../src/brand/fonts.js';
import { fixturePath, pngSize } from './helpers.js';

test('colours parse', () => {
	assert.equal(parseColor('#f50'), '#FF5500');
	assert.equal(parseColor('2e4bff'), '#2E4BFF');
	assert.equal(parseColor('white'), '#FFFFFF');
	assert.equal(parseColor('red'), null);
});

test('marks load by slug, by name or from a file, and a miss suggests', () => {
	assert.equal(loadMark('hex-gem').name, 'Hex Gem');
	assert.equal(loadMark('Hex Gem').slug, 'hex-gem');
	assert.equal(findMark('HEX GEM')?.slug, 'hex-gem');
	const file = loadMark(fixturePath('off-grid'));
	assert.equal(file.live, false);
	assert.match(file.svg, /viewBox="0 0 512 512"/);
	assert.throws(() => loadMark('hexgem'), (e) => e instanceof MarkNotFound && e.suggestions.includes('hex-gem'));
	assert.match(paint(loadMark('hex-gem').svg, '#FF5C3A'), /^<svg[^>]+fill="#FF5C3A"/);
});

test('fonts: every bundled face is OFL and resolves by id or name', () => {
	const licence = fs.readFileSync(new URL('../data/fonts/OFL.txt', import.meta.url), 'utf8');
	/** The faces whose copyright isn't held by "The <name> Project Authors". */
	const holders = { 'IBM Plex Mono': 'IBM Corp', Cagliostro: 'Matthew Desmond', Limelight: 'Sorkin Type Co', Shrikhand: 'Jonny Pinhorn' };
	for (const [id, f] of Object.entries(FONTS)) {
		assert.ok(fs.existsSync(new URL(`../data/fonts/${f.file}`, import.meta.url)), f.file);
		const holder = holders[/** @type {keyof typeof holders} */ (f.name)] ?? `The ${f.name} Project Authors`;
		assert.ok(licence.includes(holder), `${f.name}'s copyright in OFL.txt`);
		assert.equal(fontId(id), id);
		assert.equal(fontId(f.name), id);
	}
	assert.match(licence, /SIL OPEN FONT LICENSE Version 1\.1/);
	assert.equal(fontId('Comic Sans'), null);
});

test('a face with a Reserved Font Name is bundled whole, byte for byte as pinned', () => {
	const licence = fs.readFileSync(new URL('../data/fonts/OFL.txt', import.meta.url), 'utf8');
	const reserved = [...licence.matchAll(/Reserved Font Name "?([^".\n]+)"?/g)].map((m) => m[1]);
	assert.deepEqual(reserved, ['Cagliostro', 'Limelight', 'Plex']);
	const files = fontFiles().map((u) => path.basename(u.pathname));
	for (const name of reserved) {
		const named = files.filter((f) => f.includes(name));
		assert.ok(named.length, name);
		for (const f of named) assert.ok(f in UPSTREAM, `${f} carries "${name}", so it must be bundled whole`);
	}
	for (const [file, pin] of Object.entries(UPSTREAM)) {
		const bytes = fs.readFileSync(new URL(`../data/fonts/${file}`, import.meta.url));
		assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), pin.sha256, file);
	}
});

test('every bundled file is named in its face\'s family, so an SVG finds it', () => {
	/** A font's family names (name ids 1 and 16, Windows platform). */
	const families = (/** @type {Buffer} */ buf) => {
		const at = [...Array(buf.readUInt16BE(4)).keys()].map((i) => 12 + i * 16).find((e) => buf.toString('latin1', e, e + 4) === 'name');
		const off = buf.readUInt32BE(/** @type {number} */ (at) + 8), strings = off + buf.readUInt16BE(off + 4);
		return [...Array(buf.readUInt16BE(off + 2)).keys()]
			.map((j) => off + 6 + j * 12)
			.filter((r) => buf.readUInt16BE(r) === 3 && [1, 16].includes(buf.readUInt16BE(r + 6)))
			.map((r) => buf.subarray(strings + buf.readUInt16BE(r + 10), strings + buf.readUInt16BE(r + 10) + buf.readUInt16BE(r + 8)).swap16().toString('utf16le'));
	};
	for (const f of Object.values(FONTS)) assert.ok(families(fs.readFileSync(new URL(`../data/fonts/${f.file}`, import.meta.url))).includes(f.family), f.family);
});

test('a bundled face goes to brand-kit as its bytes, weight and tracking', () => {
	const f = brandFont('instrument-serif');
	assert.equal(f.name, 'Instrument Serif');
	assert.equal(f.weight, 400);
	assert.equal(f.tracking, -0.01);
	assert.equal(new TextDecoder().decode(f.data.subarray(0, 4)), '\0\x01\0\0');
	assert.equal(brandFont().name, 'Inter');
});

test('a brand credits a live mark (CC0) and not a file', () => {
	const live = brandInput({ mark: loadMark('hex-gem'), name: ' Hexa ', color: '#FF5C3A' });
	assert.equal(live.name, 'Hexa');
	assert.deepEqual(live.source, { name: 'Hex Gem', url: 'https://logomarks.ai/marks/hex-gem', license: 'CC0-1.0' });
	const file = brandInput({ mark: loadMark(fixturePath('off-grid')) });
	assert.equal(file.name, 'Off Grid');
	assert.equal(file.source, undefined);
});

test('a mark drawn to a PNG on a ground', async () => {
	const png = await markPng(loadMark('hex-gem').svg, { size: 48, color: '#000', ground: '#fff', pad: 0.1 });
	assert.deepEqual(pngSize(png), { width: 48, height: 48 });
});
