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
	const usage = await run(['check', '--nope', 'x.svg']);
	assert.match(usage.err, /^logomarks check: unknown option --nope\nRun "logomarks check --help" for usage\.$/);
});

test('every verb has --help, with usage and options; --version prints the version', async () => {
	const { COMMANDS } = await import('../src/cli/commands/index.js');
	for (const verb of Object.keys(COMMANDS)) {
		for (const argv of [[verb, '--help'], [verb, '-h'], ['help', verb]]) {
			const r = await run(argv);
			assert.equal(r.code, 0, argv.join(' '));
			assert.match(r.out, new RegExp(`^logomarks ${verb}: .+\\n\\nUsage\\n  logomarks ${verb}`), argv.join(' '));
			assert.match(r.out, /\n  -h, --help /);
		}
	}
	const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
	assert.equal((await run(['--version'])).out, version);
	assert.equal((await run(['help', 'nope'])).code, 2);
});

test('a failure that is not a usage error is one line and exit 1', async () => {
	const r = await run(['get', 'hex-gem', '-o', path.join(fixturePath('speck'), 'x.svg')]);
	assert.equal(r.code, 1);
	assert.match(r.err, /^logomarks get: /);
	assert.doesNotMatch(r.err, /\n\s+at /);
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
	const r = await run(['kit', 'hex-gem', '--name', 'Hexa Labs', '--color', '#2E4BFF', '--font', 'Instrument Serif', '--tagline', 'Labs', '--styles', 'bold', '--platforms', 'x-header,x-avatar', '-o', dir, '--json']);
	assert.equal(r.code, 0);
	const json = JSON.parse(r.out);
	assert.equal(json.font.name, 'Instrument Serif');
	assert.equal(json.mark.license, 'CC0-1.0');
	for (const f of json.files) assert.ok(fs.existsSync(path.join(dir, f)), f);
	assert.ok(json.files.includes('social/bold/x-header.png'));
	assert.ok(!json.files.includes('social/bold/x-header.animated.svg'));
	assert.equal((await run(['kit', 'hex-gem', '--font', 'comic-sans'])).code, 2);
	assert.equal((await run(['kit', 'hex-gem', '--styles', 'loud'])).code, 2);
});

test('social writes the pack: platforms by name, styles, animated on request', async () => {
	const dir = path.join(tempDir(), 'social');
	const r = await run(['social', 'hex-gem', '--name', 'Hexa', '--platforms', 'linkedin', '--styles', 'minimal,pattern', '--animated', '-o', dir, '--json']);
	assert.equal(r.code, 0);
	const files = JSON.parse(r.out).files;
	assert.ok(files.includes('minimal/linkedin-banner.png') && files.includes('pattern/linkedin-logo.svg'));
	assert.ok(files.includes('minimal/linkedin-banner.animated.svg'));
	assert.ok(!files.some((/** @type {string} */ f) => f.startsWith('bold/')));
	assert.ok(fs.existsSync(path.join(dir, 'README.md')));
	assert.equal((await run(['social', 'hex-gem', '--platforms', 'myspace'])).code, 2);
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
	// as on the board: every Fox, in the board's order (Track Fox Tail first since Drop 17)
	assert.deepEqual(JSON.parse(r.out).marks.map((/** @type {{ slug: string }} */ m) => m.slug), ['track-fox-tail', 'crease-fox-sit']);
	assert.equal(JSON.parse(r.out).total, 13); // Drop 19 added Fox Sit
	// a trade by another name: the synonyms find the law firms' marks (Drop 19's Ionic Column, then the scales)
	assert.deepEqual(JSON.parse((await run(['find', 'solicitor', '--top', '2', '--json'])).out).marks.map((/** @type {{ slug: string }} */ m) => m.slug), ['ionic-column', 'pixel-scales']);
	const k = JSON.parse((await run(['find', '--style', 'badge', '--letter', 'K', '--json'])).out);
	// every K badge, in any lettering: Badge K, Pixel Badge K, Pixel Coin K, Pixel Badge Lower K, League K …
	assert.ok(k.marks.length > 0 && k.marks.every((/** @type {{ slug: string }} */ m) => /(badge|coin|league)(-lower)?-k$/.test(m.slug)));
	assert.ok(JSON.parse((await run(['find', '--json'])).out).styles.letter > 0);
	assert.equal((await run(['find', 'zzqx'])).code, 1);
});

test('parts, glitch, edit and combine: SVG to a file or stdout, the checks, exit 1 on a failing result', async () => {
	const dir = tempDir();
	const parts = await run(['parts', 'quad-cove', '-o', path.join(dir, 'parts.png'), '--json']);
	assert.equal(JSON.parse(parts.out).count, 4);
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'parts.png'))), { width: 512, height: 512 });
	const g = await run(['glitch', 'shear-a', '--preset', 'stepped', '--seed', '5', '-o', path.join(dir, 'g.svg')]);
	assert.equal(g.code, 0);
	assert.match(g.out, /stepped at seed 5/);
	const again = await run(['glitch', 'shear-a', '--preset', 'stepped', '--seed', '5']);
	assert.equal(again.out, fs.readFileSync(path.join(dir, 'g.svg'), 'utf8').trimEnd());
	assert.match(again.err, /shear-a/);
	assert.equal((await run(['glitch', 'shear-a', '--preset', 'melt'])).code, 2);
	assert.equal((await run(['glitch', 'shear-a', '--preset', 'lane'])).code, 2);
	assert.equal((await run(['glitch', 'shear-a', '--angle', 'steep'])).code, 2);
	const opsFile = path.join(dir, 'ops.json');
	fs.writeFileSync(opsFile, JSON.stringify([{ op: 'delete', parts: [0] }, { op: 'round', radius: 8 }]));
	const e = JSON.parse((await run(['edit', 'quad-cove', '--ops', `@${opsFile}`, '--json'])).out);
	assert.equal(e.parts.length, 3);
	assert.equal(e.ok, true);
	const sliver = await run(['edit', 'shear-a', '--ops', '[{"op":"mirror"}]', '-o', path.join(dir, 'm.png')]);
	assert.equal(sliver.code, 1, 'a sliver fails the result');
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'm.png'))), { width: 512, height: 512 });
	assert.equal((await run(['edit', 'quad-cove', '--ops', '{oops'])).code, 2);
	assert.equal((await run(['edit', 'quad-cove', '--ops', '[{"op":"delete","parts":[7]}]'])).code, 2);
	const c = JSON.parse((await run(['combine', 'quad-cove', 'shear-a', '--op', 'subtract', '--scale', '0.5', '--json'])).out);
	assert.equal(c.checks.name, 'quad-cove-subtract-shear-a');
	assert.equal((await run(['combine', 'quad-cove', '--op', 'union'])).code, 2);
	assert.equal((await run(['combine', 'quad-cove', 'shear-a', '--op', 'blend'])).code, 2);
});
