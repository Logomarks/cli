import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { palette, parseColor, contrast, loadMark, findMark, MarkNotFound, paint, lockup, FONTS } from '../src/index.js';
import { toOklch, AA, GRAPHIC } from '../src/brand/color.js';
import { fontId } from '../src/brand/fonts.js';
import { ico } from '../src/brand/ico.js';
import { typeset } from '../src/brand/type.js';
import { markPng } from '../src/brand/mark.js';
import { fixturePath, pngSize } from './helpers.js';

test('colours parse, and contrast is WCAG’s', () => {
	assert.equal(parseColor('#f50'), '#FF5500');
	assert.equal(parseColor('2e4bff'), '#2E4BFF');
	assert.equal(parseColor('white'), '#FFFFFF');
	assert.equal(parseColor('red'), null);
	assert.equal(contrast('#000000', '#FFFFFF'), 21);
	assert.equal(contrast('#777777', '#777777'), 1);
});

test('a palette keeps its hue and its text colours clear AA', () => {
	for (const hex of ['#FF5C3A', '#D4FF3A', '#2E4BFF', '#000000', '#FFFFFF', '#888888']) {
		const p = palette(hex);
		const L = Object.values(p.scale).map((c) => toOklch(c)[0]);
		assert.ok(L.every((l, i) => i === 0 || l < L[i - 1]), `${hex}: the scale darkens step by step`);
		assert.ok(contrast(p.primary, p.onPrimary) >= GRAPHIC, `${hex}: text on the brand colour`);
		assert.ok(contrast(p.text.primaryOnLight, p.paper) >= AA, `${hex}: brand text on paper`);
		assert.ok(contrast(p.text.primaryOnDark, p.ink) >= AA, `${hex}: brand text on ink`);
		assert.ok(contrast(p.mark.onLight, p.paper) >= GRAPHIC && contrast(p.mark.onDark, p.ink) >= GRAPHIC, `${hex}: the mark on both grounds`);
	}
	const blue = toOklch(palette('#2E4BFF').scale['300'])[2];
	assert.ok(Math.abs(blue - toOklch('#2E4BFF')[2]) < 8);
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

test('typeset sets outlines in the face asked for', async () => {
	const inter = await typeset('Hexa', 'inter');
	const serif = await typeset('Hexa', 'instrument-serif');
	assert.match(inter.paths, /<path d="M/);
	assert.ok(inter.box.w > 150 && inter.box.w < 300);
	assert.ok(inter.cap > 60 && inter.cap < 80);
	assert.notEqual(inter.box.w.toFixed(1), serif.box.w.toFixed(1));
});

test('every bundled file is named in its face\'s family, so an SVG finds it', () => {
	/** A font's family names (name id 1, Windows platform). */
	const families = (/** @type {Buffer} */ buf) => {
		const at = [...Array(buf.readUInt16BE(4)).keys()].map((i) => 12 + i * 16).find((e) => buf.toString('latin1', e, e + 4) === 'name');
		const off = buf.readUInt32BE(/** @type {number} */ (at) + 8), strings = off + buf.readUInt16BE(off + 4);
		return [...Array(buf.readUInt16BE(off + 2)).keys()]
			.map((j) => off + 6 + j * 12)
			.filter((r) => buf.readUInt16BE(r) === 3 && buf.readUInt16BE(r + 6) === 1)
			.map((r) => buf.subarray(strings + buf.readUInt16BE(r + 10), strings + buf.readUInt16BE(r + 10) + buf.readUInt16BE(r + 8)).swap16().toString('utf16le'));
	};
	for (const f of Object.values(FONTS)) assert.ok(families(fs.readFileSync(new URL(`../data/fonts/${f.file}`, import.meta.url))).includes(f.family), f.family);
});

test('lockups: outlines, no fonts, laid out by layout', async () => {
	const mark = loadMark('hex-gem').svg;
	const h = await lockup({ mark, name: 'Hexa Labs', font: 'inter', markColor: '#FF5C3A', textColor: '#111111' });
	const s = await lockup({ mark, name: 'Hexa Labs', font: 'inter', layout: 'stacked', markColor: '#FF5C3A' });
	const m = await lockup({ mark, name: 'Hexa Labs', font: 'inter', layout: 'mark', markColor: '#FF5C3A' });
	assert.doesNotMatch(h.svg, /<text/);
	assert.match(h.svg, /fill="#111111"/);
	assert.ok(h.width > 2.5 * h.height);
	assert.ok(s.height > s.width * 0.6);
	assert.equal(m.height, 300); // the mark's 200, and a quarter of it clear above and below
});

test('a .ico wraps its PNGs', async () => {
	const mark = loadMark('hex-gem').svg;
	const pngs = await Promise.all([16, 32].map(async (size) => ({ size, png: await markPng(mark, { size, color: '#000' }) })));
	const file = Buffer.from(ico(pngs));
	assert.deepEqual([file.readUInt16LE(0), file.readUInt16LE(2), file.readUInt16LE(4)], [0, 1, 2]);
	assert.equal(file[6], 16);
	assert.equal(file[22], 32);
	const at = file.readUInt32LE(6 + 16 + 12);
	assert.deepEqual(pngSize(file.subarray(at)), { width: 32, height: 32 });
});
