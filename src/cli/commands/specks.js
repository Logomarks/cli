/**
 * @module logomarks/cli/commands/specks
 *
 * `logomarks specks <folder | file.svg…>`: the set's speck review (what
 * speckcheck.mjs printed). Every mark's pieces under `--piece` (60) and holes
 * under `--hole` (30), smallest first, with their boxes, so you know where to
 * zoom; tiny, hairline, repeated and reviewed parts are left out unless
 * `--all`. `--raster` reads every mark from the scanline raster. Run it on
 * fitted marks, then render each hit large before changing anything: many
 * small parts are meant.
 */

import fs from 'node:fs';
import { shapes } from '@logomarks/core/svg';
import { markParts, smallParts } from '@logomarks/core/analyse';
import { SPECKS, REVIEWED } from '../../rules.js';
import { UsageError } from '../args.js';
import { svgFiles, slugOf } from '../files.js';

/** What `specks` takes. */
export const spec = { flags: ['json', 'all', 'raster'], options: { piece: '', hole: '', allow: '' } };

/** `logomarks specks --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'List every speck, sliver and pin-hole, with its box.',
	usage: ['<file.svg | folder>… [options]'],
	about: [
		'The speck review: pieces under --piece and holes under --hole, smallest first. Tiny,',
		'hairline, repeated and reviewed parts are left out unless --all. Render each hit large',
		'before changing anything: many small parts are meant. Exit 1 when anything is listed.',
	],
	options: [
		['--piece <area>', 'Report pieces smaller than this, in square units. Default 60.'],
		['--hole <area>', 'Report holes smaller than this. Default 30.'],
		['--allow <slugs>', 'Marks whose small parts are meant, comma-separated.'],
		['--all', 'Report every small part, reviewed and repeated ones included.'],
		['--raster', 'Read each mark from the scanline raster instead of its outline.'],
	],
	examples: ['logomarks specks out/', 'logomarks specks mark.svg --piece 80 --json'],
};

/**
 * A number option.
 *
 * @param {string | undefined} v The option's value.
 * @param {number} d Its default.
 * @param {string} name Its name, for the error.
 * @returns {number} The number.
 */
const num = (v, d, name) => {
	if (v === undefined) return d;
	const n = Number(v);
	if (!Number.isFinite(n) || n < 0) throw new UsageError(`--${name} takes a number`);
	return n;
};

/**
 * One mark's small parts, each tagged with why it is left out ('' = reported).
 *
 * @param {string} file The mark.
 * @param {{ piece: number, hole: number, raster: boolean, allow: Set<string> }} o The limits.
 * @returns {import('./specks.js').MarkSpecks} Its small parts.
 */
function review(file, { piece, hole, raster, allow }) {
	const slug = slugOf(file);
	let read;
	try {
		read = markParts(shapes(fs.readFileSync(file, 'utf8')), { seed: slug, raster });
	} catch (e) {
		return { slug, note: `unreadable: ${/** @type {Error} */ (e).message.slice(0, 40)}`, raster: false, parts: [{ kind: 'mark', area: 0, width: 0, box: [0, 0, 0, 0], skip: '' }] };
	}
	const note = read.error ? `svgShape failed: ${read.error.slice(0, 40)}` : '';
	const parts = smallParts(read.parts, { piece, hole, raster: read.raster }).map((p) => (allow.has(slug) ? { ...p, skip: 'allowed' } : p));
	return { slug, note, raster: read.raster, parts };
}

/**
 * Runs `specks`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 1 when anything is reported.
 */
export async function run(args, io) {
	const files = svgFiles(args.positionals).slice().sort((a, b) => (slugOf(a) < slugOf(b) ? -1 : slugOf(a) > slugOf(b) ? 1 : 0));
	const piece = num(args.options.piece, SPECKS.piece, 'piece'), hole = num(args.options.hole, SPECKS.hole, 'hole');
	const all = args.flags.has('all');
	const allow = new Set([...Object.keys(REVIEWED), ...(args.options.allow ?? '').split(',').filter(Boolean)]);
	const results = files.map((f) => review(f, { piece, hole, raster: args.flags.has('raster'), allow }));
	const f1 = (/** @type {number} */ v) => v.toFixed(1);
	const shown = results.map((r) => ({ ...r, parts: r.parts.filter((p) => all || !p.skip) })).filter((r) => r.parts.length);
	if (args.flags.has('json')) {
		io.out(JSON.stringify(shown.map(({ slug, note, parts }) => ({ slug, note, parts: parts.map((p) => ({ ...p, area: +p.area.toFixed(2), width: +p.width.toFixed(3), box: p.box.map((v) => +v.toFixed(1)) })) })), null, 1));
	} else {
		for (const { slug, note, parts } of shown) io.out(slug.padEnd(28) + ' ' + parts.map((p) => (p.kind === 'mark' ? 'could not be read' : `${p.kind} ${f1(p.area)} at ${f1(p.box[0])},${f1(p.box[1])}–${f1(p.box[2])},${f1(p.box[3])}${'raster' in p && p.raster ? ' (raster)' : ''}${p.skip ? ` [${p.skip}]` : ''}`)).join(' · ') + (note ? `  (${note})` : ''));
		const count = (/** @type {string} */ k) => results.reduce((s, r) => s + r.parts.filter((p) => p.skip === k).length, 0);
		io.out(`${results.filter((r) => r.parts.some((p) => !p.skip)).length} of ${files.length} marks with specks (pieces < ${piece}, holes < ${hole}); `
			+ `left out ${count('tiny')} tiny, ${count('hairline')} hairline, ${count('repeated')} repeated, ${count('allowed')} allowed${all ? '' : ' (--all lists them)'}; `
			+ `${results.filter((r) => r.raster).length} read by raster${results.some((r) => r.note) ? ': ' + results.filter((r) => r.note).map((r) => r.slug).join(', ') : ''}`);
	}
	return results.some((r) => r.parts.some((p) => !p.skip)) ? 1 : 0;
}
