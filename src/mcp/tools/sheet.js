/**
 * @module logomarks/mcp/tools/sheet
 *
 * `review_sheet`: review cards for a set of marks, as an image to look at.
 */

import { z } from 'zod';
import { sheet } from '../../sheet/index.js';
import { writeFile } from '../../util/files.js';
import { schema, readSvgs, resolvePath } from '../inputs.js';
import { result, text, image } from '../content.js';

/** @type {import('../index.js').Tool<import('./sheet.js').SheetInput>} */
export const tool = {
	name: 'review_sheet',
	title: 'Review sheet',
	description: [
		'Render review cards for one or more marks as a PNG, and return it to look at.',
		'Each card: the mark large on dark and light with its findings boxed and numbered, at 32 and 16 px, and beside its three nearest live marks (amber: too close, compare by eye; red: a near-copy, cut it).',
		'Look at every card before handing marks over: the same trick as an existing mark is cut even when it scores low.',
		'Also returns each mark\'s check summary and nearest marks as JSON.',
	].join(' '),
	inputSchema: {
		svg: schema.svg,
		svgName: schema.svgName,
		paths: schema.paths,
		strict: schema.strict,
		ignore: schema.ignore,
		out: z.string().optional().describe('Also write the PNG here (relative to the working folder).'),
	},
	annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
	async run({ svg, svgName, paths, strict = false, ignore = [], out }, { cwd }) {
		const s = await sheet(readSvgs({ svg, svgName, paths }, cwd), { strict, ignore });
		const file = out && resolvePath(cwd, out);
		if (file) writeFile(file, s.png);
		const marks = s.marks.map(({ name, report, matches }) => ({
			name, ok: report.ok, errors: report.errors, warnings: report.warnings,
			findings: report.findings.map((f) => f.id),
			nearest: matches.map((m) => ({ slug: m.slug, score: m.score, verdict: m.verdict })),
		}));
		return result(text({ ...(file && { file }), marks }), image(s.png));
	},
};
