/**
 * @module logomarks/cli/commands/similar
 *
 * `logomarks similar <file.svg…>`: the nearest live marks, with scores.
 * Over the house threshold a match is too close (look at the two side by
 * side: solid shapes often share an outline); over the near-copy threshold
 * the mark fails.
 */

import fs from 'node:fs';
import { similar } from '../../similar/nearest.js';
import { loadIndex } from '../../similar/store.js';
import { SIMILAR, LETTERS } from '../../rules.js';
import { UsageError } from '../args.js';
import { svgFiles } from '../files.js';
import { style, pad } from '../style.js';

/** What `similar` takes. */
export const spec = { flags: ['json', 'letters'], options: { top: '' } };

/** Verdict labels for the readable output. */
const LABEL = { 'near-copy': style.red('near-copy'), 'too-close': style.yellow('too close'), ok: style.dim('ok       ') };

/**
 * Runs `similar`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 1 when any mark is a near-copy of a live one.
 */
export async function run(args, io) {
	const files = svgFiles(args.positionals);
	const top = Number(args.options.top ?? 5);
	if (!Number.isInteger(top) || top < 1) throw new UsageError('--top takes a whole number');
	const letters = args.flags.has('letters');
	const index = loadIndex();
	const results = [];
	for (const file of files) {
		const matches = await similar(fs.readFileSync(file, 'utf8'), { top, letters, index });
		results.push({ file, ok: !matches.some((m) => m.verdict === 'near-copy'), tooClose: matches.some((m) => m.verdict !== 'ok'), matches });
	}
	const copies = results.filter((r) => !r.ok).length;
	const t = letters ? LETTERS : SIMILAR;
	if (args.flags.has('json')) {
		io.out(JSON.stringify({ ok: !copies, thresholds: { tooClose: t.tooClose, nearCopy: t.nearCopy }, live: index.marks.length, built: index.built, marks: results }, null, 2));
	} else {
		for (const { file, ok, tooClose, matches } of results) {
			io.out(`${!ok ? style.red('✗') : tooClose ? style.yellow('!') : style.green('✓')} ${style.bold(file)}`);
			if (!matches.length) io.out(style.dim('    no knocked-out letter (holes) to compare'));
			for (const m of matches) io.out(`    ${m.score.toFixed(3)}  ${LABEL[m.verdict]}  ${pad(m.slug, 28)} ${style.dim(m.name)}`);
		}
		const close = results.filter((r) => r.ok && r.tooClose).length;
		io.out(`\n${results.length - copies} of ${results.length} not a near-copy of the ${index.marks.length} live marks${close ? `; ${close} too close, look at them side by side` : ''} (too close ≥ ${t.tooClose}, near-copy ≥ ${t.nearCopy})`);
	}
	return copies ? 1 : 0;
}
