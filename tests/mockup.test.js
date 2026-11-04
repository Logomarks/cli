import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mockup, OBJECTS, loadMark } from '../src/index.js';
import { pngSize } from './helpers.js';

const mark = loadMark('hex-gem');

test('a print object and a full-bleed one render', async () => {
	for (const object of ['tee', 'card']) {
		const m = await mockup({ mark, object, name: 'Hexa Labs', color: '#FF5C3A', size: 400 });
		assert.deepEqual(pngSize(m.png), { width: 400, height: 400 });
		assert.match(m.svg, /^<svg/);
	}
});

test('every object is 2D, with no hand layouts', () => {
	assert.ok(Object.keys(OBJECTS).length >= 18);
	for (const spec of Object.values(OBJECTS)) assert.ok(!spec.layouts?.some((l) => l === 'hand' || l === 'held'));
});

test('a bad object, layout or base is a TypeError', async () => {
	await assert.rejects(mockup({ mark, object: 'spaceship' }), TypeError);
	await assert.rejects(mockup({ mark, object: 'card', layout: 'hand' }), TypeError);
	await assert.rejects(mockup({ mark, object: 'poster', base: 'black' }), TypeError);
});
