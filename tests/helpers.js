/**
 * Test helpers: the fixtures, and live marks from the bundled index (built
 * from packages/marks/data, so the tests don't depend on the svg folder).
 */

import fs from 'node:fs';
import { loadIndex } from '../src/similar/store.js';

/** A fixture's path. */
export const fixturePath = (/** @type {string} */ name) => new URL(`fixtures/${name}.svg`, import.meta.url).pathname;

/** A fixture's text. */
export const fixture = (/** @type {string} */ name) => fs.readFileSync(fixturePath(name), 'utf8');

/** A live mark's SVG by slug. */
export function live(/** @type {string} */ slug) {
	const m = loadIndex().marks.find((x) => x.slug === slug);
	if (!m) throw new Error(`no live mark ${slug}`);
	return m.svg;
}

/** The ids a report found. */
export const ids = (/** @type {{ findings: { id: string }[] }} */ r) => r.findings.map((f) => f.id);
