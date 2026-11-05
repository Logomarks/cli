import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { main } from '../src/cli/index.js';
import { fixturePath, pngSize, tempDir, live } from './helpers.js';

/** Runs the CLI, capturing its output. */
async function run(/** @type {string[]} */ argv) {
	const out = [], err = [];
	const code = await main(argv, { out: (s) => out.push(s), err: (s) => err.push(s) });
	return { code, out: out.join('\n'), err: err.join('\n') };
}

/** A folder of live marks (and a marks.json beside it, as the site's data folder has). */
function liveFolder(/** @type {string[]} */ slugs) {
	const dir = tempDir(), svg = path.join(dir, 'svg');
	fs.mkdirSync(svg);
	for (const s of slugs) fs.writeFileSync(path.join(svg, `${s}.svg`), live(s));
	fs.writeFileSync(path.join(dir, 'marks.json'), JSON.stringify(slugs.map((slug) => ({ slug, name: slug.toUpperCase(), tags: slug.startsWith('badge-') ? ['letter'] : [] }))));
	fs.writeFileSync(path.join(dir, 'descriptions.json'), JSON.stringify(Object.fromEntries(slugs.map((s) => [s, { style: s.startsWith('badge-') ? 'badge' : 'bold', mood: ['minimal'] }]))));
	return dir;
}

test('similar --against: a folder instead of the bundled index, named from its marks.json', async () => {
	const dir = liveFolder(['moonrise', 'hex-gem', 'badge-a', 'badge-b']);
	const r = await run(['similar', fixturePath('split-block'), '--against', path.join(dir, 'svg'), '--top', '2', '--json']);
	const json = JSON.parse(r.out);
	assert.equal(json.live, 4);
	assert.equal(json.marks[0].matches.length, 2);
	assert.ok(['MOONRISE', 'HEX-GEM', 'BADGE-A', 'BADGE-B'].includes(json.marks[0].matches[0].name));
	const copy = path.join(tempDir(), 'moonrise-copy.svg');
	fs.writeFileSync(copy, live('moonrise'));
	const near = JSON.parse((await run(['similar', copy, '--against', path.join(dir, 'svg'), '--json'])).out);
	assert.equal(near.ok, false);
	assert.equal(near.marks[0].matches[0].slug, 'moonrise');
	const letters = JSON.parse((await run(['similar', fixturePath('split-block'), '--against', path.join(dir, 'svg'), '--letters', '--json'])).out);
	assert.deepEqual(letters.marks[0].matches, []);
});

test('similar --each: candidates against each other too, marked', async () => {
	const dir = tempDir(), a = path.join(dir, 'a.svg'), b = path.join(dir, 'b.svg');
	fs.writeFileSync(a, live('hex-gem'));
	fs.writeFileSync(b, live('hex-gem'));
	const json = JSON.parse((await run(['similar', a, b, '--each', '--top', '2', '--json'])).out);
	const other = json.marks[0].matches.find((m) => m.candidate);
	assert.ok(other, 'the other candidate is among the nearest');
	assert.equal(other.slug, 'b');
	assert.ok(other.score > 0.99);
	assert.ok(json.marks[0].matches.every((m) => m.slug !== 'a'), 'a candidate is never its own match');
	const text = (await run(['similar', a, b, '--each'])).out;
	assert.match(text, /b \*/);
});

test('similar --all writes "More like this" for a whole set', async () => {
	const dir = liveFolder(['moonrise', 'hex-gem', 'badge-a', 'badge-b']), out = path.join(dir, 'similar.json');
	const r = await run(['similar', '--all', dir, '--out', out]);
	assert.equal(r.code, 0);
	const json = JSON.parse(fs.readFileSync(out, 'utf8'));
	assert.deepEqual(Object.keys(json), ['moonrise', 'hex-gem', 'badge-a', 'badge-b']);
	assert.equal(json['badge-a'].length, 3);
	assert.equal(json['badge-a'][0], 'badge-b');
});

test('specks: the speck review, exit 1 when anything is reported', async () => {
	const r = await run(['specks', fixturePath('speck'), fixturePath('split-block')]);
	assert.equal(r.code, 1);
	assert.match(r.out, /^speck +piece /m);
	assert.match(r.out, /1 of 2 marks with specks \(pieces < 60, holes < 30\)/);
	const json = JSON.parse((await run(['specks', fixturePath('speck'), '--json', '--piece', '1'])).out);
	assert.deepEqual(json, []);
	const allowed = await run(['specks', fixturePath('speck'), '--allow', 'speck']);
	assert.equal(allowed.code, 0);
	assert.match(allowed.out, /1 allowed/);
	assert.equal((await run(['specks', fixturePath('speck'), '--raster'])).code, 1);
});

test('sheet --plain: a labelled grid', async () => {
	const out = path.join(tempDir(), 'plain.png');
	const r = await run(['sheet', fixturePath('speck'), fixturePath('split-block'), fixturePath('gap-10'), '--plain', '--cols', '2', '-o', out]);
	assert.equal(r.code, 0);
	assert.deepEqual(pngSize(fs.readFileSync(out)), { width: 380, height: 440 });
});
