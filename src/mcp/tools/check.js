/**
 * @module logomarks/mcp/tools/check
 *
 * `check_mark`: every house rule on one SVG or a folder of them, with
 * finding ids, messages and boxes; and the safe refit, when asked.
 */

import fs from 'node:fs';
import { z } from 'zod';
import { check, fix } from '../../checks/index.js';
import { schema, readSvgs } from '../inputs.js';
import { result, text } from '../content.js';

/** @type {import('../index.js').Tool<import('./check.js').CheckInput>} */
export const tool = {
	name: 'check_mark',
	title: 'Check a mark against the house rules',
	description: [
		'Measure an SVG logomark the way the Logomarks set is checked; reading SVG code can\'t show these.',
		'Errors: viewbox, size, centre, clipped (fit to the 512 canvas, longest side 448, centred: fix=true refits), markup (filled paths only), empty, speck, sliver, pinhole (stray pieces and holes under 60 / 30 sq units, each with its box).',
		'Warnings: fill (currentColor), precision (one decimal), thin and narrow-gap (under 10 units: lost at 32 px), uneven-gaps (keep one gap, 22, or a clear 1:2).',
		'Returns { ok, passed, failed, marks: [{ name, ok, errors, warnings, size, findings: [{ id, severity, message, box }] }] }.',
		'Fix every error, read every warning, then run similar_marks and review_sheet. Re-check until ok.',
	].join(' '),
	inputSchema: {
		svg: schema.svg,
		svgName: schema.svgName,
		paths: schema.paths,
		fix: z.boolean().optional().describe('Refit to the grid (the only automatic fix): files are rewritten in place; for svg text the refitted SVG is returned. Default false.'),
		strict: schema.strict,
		ignore: schema.ignore,
	},
	annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
	async run({ svg, svgName, paths, fix: refit = false, strict = false, ignore = [] }, { cwd }) {
		const marks = readSvgs({ svg, svgName, paths }, cwd).map(({ name, file, svg: source }) => {
			let report = check(source, { name, ignore, strict });
			const fitted = refit ? fix(source, report) : null;
			if (fitted) {
				if (file) fs.writeFileSync(file, fitted);
				report = check(fitted, { name, ignore, strict });
			}
			return { name, ...(file && { file }), fixed: Boolean(fitted), ...report, ...(fitted && !file && { svg: fitted }) };
		});
		const failed = marks.filter((m) => !m.ok).length;
		return result(text({ ok: !failed, passed: marks.length - failed, failed, marks }));
	},
};
