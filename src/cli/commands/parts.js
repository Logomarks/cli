/**
 * @module logomarks/cli/commands/parts
 *
 * `logomarks parts <slug|file.svg>`: the parts by index, as `edit --ops`
 * names them; `-o parts.png` draws them numbered.
 */

import { markParts } from '../../edit/ops.js';
import { partsPreview } from '../../edit/preview.js';
import { markArg, writeFile } from '../options.js';
import { style, pad } from '../style.js';

/** What `parts` takes. */
export const spec = { flags: ['json'], options: { out: 'o' } };

/**
 * Runs `parts`.
 *
 * @param {import('../args.js').Parsed} args The parsed arguments.
 * @param {import('../index.js').IO} io Where output goes.
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run(args, io) {
	const mark = markArg(args.positionals);
	const list = markParts(mark.svg);
	if (args.options.out) writeFile(args.options.out, await partsPreview(mark.svg, list));
	if (args.flags.has('json')) io.out(JSON.stringify({ count: list.length, parts: list, ...(args.options.out && { file: args.options.out }) }, null, 2));
	else {
		io.out(`${style.bold(mark.name)}: ${list.length} part${list.length === 1 ? '' : 's'}`);
		for (const p of list) io.out(`  ${pad(String(p.index), 4)}${style.dim('box')} [${p.box.join(', ')}]  ${style.dim('area')} ${p.area}${p.holes ? `  ${p.holes} hole${p.holes > 1 ? 's' : ''}` : ''}${p.tone ? '  tone 2' : ''}`);
		if (args.options.out) io.out(`  Numbered: ${style.bold(args.options.out)}`);
	}
	return 0;
}
