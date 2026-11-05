import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseColor, loadMark, findMark, MarkNotFound, paint, markPng, FONTS, brandFont, brandInput } from '../src/index.js';
import { fontId } from '../src/brand/fonts.js';
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
	for (const [id, f] of Object.entries(FONTS)) {
		assert.ok(fs.existsSync(new URL(`../data/fonts/${f.file}`, import.meta.url)), f.file);
		assert.ok(licence.includes(f.name === 'IBM Plex Mono' ? 'IBM Corp' : `The ${f.name} Project Authors`), `${f.name}'s copyright in OFL.txt`);
		assert.equal(fontId(id), id);
		assert.equal(fontId(f.name), id);
	}
	assert.match(licence, /SIL OPEN FONT LICENSE Version 1\.1/);
	assert.equal(fontId('Comic Sans'), null);
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
