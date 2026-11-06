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
	assert.deepEqual(tools.map((t) => t.name), ['find_marks', 'get_mark', 'check_mark', 'similar_marks', 'review_sheet', 'list_parts', 'glitch_mark', 'edit_mark', 'combine_marks', 'build_brand_kit', 'build_social_pack', 'render_mockup', 'render_cover']);
	assert.equal(tools.length, TOOLS.length);
	for (const t of tools) {
		assert.ok(t.description && t.description.length > 80, t.name);
		assert.equal(t.inputSchema.type, 'object');
	}
	const mockup = tools.find((t) => t.name === 'render_mockup');
	assert.deepEqual(mockup?.inputSchema.required, ['mark', 'object']);
	assert.ok(/** @type {{ enum: string[] }} */ (mockup?.inputSchema.properties?.object).enum.includes('tee'));
	assert.match(client.getInstructions() ?? '', /find_marks/);
	assert.match(client.getInstructions() ?? '', /edit_mark/);
});

test('the editing and brand tools publish their choices', async () => {
	const { tools } = await client.listTools();
	const props = (/** @type {string} */ name) => /** @type {Record<string, any>} */ (tools.find((t) => t.name === name)?.inputSchema.properties);
	assert.deepEqual(props('glitch_mark').preset.enum, ['shear', 'slice', 'bands', 'stepped', 'lane']);
	for (const k of ['mark', 'svg', 'angle', 'place', 'slide', 'gap', 'cuts', 'seed', 'out']) assert.ok(props('glitch_mark')[k], `glitch_mark.${k}`);
	assert.deepEqual(tools.find((t) => t.name === 'glitch_mark')?.inputSchema.required, ['preset']);
	const op = props('edit_mark').ops.items;
	assert.deepEqual(op.properties.op.enum, ['delete', 'move', 'rotate', 'scale', 'flip', 'round', 'offset', 'mirror', 'radial', 'union', 'subtract', 'color', 'tone']);
	assert.deepEqual(op.required, ['op']);
	assert.deepEqual(props('combine_marks').op.enum, ['union', 'subtract', 'intersect', 'exclude', 'place']);
	assert.ok(props('combine_marks').transform.properties.scale);
	for (const name of ['build_brand_kit', 'build_social_pack']) {
		assert.deepEqual(props(name).styles.items.enum, ['minimal', 'bold', 'pattern', 'gradient']);
		assert.equal(props(name).animated.type, 'boolean');
		assert.match(props(name).platforms.description, /instagram-story/);
	}
	assert.equal(props('list_parts').ops, undefined);
});

test('list_parts: the parts by index, and an image of them numbered', async () => {
	const r = await call('list_parts', { mark: 'quad-cove' });
	assert.equal(r.json.count, 4);
	assert.deepEqual(Object.keys(r.json.parts[0]), ['index', 'box', 'centre', 'area', 'holes', 'tone']);
	assert.deepEqual(r.images, [{ width: 512, height: 512 }]);
	assert.match(/** @type {string} */ ((await call('list_parts', {})).error), /pass mark/);
});

test('glitch_mark: a fitted, checked SVG and its image; the same seed, the same bytes; a file (and its path, not the SVG) when asked', async () => {
	const a = await call('glitch_mark', { mark: 'shear-a', preset: 'slice', seed: 4, out: 'glitched.svg' });
	const b = await call('glitch_mark', { mark: 'shear-a', preset: 'slice', seed: 4 });
	assert.equal(a.json.ok, true);
	assert.equal(a.json.svg, undefined);
	assert.equal(a.json.file, path.join(dir, 'glitched.svg'));
	assert.equal(a.json.checks.size.w === 448 || a.json.checks.size.h === 448, true);
	assert.equal(fs.readFileSync(path.join(dir, 'glitched.svg'), 'utf8'), b.json.svg);
	assert.equal(a.images.length, 1);
	assert.match(/** @type {string} */ ((await call('glitch_mark', { mark: 'shear-a', preset: 'lane' })).error), /Track mark/);
});

test('edit_mark and combine_marks: ops and booleans, each checked', async () => {
	const e = await call('edit_mark', { mark: 'quad-cove', ops: [{ op: 'delete', parts: [0] }, { op: 'round', radius: 10 }] });
	assert.equal(e.json.parts.length, 3);
	assert.equal(e.json.ok, true);
	assert.match(/** @type {string} */ ((await call('edit_mark', { mark: 'quad-cove', ops: [{ op: 'delete', parts: [9] }] })).error), /op 0 \(delete\): no part 9/);
	const c = await call('combine_marks', { a: 'quad-cove', b: 'shear-a', op: 'subtract', transform: { scale: 0.5 } });
	assert.equal(c.json.checks.name, 'quad-cove-subtract-shear-a');
	assert.equal(c.images.length, 1);
});

test('build_social_pack: writes the folder, and a preview of each style', async () => {
	const r = await call('build_social_pack', { mark: 'hex-gem', name: 'Hexa', platforms: ['x-header'], styles: ['minimal', 'bold'] });
	assert.equal(r.json.dir, path.join(dir, 'hexa-social'));
	assert.ok(r.json.files.includes('bold/x-header.png'));
	assert.equal(r.images.length, 2);
	assert.ok(r.images.every((/** @type {{ width: number }} */ i) => i.width <= 800));
	assert.match(/** @type {string} */ ((await call('build_social_pack', { mark: 'hex-gem', platforms: ['myspace'] })).error), /myspace/);
});

test('find_marks: words and filters; no arguments lists the facets', async () => {
	const fox = await call('find_marks', { query: 'fox', limit: 3 });
	assert.ok(fox.json.marks.every((/** @type {{ name: string }} */ m) => / Fox\b|^Fox\b/.test(m.name)));
	assert.equal(fox.json.marks.length, 3);
	assert.ok(fox.json.total >= 3);
	const k = await call('find_marks', { style: 'badge', letter: 'k' });
	assert.ok(k.json.marks.length && k.json.marks.every((/** @type {{ style: string, letter: string }} */ m) => m.style === 'badge' && m.letter === 'K'));
	const facets = await call('find_marks', {});
	assert.ok(facets.json.facets.styles.letter > 0);
	assert.ok(facets.json.facets.tags.round > 0);
	assert.equal((await call('find_marks', { query: 'zzqx' })).json.total, 0);
});

test('findMarks searches as the board does: synonyms, phrases, plurals, filler words left out', () => {
	const r = findMarks('a logo for a fox', { limit: 1 });
	assert.equal(r.marks[0].slug, 'track-fox-tail');
	assert.equal(r.total, findMarks('fox').total);
	// UK and US trades, a two-word phrase and its plural
	assert.deepEqual(findMarks('solicitor').marks.map((m) => m.slug), findMarks('attorney').marks.map((m) => m.slug));
	// Drop 19's Umbrella House (insurance, real estate, mortgage brokers) leads since Drop 19
	assert.deepEqual(findMarks('estate agents', { limit: 3 }).marks.map((m) => m.slug), ['umbrella-house', 'iso-duplex', 'iso-stair-door']);
	// every word must be found
	assert.equal(findMarks('fox zzqx').total, 0);
});

test('get_mark: the SVG, a PNG when sized, and a file (its path, not the SVG) when asked', async () => {
	const r = await call('get_mark', { mark: 'Hex Gem', color: '#ff5c3a', size: 64, out: 'out/hex.png' });
	assert.equal(r.json.slug, 'hex-gem');
	assert.equal(r.json.licence, 'CC0-1.0');
	assert.equal(r.json.svg, undefined);
	assert.equal(r.json.file, path.join(dir, 'out/hex.png'));
	assert.match((await call('get_mark', { mark: 'Hex Gem', color: '#ff5c3a' })).json.svg, /fill="#FF5C3A"/i);
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

test('build_brand_kit: writes the folder and returns its path and the brand sheet', async () => {
	const r = await call('build_brand_kit', { mark: 'hex-gem', name: 'Hexa Labs', color: '#ff5c3a', font: 'space-grotesk', tagline: 'Labs', styles: ['pattern'], platforms: ['x-avatar'] });
	assert.equal(r.json.dir, path.join(dir, 'hexa-labs-kit'));
	assert.equal(r.json.colors.primary, '#ff5c3a');
	assert.ok(r.json.files.includes('social/pattern/x-avatar.png'));
	assert.equal(r.images.length, 1);
	for (const f of ['brand.json', 'brand-sheet.png', 'favicon/favicon.ico', 'colors/palette.css']) assert.ok(fs.existsSync(path.join(r.json.dir, f)), f);
	assert.equal(r.json.count, r.json.files.length);
	assert.match(/** @type {string} */ ((await call('build_brand_kit', { mark: 'hex-gem', font: 'comic-sans' })).error), /font/);
});

test('render_mockup: an image, and a file when asked', async () => {
	const r = await call('render_mockup', { mark: 'hex-gem', object: 'card', name: 'Hexa', size: 600, out: 'card.svg' });
	assert.equal(r.images.length, 1);
	assert.equal(Math.max(r.images[0].width, r.images[0].height), 600);
	assert.match(fs.readFileSync(path.join(dir, 'card.svg'), 'utf8'), /^<svg/);
	assert.match(/** @type {string} */ ((await call('render_mockup', { mark: 'hex-gem', object: 'card', layout: 'nope' })).error), /card layouts: pair/);
	assert.ok((await call('render_mockup', { mark: 'hex-gem', object: 'spaceship' })).error);
});

test('render_cover: an image at the aspect asked, and a file when asked', async () => {
	const r = await call('render_cover', { mark: 'hex-gem', recipe: 'aurora', title: 'Introducing Hexa', aspect: '1:1', width: 400, out: 'cover.png' });
	assert.deepEqual(r.images, [{ width: 400, height: 400 }]);
	assert.deepEqual(pngSize(fs.readFileSync(path.join(dir, 'cover.png'))), { width: 400, height: 400 });
	assert.ok((await call('render_cover', { mark: 'hex-gem', aspect: 'wide' })).error);
});
