/**
 * @module logomarks/cli/commands/sheet
 *
 * `logomarks sheet <file.svg…> -o sheet.png`: a review card per mark, for
 * an AI or a person to look at.
 */

import fs from 'node:fs';
import { sheet } from '../../sheet/index.js';
import { svgFiles, slugOf } from '../files.js';
import { style } from '../style.js';

/** What `sheet` takes. */
export const spec = { flags: ['json', 'strict'], options: { out: 'o', ignore: '' } };

/**
 * Runs `sheet`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 1 when any mark fails its check or is a near-copy of a live mark.
 */
export async function run(args, io) {
	const files = svgFiles(args.positionals);
	const out = args.options.out ?? 'sheet.png';
	const marks = files.map((file) => ({ name: slugOf(file), svg: fs.readFileSync(file, 'utf8') }));
	const s = await sheet(marks, { strict: args.flags.has('strict'), ignore: (args.options.ignore ?? '').split(',').filter(Boolean) });
	fs.writeFileSync(out, s.png);
	const rows = s.marks.map((m, i) => ({
		file: files[i],
		ok: m.report.ok,
		errors: m.report.errors,
		warnings: m.report.warnings,
		nearest: m.matches.map(({ slug, score, verdict }) => ({ slug, score, verdict })),
	}));
	const failing = rows.filter((r) => !r.ok || r.nearest.some((n) => n.verdict === 'near-copy')).length;
	if (args.flags.has('json')) io.out(JSON.stringify({ ok: !failing, file: out, marks: rows }, null, 2));
	else io.out(`${failing ? style.red('✗') : style.green('✓')} wrote ${style.bold(out)}: ${rows.length} card${rows.length === 1 ? '' : 's'}${failing ? `, ${failing} failing or a near-copy` : ''}. Look at it.`);
	return failing ? 1 : 0;
}
