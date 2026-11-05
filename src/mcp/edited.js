/**
 * @module logomarks/mcp/edited
 *
 * What the editing tools hand back: the result's SVG (or, when it was
 * written to a file, its path) and its checks as JSON, and the mark as an
 * image to look at.
 */

import { markPreview } from '../edit/preview.js';
import { writeFile } from '../util/files.js';
import { resolvePath } from './inputs.js';
import { result, text, image } from './content.js';

/**
 * An edited mark as a tool result.
 *
 * @param {import('../edit/doc.js').Edited & Record<string, unknown>} r The result, and anything more to report.
 * @param {{ out?: string, cwd: string }} o Where to write it, if anywhere.
 * @returns {Promise<import('./content.js').ToolResult>} The result.
 */
export async function edited({ svg, checks, ...more }, { out, cwd }) {
	const file = out && resolvePath(cwd, out);
	if (file) writeFile(file, svg);
	return result(text({ ok: checks.ok, ...more, ...(file ? { file } : { svg }), checks }), image(await markPreview(svg)));
}
