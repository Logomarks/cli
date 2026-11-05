import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio } from '@arraypress/color-utils';
import { kit, social, loadMark } from '../src/index.js';
import { pngSize } from './helpers.js';

const k = await kit({ mark: loadMark('hex-gem'), name: 'Hexa Labs', color: '#FF5C3A', font: 'space-grotesk', tagline: 'Things in hexes', styles: ['bold'], platforms: ['x-header', 'x-avatar'] });
const file = (/** @type {string} */ p) => {
	const f = k.files.get(p);
	if (f === undefined) throw new Error(`no ${p} in the kit`);
	return f;
};
const png = (/** @type {string} */ p) => pngSize(/** @type {Uint8Array} */ (file(p)));

test('the kit has every file brand.json lists, and nothing else', () => {
	assert.deepEqual([...k.brand.files].sort(), [...k.files.keys()].sort());
	for (const p of ['mark/svg/mark.svg', 'favicon/favicon.ico', 'favicon/apple-touch-icon.png', 'lockup/horizontal-on-light.svg', 'colors/palette.css', 'colors/tokens.json', 'brand-sheet.png', 'README.md'])
		assert.ok(k.brand.files.includes(p), p);
});

test('the mark comes at every size, and on light, dark and colour, drawn by resvg', () => {
	for (const size of [64, 256, 1024, 2048]) assert.deepEqual(png(`mark/png/mark-primary-${size}.png`), { width: size, height: size });
	assert.deepEqual(png('mark/png/mark-on-dark-1024.png'), { width: 1024, height: 1024 });
	assert.match(String(file('mark/svg/mark.svg')), /fill="currentColor"/);
});

test('favicons: a three-size .ico, a 180 apple-touch-icon, a manifest', () => {
	const ico = Buffer.from(/** @type {Uint8Array} */ (file('favicon/favicon.ico')));
	assert.equal(ico.readUInt16LE(4), 3);
	assert.deepEqual(png('favicon/apple-touch-icon.png'), { width: 180, height: 180 });
	assert.equal(JSON.parse(String(file('favicon/site.webmanifest'))).theme_color, '#ff5c3a');
});

test('the social pack inside it, and the sheet', () => {
	assert.deepEqual(png('social/bold/x-header.png'), { width: 1500, height: 500 });
	assert.deepEqual(png('social/bold/x-avatar.png'), { width: 400, height: 400 });
	assert.deepEqual(png('social/og-image.png'), { width: 1200, height: 630 });
	assert.ok(!k.files.has('social/bold/x-header.animated.svg'), 'animated only on request');
	assert.equal(png('brand-sheet.png').width, 1600);
	assert.ok(png('brand-sheet.png').height > 2000);
});

// The palette is @arraypress/brand-kit's (color-utils' OKLCH scale), so its hex values differ slightly from the CLI's 0.1 kit.
test('brand.json: the colours, the font, the mark’s credit', () => {
	const b = JSON.parse(String(file('brand.json')));
	assert.equal(b.name, 'Hexa Labs');
	assert.equal(b.tagline, 'Things in hexes');
	assert.deepEqual(b.mark, { name: 'Hex Gem', url: 'https://logomarks.ai/marks/hex-gem', license: 'CC0-1.0' });
	assert.equal(b.font.name, 'Space Grotesk');
	assert.equal(b.font.license, 'OFL-1.1');
	assert.equal(b.colors.primary, '#ff5c3a');
	assert.ok(contrastRatio(b.colors.text.primaryOnLight, b.colors.paper) >= 4.5);
	assert.match(String(file('colors/palette.css')), /--brand-primary: #ff5c3a;/);
	assert.doesNotMatch(String(file('lockup/stacked-on-dark.svg')), /<text/);
});

test('the social pack on its own: images by platform name, in a style', async () => {
	const pack = await social({ mark: loadMark('hex-gem'), name: 'Hexa', platforms: ['bluesky'], styles: ['minimal'] });
	const images = [...pack.files.keys()].filter((f) => f.endsWith('.png') && f.startsWith('minimal/'));
	assert.deepEqual(images.sort(), ['minimal/bluesky-avatar.png', 'minimal/bluesky-banner.png']);
	assert.deepEqual(pngSize(/** @type {Uint8Array} */ (pack.files.get('minimal/bluesky-banner.png'))), { width: 3000, height: 1000 });
});
