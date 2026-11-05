/**
 * @module logomarks/find
 *
 * Searches the bundled live set the way the board on logomarks.ai does (its
 * packed @arraypress/search index): every word must be found, typed at the
 * start of a word or as a synonym (UK and US trades: "solicitor" finds the
 * lawyers' marks), best first (a word of the name or a search word, then an
 * industry, then elsewhere). Filler words (`a`, `for`, `logo` …) are left out.
 * Exact filters (style, tags, industry, letter) narrow it; the vocabulary to
 * filter by comes from the set itself (`facets`).
 */

import { unpack, facets as count } from '@arraypress/search';
import { loadIndex } from '../similar/store.js';
import { MARK_URL } from '../brand/mark.js';

/** Words a brief is full of that say nothing about a mark. */
const STOP = ['a', 'an', 'and', 'the', 'for', 'of', 'with', 'in', 'on', 'to', 'my', 'our', 'logo', 'logos', 'mark', 'marks', 'icon', 'brand', 'company', 'something', 'like'];

/** How many marks a search returns when no limit is given. */
export const DEFAULT_LIMIT = 20;

/** Each index's search, built once. */
const searches = new WeakMap();

/**
 * An index's search (the board's, with filler words left out).
 *
 * @param {import('../similar/store.js').MarkIndex} index The live set.
 * @returns {import('@arraypress/search').Search<Record<string, unknown>>} Its search.
 * @throws {Error} When the index has no search (only the bundled one does).
 */
function searchOf(index) {
	let s = searches.get(index);
	if (!s) {
		if (!index.search) throw new Error('this index has no search: findMarks needs the bundled index (npm run index)');
		searches.set(index, (s = unpack(index.search, { stopWords: STOP })));
	}
	return s;
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
 * Searches the live set as the board does: a mark matches when every query
 * word (or synonym phrase) is found in it; the best come first, ties in the
 * board's order. With no words, the filtered marks come back in that order.
 *
 * @param {string} [query] Free words (`fox`, `calm letter k`, `solicitor`).
 * @param {import('./index.js').FindOptions} [o] Filters and the limit.
 * @returns {import('./index.js').FindResult} The total that matched and the first `limit`.
 */
export function findMarks(query = '', { index = loadIndex(), limit = DEFAULT_LIMIT, ...filters } = {}) {
	const r = searchOf(index).search(query, { filter: (_, i) => passes(index.marks[i], filters), limit });
	return { total: r.total, marks: r.hits.map((h) => found(index.marks[h.index])) };
}

/**
 * The values the filters take, with how many marks have each, most first.
 *
 * @param {import('../similar/store.js').MarkIndex} [index] The live set.
 * @returns {import('./index.js').Facets} Styles, tags, moods and industries.
 */
export function facets(index = loadIndex()) {
	const { style, tags, mood, industries } = count(index.marks, ['style', 'tags', 'mood', 'industries']);
	return { styles: style, tags, moods: mood, industries };
}
