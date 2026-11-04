/**
 * @module logomarks/find
 *
 * Searches the bundled live set: free words (scored against each mark's
 * slug, name, style, tags, mood, letter, industries and description), and
 * exact filters (style, tags, industry, letter). The vocabulary to filter
 * by comes from the set itself (`facets`).
 */

import { loadIndex } from '../similar/store.js';
import { MARK_URL } from '../brand/mark.js';

/** How much a word scores where it is found. */
const WEIGHT = { name: 4, label: 3, description: 1 };

/** Words a brief is full of that say nothing about a mark. */
const STOP = new Set(['a', 'an', 'and', 'the', 'for', 'of', 'with', 'in', 'on', 'to', 'my', 'our', 'logo', 'logos', 'mark', 'marks', 'icon', 'brand', 'company', 'something', 'like']);

/** How many marks a search returns when no limit is given. */
export const DEFAULT_LIMIT = 20;

/**
 * Text as lower-case words.
 *
 * @param {string} s The text.
 * @returns {string[]} Its words.
 */
const words = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * How well one query word fits a mark: the best place it is found.
 *
 * @param {string} word The word.
 * @param {import('../similar/store.js').IndexedMark} m The mark.
 * @returns {number} Its score (0 when it isn't found).
 */
function wordScore(word, m) {
	const starts = (/** @type {string[]} */ list) => list.some((w) => w === word || (word.length > 2 && w.startsWith(word)));
	if (starts(words(`${m.slug} ${m.name}`))) return WEIGHT.name;
	if (starts([m.style, ...m.tags, ...m.mood, ...m.industries.flatMap(words), ...(m.letter ? [m.letter.toLowerCase()] : [])])) return WEIGHT.label;
	return starts(words(m.description)) ? WEIGHT.description : 0;
}

/**
 * Whether a mark passes the exact filters.
 *
 * @param {import('../similar/store.js').IndexedMark} m The mark.
 * @param {import('./index.js').FindOptions} o The filters.
 * @returns {boolean} Whether it passes.
 */
function passes(m, { style, tags = [], industry, letter }) {
	if (style && m.style !== style.toLowerCase()) return false;
	if (tags.some((t) => !m.tags.includes(t.toLowerCase()))) return false;
	if (industry && !m.industries.includes(industry.toLowerCase())) return false;
	return !letter || m.letter?.toLowerCase() === letter.toLowerCase();
}

/**
 * A mark as a search result: what it is, without its drawing.
 *
 * @param {import('../similar/store.js').IndexedMark} m The mark.
 * @returns {import('./index.js').Found} The result.
 */
const found = ({ slug, name, style, tags, mood, letter, industries, description }) =>
	({ slug, name, style, tags, mood, ...(letter && { letter }), industries, description, url: MARK_URL + slug });

/**
 * Searches the live set. A mark matches when any query word is found in it;
 * the marks with the most words found come first, then by where (slug or
 * name, then labels, then description). Filler words (`a`, `for`, `logo` …)
 * are left out. With no words, the filtered marks come back in the set's
 * order.
 *
 * @param {string} [query] Free words (`fox`, `calm letter k`, `coffee`).
 * @param {import('./index.js').FindOptions} [o] Filters and the limit.
 * @returns {import('./index.js').FindResult} The total that matched and the first `limit`.
 */
export function findMarks(query = '', { index = loadIndex(), limit = DEFAULT_LIMIT, ...filters } = {}) {
	const q = [...new Set(words(query))].filter((w) => !STOP.has(w));
	const hits = [];
	for (const m of index.marks) {
		if (!passes(m, filters)) continue;
		const scores = q.map((w) => wordScore(w, m)).filter(Boolean);
		if (q.length && !scores.length) continue;
		hits.push({ m, matched: scores.length, score: scores.reduce((a, b) => a + b, 0) });
	}
	hits.sort((a, b) => b.matched - a.matched || b.score - a.score);
	return { total: hits.length, marks: hits.slice(0, limit).map((h) => found(h.m)) };
}

/**
 * The values the filters take, with how many marks have each, most first.
 *
 * @param {import('../similar/store.js').MarkIndex} [index] The live set.
 * @returns {import('./index.js').Facets} Styles, tags, moods and industries.
 */
export function facets(index = loadIndex()) {
	/** @type {Record<keyof import('./index.js').Facets, Map<string, number>>} */
	const counts = { styles: new Map(), tags: new Map(), moods: new Map(), industries: new Map() };
	const add = (/** @type {Map<string, number>} */ map, /** @type {string[]} */ values) => values.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1));
	for (const m of index.marks) {
		add(counts.styles, [m.style]);
		add(counts.tags, m.tags);
		add(counts.moods, m.mood);
		add(counts.industries, m.industries);
	}
	const sorted = (/** @type {Map<string, number>} */ map) => Object.fromEntries([...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
	return { styles: sorted(counts.styles), tags: sorted(counts.tags), moods: sorted(counts.moods), industries: sorted(counts.industries) };
}
