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
		'Search the free Logomarks set (1,500+ geometric logomarks, CC0, bundled offline) for marks to use or build on.',
		'Words are matched against each mark\'s slug, name, style, tags, mood, letter, industries and description; marks matching the most words come first.',
		'Filters narrow it exactly. Call with no arguments to list every style, tag, mood and industry with its count.',
		'Returns slugs to pass to get_mark, brand_kit, mockup or cover; each has a description and its page on logomarks.ai.',
	].join(' '),
	inputSchema: {
		query: z.string().optional().describe('Free words: what it should look like or be for, e.g. "fox", "calm hexagon", "coffee", "letter k".'),
		style: z.string().optional().describe('One style, e.g. letter, badge, monogram, iso, line, grid, glitch, animal, bold, modular, woven, inflated.'),
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
