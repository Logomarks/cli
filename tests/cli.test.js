import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { main } from '../src/cli/index.js';
import { fixturePath, pngSize, tempDir } from './helpers.js';

/** Runs the CLI, capturing its output. */
async function run(/** @type {string[]} */ argv) {
	const out = [], err = [];
	const code = await main(argv, { out: (s) => out.push(s), err: (s) => err.push(s) });
	return { code, out: out.join('\n'), err: err.join('\n') };
}

test('check: 0 on pass, 1 on fail, --json is machine-readable', async () => {
	assert.equal((await run(['check', fixturePath('split-block')])).code, 0);
	const r = await run(['check', fixturePath('speck'), fixturePath('split-block'), '--json']);
	assert.equal(r.code, 1);
	const json = JSON.parse(r.out);
	assert.equal(json.ok, false);
	assert.equal(json.failed, 1);
	assert.equal(json.marks[0].findings[0].id, 'speck');
});

test('check --fix refits a copy in place', async () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logomarks-'));
	const file = path.join(dir, 'off-grid.svg');
	fs.copyFileSync(fixturePath('off-grid'), file);
	const r = await run(['check', file, '--fix', '--json']);
	assert.equal(r.code, 0);
	assert.equal(JSON.parse(r.out).marks[0].fixed, true);
	assert.equal((await run(['check', file])).code, 0);
});

test('usage errors exit 2', async () => {
	assert.equal((await run([])).code, 2);
	assert.equal((await run(['nope'])).code, 2);
	assert.equal((await run(['check', '--nope', 'x.svg'])).code, 2);
	assert.equal((await run(['check'])).code, 2);
	assert.equal((await run(['check', 'missing.svg'])).code, 2);
	assert.equal((await run(['similar', fixturePath('speck'), '--top', 'x'])).code, 2);
	assert.equal((await run(['--help'])).code, 0);
});

test('similar --json lists the nearest with verdicts', async () => {
	const r = await run(['similar', fixturePath('split-block'), '--json', '--top', '3']);
	const json = JSON.parse(r.out);
	assert.equal(json.marks[0].matches.length, 3);
	assert.ok(json.thresholds.tooClose === 0.72);
	assert.equal(r.code, json.ok ? 0 : 1);
});

test('sheet writes a PNG', async () => {
	const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'logomarks-')), 'sheet.png');
	const r = await run(['sheet', fixturePath('speck'), fixturePath('split-block'), '-o', out, '--json']);
	const png = fs.readFileSync(out);
	assert.deepEqual([...png.subarray(1, 4)], [0x50, 0x4e, 0x47]);
	assert.ok(png.length > 20000);
	const json = JSON.parse(r.out);
	assert.equal(json.marks.length, 2);
	assert.equal(json.marks[0].ok, false);
	assert.equal(r.code, 1);
});

test('get: SVG to stdout, a PNG to a file, a miss exits 2 with a suggestion', async () => {
	const svg = await run(['get', 'hex-gem', '--color', '#ff5c3a']);
	assert.equal(svg.code, 0);
	assert.match(svg.out, /^<svg[^>]+fill="#FF5C3A"/);
	const out = path.join(tempDir(), 'hex.png');
	const png = await run(['get', 'Hex', 'Gem', '--size', '64', '-o', out, '--json']);
	assert.equal(JSON.parse(png.out).format, 'png');
	assert.deepEqual(pngSize(fs.readFileSync(out)), { width: 64, height: 64 });
	const miss = await run(['get', 'hexgem']);
	assert.equal(miss.code, 2);
	assert.match(miss.err, /did you mean hex-gem/);
	assert.equal((await run(['get', 'hex-gem', '--format', 'png'])).code, 2);
	assert.equal((await run(['get', 'hex-gem', '--color', 'red'])).code, 2);
});

test('kit writes the folder', async () => {
	const dir = path.join(tempDir(), 'kit');
	const r = await run(['kit', 'hex-gem', '--name', 'Hexa Labs', '--color', '#2E4BFF', '--font', 'Instrument Serif', '-o', dir, '--json']);
	assert.equal(r.code, 0);
	const json = JSON.parse(r.out);
	assert.equal(json.font.id, 'instrument-serif');
	for (const f of json.files) assert.ok(fs.existsSync(path.join(dir, f)), f);
	assert.equal((await run(['kit', 'hex-gem', '--font', 'comic-sans'])).code, 2);
});

test('mockup and cover write PNGs; bad choices exit 2', async () => {
	const dir = tempDir();
	const m = await run(['mockup', 'hex-gem', '--object', 'mug', '--base', 'black', '--size', '300', '-o', path.join(dir, 'mug.png'), '--json']);
	assert.equal(m.code, 0);
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'mug.png'))), { width: 300, height: 300 });
	assert.equal((await run(['mockup', 'hex-gem', '--object', 'rocket'])).code, 2);
	assert.equal((await run(['mockup', 'hex-gem', '--object', 'card', '--layout', 'hand'])).code, 2);
	const c = await run(['cover', fixturePath('split-block'), '--recipe', 'stripes', '--title', 'Hello', '--width', '600', '-o', path.join(dir, 'cover.png')]);
	assert.equal(c.code, 0);
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'cover.png'))), { width: 600, height: 315 });
	assert.equal((await run(['cover', 'hex-gem', '--recipe', 'nope'])).code, 2);
});

test('find: words and filters, facets with nothing to search by, 1 when nothing matches', async () => {
	const r = await run(['find', 'fox', '--top', '2', '--json']);
	assert.equal(r.code, 0);
	assert.equal(JSON.parse(r.out).marks[0].slug, 'fox');
	assert.equal(JSON.parse(r.out).marks.length, 2);
	const k = JSON.parse((await run(['find', '--style', 'badge', '--letter', 'K', '--json'])).out);
	assert.ok(k.marks.every((/** @type {{ slug: string }} */ m) => m.slug.includes('badge-k')));
	assert.ok(JSON.parse((await run(['find', '--json'])).out).styles.letter > 0);
	assert.equal((await run(['find', 'zzqx'])).code, 1);
});
