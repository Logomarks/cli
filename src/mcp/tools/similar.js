/**
 * @module logomarks/mcp/tools/similar
 *
 * `similar_marks`: the nearest live marks to one SVG or a folder of them.
 */

import { z } from 'zod';
import { similar } from '../../similar/nearest.js';
import { loadIndex } from '../../similar/store.js';
import { SIMILAR, LETTERS } from '../../rules.js';
import { schema, readSvgs } from '../inputs.js';
import { result, text } from '../content.js';

/** @type {import('../index.js').Tool<import('./similar.js').SimilarInput>} */
export const tool = {
	name: 'similar_marks',
	title: 'Find the nearest live marks',
	description: [
		'Compare a new mark with every live Logomark, by outline (rotations and mirrors included).',
		`A score of ${SIMILAR.tooClose}+ is too close (compare the two by eye: solid shapes often share an outline); ${SIMILAR.nearCopy}+ is a near-copy and fails.`,
		`letters=true compares a badge's knocked-out letter instead (${LETTERS.tooClose} / ${LETTERS.nearCopy}).`,
		'Returns { ok, thresholds, marks: [{ name, ok, tooClose, matches: [{ slug, name, score, verdict }] }] }. ok is false when any mark is a near-copy.',
	].join(' '),
	inputSchema: {
		svg: schema.svg,
		svgName: schema.svgName,
		paths: schema.paths,
		top: z.number().int().min(1).max(20).optional().describe('How many nearest marks per mark. Default 5.'),
		letters: z.boolean().optional().describe("Compare a badge's knocked-out letter (its holes) instead of its outline. Default false."),
	},
	annotations: { readOnlyHint: true, openWorldHint: false },
	async run({ svg, svgName, paths, top = 5, letters = false }, { cwd }) {
		const index = loadIndex();
		const marks = [];
		for (const { name, file, svg: source } of readSvgs({ svg, svgName, paths }, cwd)) {
			const matches = await similar(source, { top, letters, index });
			marks.push({ name, ...(file && { file }), ok: !matches.some((m) => m.verdict === 'near-copy'), tooClose: matches.some((m) => m.verdict !== 'ok'), matches });
		}
		const t = letters ? LETTERS : SIMILAR;
		return result(text({ ok: marks.every((m) => m.ok), thresholds: { tooClose: t.tooClose, nearCopy: t.nearCopy }, live: index.marks.length, marks }));
	},
};
