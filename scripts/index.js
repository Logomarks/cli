#!/usr/bin/env node
/**
 * Builds the bundled index of live marks (`data/index.bin`) from the
 * Logomarks data: every mark in `marks.json` with its SVG, what it is (tags
 * and collection; style, mood, letter and description from `descriptions.json`;
 * industries from `industries.json`), its outline coverage (the outline signature before its blur), and a letter signature for badges (their holes) and letter or
 * number marks (their ink).
 *
 *   npm run index                      from ../marks/data (the monorepo)
 *   node scripts/index.js <data dir>   from any copy of the data
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { outlineCoverage, letterSignatures } from '../src/similar/signature.js';
import { writeIndex, INDEX_FILE } from '../src/similar/store.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2] ?? path.join(here, '../../marks/data');

/** A badge, whose letter is its holes (every family: Badge, Pixel Badge, Stencil Badge …). */
const isBadge = (/** @type {string} */ slug) => /(^|-)badge-/.test(slug);

/** A JSON file in the data folder. */
const read = (/** @type {string} */ file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));

/** @type {{ slug: string, name: string, collection: string, tags: string[] }[]} */
const list = read('marks.json');
/** @type {Record<string, { style: string, mood: string[], letter?: string, description: string }>} */
const descriptions = read('descriptions.json');
/** @type {Record<string, string[]>} */
const industries = fs.existsSync(path.join(dir, 'industries.json')) ? read('industries.json') : {};
const marks = [], coverages = [], letters = [];
const started = Date.now();
for (const m of list) {
	const file = path.join(dir, 'svg', `${m.slug}.svg`);
	if (!fs.existsSync(file)) continue;
	const svg = fs.readFileSync(file, 'utf8').trim();
	const d = descriptions[m.slug];
	if (!d) throw new Error(`no description for "${m.slug}" in descriptions.json`);
	const about = { tags: m.tags, collection: m.collection, style: d.style, mood: d.mood, ...(d.letter && { letter: d.letter }), description: d.description, industries: industries[m.slug] ?? [] };
	const i = marks.push({ slug: m.slug, name: m.name, svg, ...about }) - 1;
	coverages.push(await outlineCoverage(svg));
	const lettery = m.tags.includes('letter') || m.tags.includes('number');
	if (isBadge(m.slug) || lettery) {
		const { holes, ink } = await letterSignatures(svg);
		if (isBadge(m.slug) && holes) letters.push({ mark: i, kind: /** @type {const} */ ('hole'), sig: holes });
		else if (lettery) letters.push({ mark: i, kind: /** @type {const} */ ('ink'), sig: ink });
	}
}
const bytes = writeIndex({ marks, coverages, letters });
console.log(`${marks.length} marks, ${letters.length} letters → ${path.relative(process.cwd(), fileURLToPath(INDEX_FILE))} (${(bytes / 1024).toFixed(0)} KB, ${((Date.now() - started) / 1000).toFixed(1)} s)`);
