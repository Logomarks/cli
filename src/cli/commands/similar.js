/**
 * @module logomarks/cli/commands/similar
 *
 * `logomarks similar <file.svg…>`: the nearest live marks, with scores.
 * Over the house threshold a match is too close (look at the two side by
 * side: solid shapes often share an outline); over the near-copy threshold
 * the mark fails. `--against <dir>` compares with a folder of SVGs instead of
 * the bundled index (the site's svg folder while a batch is drawn), `--each`
 * with the other candidates too, and `--all <data dir>` writes "More like this"
 * for a whole set (similar.json).
 */

import fs from 'node:fs';
import path from 'node:path';
import { nearestAll } from '@arraypress/marks-kit/similar';
import { similar } from '../../similar/nearest.js';
import { loadIndex } from '../../similar/store.js';
import { folderIndex, indexOf, joinIndexes } from '../../similar/folder.js';
import { outlineCoverage } from '../../similar/signature.js';
import { slugOf } from '../files.js';
import { SIMILAR, LETTERS } from '../../rules.js';
import { UsageError } from '../args.js';
import { svgFiles } from '../files.js';
import { style, pad } from '../style.js';

/** What `similar` takes. */
export const spec = { flags: ['json', 'letters', 'each'], options: { top: '', against: '', all: '', out: '' } };

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
	if (args.options.all) return all(args.options.all, args.options.out, io);
	const files = svgFiles(args.positionals);
	const top = Number(args.options.top ?? 5);
	if (!Number.isInteger(top) || top < 1) throw new UsageError('--top takes a whole number');
	const letters = args.flags.has('letters');
	const base = args.options.against ? await folderIndex(args.options.against, { letters }) : loadIndex();
	const index = args.flags.has('each') && files.length > 1 ? joinIndexes(base, await indexOf(files, { letters, candidate: true })) : base;
	const results = [];
	for (const file of files) {
		const matches = await similar(fs.readFileSync(file, 'utf8'), { top, letters, index, exclude: args.flags.has('each') ? slugOf(file) : undefined });
		results.push({ file, ok: !matches.some((m) => m.verdict === 'near-copy'), tooClose: matches.some((m) => m.verdict !== 'ok'), matches });
	}
	const copies = results.filter((r) => !r.ok).length;
	const t = letters ? LETTERS : SIMILAR;
	if (args.flags.has('json')) {
		io.out(JSON.stringify({ ok: !copies, thresholds: { tooClose: t.tooClose, nearCopy: t.nearCopy }, live: base.marks.length, built: base.built, marks: results }, null, 2));
	} else {
		for (const { file, ok, tooClose, matches } of results) {
			io.out(`${!ok ? style.red('✗') : tooClose ? style.yellow('!') : style.green('✓')} ${style.bold(file)}`);
			if (!matches.length) io.out(style.dim('    no knocked-out letter (holes) to compare'));
			for (const m of matches) io.out(`    ${m.score.toFixed(3)}  ${LABEL[m.verdict]}  ${pad(m.slug + (m.candidate ? ' *' : ''), 28)} ${style.dim(m.candidate ? 'another candidate' : m.name)}`);
		}
		const close = results.filter((r) => r.ok && r.tooClose).length;
		io.out(`\n${results.length - copies} of ${results.length} not a near-copy of the ${base.marks.length} ${args.options.against ? 'marks' : 'live marks'}${index !== base ? ' or each other' : ''}${close ? `; ${close} too close, look at them side by side` : ''} (too close ≥ ${t.tooClose}, near-copy ≥ ${t.nearCopy})`);
	}
	return copies ? 1 : 0;
}

/**
 * `similar --all <data dir>`: every mark's 8 nearest ("More like this"), by overlap of 48 px renders nudged for the
 * same style and shared moods, from the folder's marks.json, descriptions.json and svg/.
 *
 * @param {string} dir The data folder.
 * @param {string | undefined} out Where to write the JSON (default: stdout).
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code.
 */
async function all(dir, out, io) {
	const read = (/** @type {string} */ f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
	/** @type {{ slug: string }[]} */
	const marks = read('marks.json');
	/** @type {Record<string, { style?: string, mood?: string[] }>} */
	const desc = fs.existsSync(path.join(dir, 'descriptions.json')) ? read('descriptions.json') : {};
	const set = [];
	for (const m of marks) set.push({ slug: m.slug, alpha: await outlineCoverage(fs.readFileSync(path.join(dir, 'svg', `${m.slug}.svg`), 'utf8')), style: desc[m.slug]?.style, mood: desc[m.slug]?.mood });
	const json = JSON.stringify(nearestAll(set)) + '\n';
	if (out) {
		fs.writeFileSync(out, json);
		io.out(`similar for ${set.length} marks → ${out}`);
	} else io.out(json.trimEnd());
	return 0;
}
