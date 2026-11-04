import { test } from 'node:test';
import assert from 'node:assert/strict';
import { similar, loadIndex, rules } from '../src/index.js';
import { live, fixture } from './helpers.js';

test('the index holds the live set', () => {
	const index = loadIndex();
	assert.ok(index.marks.length > 1000);
	assert.ok(index.letters.length > 100);
	assert.equal(index.marks[0].outline.length, rules.SIMILAR.size ** 2);
});

test('a live mark finds itself first, at 1.0', async () => {
	for (const slug of ['hex-gem', 'moonrise', 'cube-a']) {
		const [first, second] = await similar(live(slug));
		assert.equal(first.slug, slug);
		assert.ok(first.score > 0.99);
		assert.equal(first.verdict, 'near-copy');
		assert.ok(second.score < first.score);
	}
});

test('a rotated copy is still found', async () => {
	const turned = live('moonrise').replace('fill="currentColor">', 'fill="currentColor"><g transform="rotate(90 256 256)">').replace('</svg>', '</g></svg>');
	const [first] = await similar(turned);
	assert.equal(first.slug, 'moonrise');
	assert.ok(first.score > 0.95);
});

test('exclude and top', async () => {
	const out = await similar(live('hex-gem'), { top: 2, exclude: 'hex-gem' });
	assert.equal(out.length, 2);
	assert.ok(out.every((m) => m.slug !== 'hex-gem'));
});

test('letters compares a badge by its knocked-out letter', async () => {
	const [first] = await similar(live('badge-a'), { letters: true, top: 3 });
	assert.equal(first.slug, 'badge-a');
	assert.equal(first.by, 'letter (hole)');
	assert.deepEqual(await similar(fixture('split-block'), { letters: true }), []);
});
