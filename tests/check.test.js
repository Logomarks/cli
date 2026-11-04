import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, fix } from '../src/index.js';
import { fixture, live, ids } from './helpers.js';

// the skill's six examples and a spread of families
const GOOD = ['hex-gem', 'cube-window', 'moonrise', 'quadrant', 'halo-chain', 'cut-k', 'badge-a', 'track-s', 'linked-squares', 'dot-sphere', 'notched-diamond'];

test('known-good live marks pass', () => {
	for (const slug of GOOD) {
		const r = check(live(slug), { name: slug });
		assert.equal(r.errors, 0, `${slug}: ${r.findings.map((f) => f.message).join('; ')}`);
		assert.ok(r.ok);
		assert.ok(r.size && Math.abs(Math.max(r.size.w, r.size.h) - 448) <= 0.5);
	}
});

test('a clean fixture has no findings', () => {
	assert.deepEqual(check(fixture('split-block')).findings, []);
});

test('a stray speck is an error with its box', () => {
	const r = check(fixture('speck'));
	assert.equal(r.ok, false);
	const f = r.findings.find((x) => x.id === 'speck');
	assert.ok(f);
	assert.equal(f.severity, 'error');
	assert.deepEqual(f.box, [253, 250, 259, 256]);
	assert.equal(f.value, 36);
});

test('an off-grid mark fails size and centre, and --fix refits it', () => {
	const svg = fixture('off-grid');
	const r = check(svg);
	assert.deepEqual(ids(r).sort(), ['centre', 'size']);
	const fitted = fix(svg, r);
	assert.ok(fitted);
	assert.ok(check(fitted).ok);
	assert.deepEqual(check(fitted).findings, []);
});

test('a stray hole is a pin-hole', () => {
	const r = check(fixture('stray-hole'));
	assert.deepEqual(ids(r), ['pinhole']);
	assert.equal(r.ok, false);
});

test('a 10-unit gap among 22s is uneven: a warning, a failure with strict', () => {
	const r = check(fixture('gap-10'));
	assert.ok(ids(r).includes('uneven-gaps'));
	assert.equal(r.errors, 0);
	assert.equal(r.ok, true);
	const strict = check(fixture('gap-10'), { strict: true });
	assert.equal(strict.ok, false);
	const f = r.findings.find((x) => x.id === 'uneven-gaps');
	assert.ok(f?.box && f.box[0] < 261 && f.box[2] > 251, 'the box covers the 10 gap at x 251–261');
	assert.ok(Math.abs((f?.value ?? 0) - 10) < 0.6);
});

test('ignore leaves finding ids out', () => {
	assert.equal(check(fixture('speck'), { ignore: ['speck'] }).ok, true);
});

test('markup a refit would drop is reported and never fixed', () => {
	const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><g transform="scale(2)"><path d="M16 16H240V240H16z"/></g></svg>';
	const r = check(svg);
	assert.ok(ids(r).includes('markup'));
	assert.equal(fix(svg, r), null);
});

test('an empty file is an error', () => {
	assert.deepEqual(ids(check('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"></svg>')), ['empty']);
});

test('clipping and colour are found', () => {
	const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#000" d="M-20 32H428V480H-20z"/></svg>';
	const found = ids(check(svg));
	for (const id of ['centre', 'clipped', 'fill']) assert.ok(found.includes(id), id);
});
