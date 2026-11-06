/**
 * @module logomarks/cli/commands/find
 *
 * `logomarks find <words…>`: search the bundled live set by words, style,
 * tags, industry or letter. With nothing to search by, the values the
 * filters take.
 */

import { findMarks, facets } from '../../find/index.js';
import { intArg } from '../options.js';
import { style, pad } from '../style.js';

/** What `find` takes. */
export const spec = { flags: ['json'], options: { style: '', tag: '', industry: '', letter: '', top: '' } };

/** `logomarks find --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Search the live set by words, style, tag, industry or letter.',
	usage: ['<words…> [options]', '[options]'],
	about: [
		'Searches as logomarks.ai does: every word must match (synonyms, plurals and trade names',
		'included) and the best fits come first. With no words or filters it lists every style,',
		'tag, mood and industry. Exit 1 when nothing matches.',
	],
	options: [
		['--style <style>', 'One style, e.g. letter, badge, iso, line, grid, glitch, animal.'],
		['--tag <tags>', 'Tags a mark must all have, e.g. round,symmetric.'],
		['--industry <id>', 'An industry it suits, e.g. coffee, fintech, law-firm.'],
		['--letter <char>', 'The letter or number a lettermark shows.'],
		['--top <n>', 'How many marks to list (1–500). Default 20.'],
	],
	examples: ['logomarks find coffee', 'logomarks find calm hexagon --top 5', 'logomarks find --style letter --letter K', 'logomarks find'],
};

/**
 * Runs `find`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0 when anything matched, 1 otherwise.
 */
export async function run(args, io) {
	const query = args.positionals.join(' ');
	const { style: kind, industry, letter } = args.options;
	const tags = (args.options.tag ?? '').split(',').map((t) => t.trim()).filter(Boolean);
	const json = args.flags.has('json');
	if (!query && !kind && !tags.length && !industry && !letter) {
		const f = facets();
		if (json) io.out(JSON.stringify(f, null, 2));
		else for (const [k, v] of Object.entries(f)) io.out(`${style.bold(k)}  ${Object.entries(v).map(([n, c]) => `${n} ${style.dim(String(c))}`).join(', ')}`);
		return 0;
	}
	const r = findMarks(query, { style: kind, tags, industry, letter, limit: intArg('top', args.options.top, 1, 500) });
	if (json) io.out(JSON.stringify(r, null, 2));
	else {
		for (const m of r.marks) io.out(`${pad(m.slug, 28)} ${pad(m.style, 10)} ${style.dim(m.description)}`);
		io.out(`\n${r.marks.length} of ${r.total} matching`);
	}
	return r.total ? 0 : 1;
}
