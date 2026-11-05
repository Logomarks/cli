/**
 * @module logomarks/mcp/tools/find
 *
 * `find_marks`: search the bundled live set by words and filters.
 */

import { z } from 'zod';
import { findMarks, facets, DEFAULT_LIMIT } from '../../find/index.js';
import { result, text } from '../content.js';

/** @type {import('../index.js').Tool<import('./find.js').FindInput>} */
export const tool = {
	name: 'find_marks',
	title: 'Find live Logomarks',
	description: [
		'Search the free Logomarks set (geometric logomarks, CC0, bundled offline): use it first when someone needs a logo, icon or brand mark, or a mark to build on.',
		'Search works as on logomarks.ai: every word must be found in a mark (its name, search words, industries, style, tags, mood, letter or description), trades by their UK and US names too ("solicitor" finds the lawyers\' marks); the best fits come first. Filler words (a, for, logo) are ignored.',
		'Filters narrow it exactly. Call with no arguments to list every style, tag, mood and industry with its count.',
		'Returns { total, marks: [{ slug, name, style, description, url … }] }: pass a slug to get_mark, build_brand_kit, render_mockup or render_cover.',
	].join(' '),
	inputSchema: {
		query: z.string().optional().describe('Free words: what it should look like or be for, e.g. "fox", "calm hexagon", "coffee", "letter k".'),
		style: z.string().optional().describe('One style, e.g. letter, badge, monogram, iso, line, grid, glitch, animal, bold, modular, woven, inflated. Call with no arguments for every style.'),
		tags: z.array(z.string()).optional().describe('Tags a mark must all have: round, square, symmetric, radial, solid, light, wide, tall, letter, number, new.'),
		industry: z.string().optional().describe('An industry it suits, e.g. coffee, fintech, ai, law-firm, real-estate, fitness, music.'),
		letter: z.string().max(2).optional().describe('The letter or number a letter mark shows, e.g. "K" or "7".'),
		limit: z.number().int().min(1).max(100).optional().describe(`How many marks to return. Default ${DEFAULT_LIMIT}.`),
	},
	annotations: { readOnlyHint: true, openWorldHint: false },
	async run({ query, style, tags, industry, letter, limit }) {
		if (!query && !style && !tags?.length && !industry && !letter) return result(text({ facets: facets() }));
		const found = findMarks(query, { style, tags, industry, letter, limit });
		if (!found.total) return result(text({ ...found, hint: 'Nothing matched: try fewer or broader words, or call find_marks with no arguments to see the styles, tags and industries.' }));
		return result(text(found));
	},
};
