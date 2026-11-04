import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { main } from '../src/cli/index.js';
import { fixturePath } from './helpers.js';

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
