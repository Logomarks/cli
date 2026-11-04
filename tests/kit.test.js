import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kit, loadMark, contrast } from '../src/index.js';
import { PNG_SIZES } from '../src/kit/index.js';
import { pngSize } from './helpers.js';

const k = await kit({ mark: loadMark('hex-gem'), name: 'Hexa Labs', color: '#FF5C3A', font: 'space-grotesk' });
const file = (/** @type {string} */ p) => {
	const f = k.files.find((x) => x.path === p);
	if (!f) throw new Error(`no ${p} in the kit`);
	return f.data;
};

test('the kit has every file brand.json lists, and nothing else', () => {
	assert.deepEqual([...k.brand.files].sort(), k.files.map((f) => f.path).sort());
	for (const p of ['mark/mark.svg', 'favicon/favicon.ico', 'favicon/apple-touch-icon.png', 'lockup/horizontal-on-light.svg', 'colors/palette.css', 'brand-sheet.png'])
		assert.ok(k.brand.files.includes(p), p);
});

test('the mark comes at every size, and on light and dark', () => {
	for (const size of PNG_SIZES) assert.deepEqual(pngSize(/** @type {Uint8Array} */ (file(`mark/png/mark-${size}.png`))), { width: size, height: size });
	assert.deepEqual(pngSize(/** @type {Uint8Array} */ (file('mark/png/mark-on-dark-1024.png'))), { width: 1024, height: 1024 });
	assert.match(String(file('mark/mark.svg')), /fill="currentColor"/);
});

test('favicons: a three-size .ico, a 180 apple-touch-icon, a manifest', () => {
	const ico = Buffer.from(/** @type {Uint8Array} */ (file('favicon/favicon.ico')));
	assert.equal(ico.readUInt16LE(4), 3);
	assert.deepEqual(pngSize(/** @type {Uint8Array} */ (file('favicon/apple-touch-icon.png'))), { width: 180, height: 180 });
	assert.equal(JSON.parse(String(file('favicon/site.webmanifest'))).theme_color, '#FF5C3A');
});

test('social sizes and the sheet', () => {
	assert.deepEqual(pngSize(/** @type {Uint8Array} */ (file('social/avatar-400x400.png'))), { width: 400, height: 400 });
	assert.deepEqual(pngSize(/** @type {Uint8Array} */ (file('social/x-header-1500x500.png'))), { width: 1500, height: 500 });
	assert.deepEqual(pngSize(/** @type {Uint8Array} */ (file('social/og-1200x630.png'))), { width: 1200, height: 630 });
	assert.equal(pngSize(k.sheet).width, 1600);
	assert.ok(pngSize(k.sheet).height > 2000);
});

test('brand.json: the colours, the font, the mark’s licence', () => {
	const b = JSON.parse(String(file('brand.json')));
	assert.equal(b.name, 'Hexa Labs');
	assert.equal(b.mark.licence, 'CC0-1.0');
	assert.equal(b.font.name, 'Space Grotesk');
	assert.equal(b.font.licence, 'OFL-1.1');
	assert.ok(contrast(b.colors.text.primaryOnLight, b.colors.paper) >= 4.5);
	assert.match(String(file('colors/palette.css')), /--brand-primary: #FF5C3A;/);
	assert.doesNotMatch(String(file('lockup/stacked-on-dark.svg')), /<text/);
});
