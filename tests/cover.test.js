import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cover, RECIPES, loadMark } from '../src/index.js';
import { pngSize } from './helpers.js';

const mark = loadMark('hex-gem');

test('every curated recipe draws with the mark', async () => {
	for (const recipe of Object.keys(RECIPES)) {
		const c = await cover({ mark, recipe, title: 'Hexa Labs', color: '#2E4BFF', width: 600 });
		assert.deepEqual(pngSize(c.png), { width: 600, height: 315 }, recipe);
		assert.doesNotMatch(c.svg, /<text/, `${recipe}: text as outlines`);
	}
});

test('aspect, and an unknown recipe', async () => {
	const c = await cover({ mark, aspect: '1:1', width: 400 });
	assert.deepEqual(pngSize(c.png), { width: 400, height: 400 });
	await assert.rejects(cover({ mark, recipe: 'nope' }), TypeError);
});
