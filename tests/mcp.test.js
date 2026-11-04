import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer, TOOLS } from '../src/mcp/index.js';
import { findMarks } from '../src/find/index.js';
import { fixture, fixturePath, pngSize, tempDir } from './helpers.js';

const dir = tempDir();
const client = new Client({ name: 'test', version: '0.0.0' });

before(async () => {
	const [a, b] = InMemoryTransport.createLinkedPair();
	await createServer({ cwd: dir }).connect(a);
	await client.connect(b);
});

after(() => client.close());

/**
 * Calls a tool and splits its result into the JSON it returned and its images.
 *
 * @param {string} name The tool.
 * @param {Record<string, unknown>} args Its arguments.
 */
async function call(name, args) {
	const r = /** @type {{ isError?: boolean, content: { type: string, text?: string, data?: string, mimeType?: string }[] }} */ (await client.callTool({ name, arguments: args }));
	const texts = r.content.filter((c) => c.type === 'text').map((c) => /** @type {string} */ (c.text));
	const images = r.content.filter((c) => c.type === 'image').map((c) => {
		assert.equal(c.mimeType, 'image/png');
		return pngSize(Buffer.from(/** @type {string} */ (c.data), 'base64'));
	});
	const json = !r.isError && texts[0]?.startsWith('{') ? JSON.parse(texts[0]) : null;
	return { error: r.isError ? texts.join('\n') : null, json, images };
}

test('lists every tool, each with a description and an input schema', async () => {
	const { tools } = await client.listTools();
	assert.deepEqual(tools.map((t) => t.name), ['find_marks', 'get_mark', 'check_mark', 'similar_marks', 'review_sheet', 'brand_kit', 'mockup', 'cover']);
	assert.equal(tools.length, TOOLS.length);
	for (const t of tools) {
		assert.ok(t.description && t.description.length > 80, t.name);
		assert.equal(t.inputSchema.type, 'object');
	}
	const mockup = tools.find((t) => t.name === 'mockup');
	assert.deepEqual(mockup?.inputSchema.required, ['mark', 'object']);
	assert.ok(/** @type {{ enum: string[] }} */ (mockup?.inputSchema.properties?.object).enum.includes('tee'));
	assert.match(client.getInstructions() ?? '', /find_marks/);
});

test('find_marks: words and filters; no arguments lists the facets', async () => {
	const fox = await call('find_marks', { query: 'fox', limit: 3 });
	assert.equal(fox.json.marks[0].slug, 'fox');
	assert.equal(fox.json.marks.length, 3);
	assert.ok(fox.json.total >= 3);
	const k = await call('find_marks', { style: 'badge', letter: 'k' });
	assert.ok(k.json.marks.length && k.json.marks.every((/** @type {{ style: string, letter: string }} */ m) => m.style === 'badge' && m.letter === 'K'));
	const facets = await call('find_marks', {});
	assert.ok(facets.json.facets.styles.letter > 0);
	assert.ok(facets.json.facets.tags.round > 0);
	assert.equal((await call('find_marks', { query: 'zzqx' })).json.total, 0);
});

test('findMarks ranks marks with the most words first and drops filler words', () => {
	const r = findMarks('a logo for a fox', { limit: 1 });
	assert.equal(r.marks[0].slug, 'fox');
	assert.equal(r.total, findMarks('fox').total);
});

test('get_mark: the SVG, a PNG when sized, and a file when asked', async () => {
	const r = await call('get_mark', { mark: 'Hex Gem', color: '#ff5c3a', size: 64, out: 'out/hex.png' });
	assert.equal(r.json.slug, 'hex-gem');
	assert.equal(r.json.licence, 'CC0-1.0');
	assert.match(r.json.svg, /fill="#FF5C3A"/i);
	assert.deepEqual(r.images, [{ width: 64, height: 64 }]);
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'out/hex.png'))), { width: 64, height: 64 });
	const plain = await call('get_mark', { mark: 'hex-gem' });
	assert.equal(plain.images.length, 0);
	assert.match(plain.json.svg, /currentColor/);
});

test('get_mark: an unknown mark is a tool error with suggestions', async () => {
	const r = await call('get_mark', { mark: 'hex gemm' });
	assert.match(/** @type {string} */ (r.error), /no live mark "hex gemm": did you mean hex-.*find_marks/);
	assert.match(/** @type {string} */ ((await call('get_mark', { mark: 'hex-gem', color: 'orange' })).error), /hex colour/);
});

test('check_mark: SVG text or files, findings as JSON, fix refits', async () => {
	const text = await call('check_mark', { svg: fixture('speck'), svgName: 'speck' });
	assert.equal(text.json.ok, false);
	assert.equal(text.json.marks[0].findings[0].id, 'speck');
	assert.equal(text.json.marks[0].findings[0].box.length, 4);
	const files = await call('check_mark', { paths: [fixturePath('split-block'), fixturePath('speck')] });
	assert.deepEqual([files.json.passed, files.json.failed], [1, 1]);
	const fitted = await call('check_mark', { svg: fixture('off-grid'), fix: true });
	assert.equal(fitted.json.ok, true);
	assert.match(fitted.json.marks[0].svg, /viewBox="0 0 512 512"/);
	fs.copyFileSync(fixturePath('off-grid'), path.join(dir, 'off-grid.svg'));
	assert.equal((await call('check_mark', { paths: ['off-grid.svg'], fix: true })).json.marks[0].fixed, true);
	assert.equal((await call('check_mark', { paths: ['off-grid.svg'] })).json.ok, true);
});

test('check_mark: no input, both inputs or a missing file are tool errors', async () => {
	assert.match(/** @type {string} */ ((await call('check_mark', {})).error), /pass svg/);
	assert.match(/** @type {string} */ ((await call('check_mark', { svg: '<svg/>', paths: ['x.svg'] })).error), /not both/);
	assert.match(/** @type {string} */ ((await call('check_mark', { paths: ['nope.svg'] })).error), /no such file: .*nope\.svg/);
	assert.ok((await call('check_mark', { svg: 42 })).error);
});

test('similar_marks: a live mark finds itself as a near-copy', async () => {
	const svg = (await call('get_mark', { mark: 'hex-gem' })).json.svg;
	const r = await call('similar_marks', { svg, top: 3 });
	assert.equal(r.json.ok, false);
	assert.equal(r.json.marks[0].matches[0].slug, 'hex-gem');
	assert.equal(r.json.marks[0].matches[0].verdict, 'near-copy');
	assert.equal(r.json.marks[0].matches.length, 3);
});

test('review_sheet: the cards as an image, a summary, and a file when asked', async () => {
	const r = await call('review_sheet', { paths: [fixturePath('speck'), fixturePath('split-block')], out: 'sheet.png' });
	assert.equal(r.images.length, 1);
	assert.ok(r.images[0].width > 500);
	assert.deepEqual(r.json.marks.map((/** @type {{ name: string, ok: boolean }} */ m) => [m.name, m.ok]), [['speck', false], ['split-block', true]]);
	assert.ok(fs.existsSync(path.join(dir, 'sheet.png')));
});

test('brand_kit: writes the folder and returns its path and the brand sheet', async () => {
	const r = await call('brand_kit', { mark: 'hex-gem', name: 'Hexa Labs', color: '#ff5c3a', font: 'space-grotesk' });
	assert.equal(r.json.dir, path.join(dir, 'hexa-labs-kit'));
	assert.equal(r.json.colors.primary, '#FF5C3A');
	assert.equal(r.images.length, 1);
	for (const f of ['brand.json', 'brand-sheet.png', 'favicon/favicon.ico', 'colors/palette.css']) assert.ok(fs.existsSync(path.join(r.json.dir, f)), f);
	assert.equal(r.json.count, r.json.files.length);
	assert.match(/** @type {string} */ ((await call('brand_kit', { mark: 'hex-gem', font: 'comic-sans' })).error), /font/);
});

test('mockup: an image, and a file when asked', async () => {
	const r = await call('mockup', { mark: 'hex-gem', object: 'card', name: 'Hexa', size: 600, out: 'card.svg' });
	assert.equal(r.images.length, 1);
	assert.equal(Math.max(r.images[0].width, r.images[0].height), 600);
	assert.match(fs.readFileSync(path.join(dir, 'card.svg'), 'utf8'), /^<svg/);
	assert.match(/** @type {string} */ ((await call('mockup', { mark: 'hex-gem', object: 'card', layout: 'nope' })).error), /card layouts: pair/);
	assert.ok((await call('mockup', { mark: 'hex-gem', object: 'spaceship' })).error);
});

test('cover: an image at the aspect asked, and a file when asked', async () => {
	const r = await call('cover', { mark: 'hex-gem', recipe: 'aurora', title: 'Introducing Hexa', aspect: '1:1', width: 400, out: 'cover.png' });
	assert.deepEqual(r.images, [{ width: 400, height: 400 }]);
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'cover.png'))), { width: 400, height: 400 });
	assert.ok((await call('cover', { mark: 'hex-gem', aspect: 'wide' })).error);
});
