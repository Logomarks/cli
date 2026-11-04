/**
 * @module logomarks/mcp/content
 *
 * What a tool hands back: JSON as text, PNGs as images, and errors the
 * caller can act on.
 */

import { MarkNotFound } from '../brand/mark.js';

/**
 * A value as MCP text content: pretty JSON, or a string as it is.
 *
 * @param {unknown} value The value.
 * @returns {import('./content.js').TextContent} The content.
 */
export const text = (value) => ({ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) });

/**
 * A PNG as MCP image content.
 *
 * @param {Uint8Array} png The PNG's bytes.
 * @returns {import('./content.js').ImageContent} The content.
 */
export const image = (png) => ({ type: 'image', data: Buffer.from(png).toString('base64'), mimeType: 'image/png' });

/**
 * A tool's result.
 *
 * @param {...(import('./content.js').TextContent | import('./content.js').ImageContent)} content What it returns, in order.
 * @returns {import('./content.js').ToolResult} The result.
 */
export const result = (...content) => ({ content });

/**
 * What went wrong, as the caller should read it: a missing mark with the
 * closest slugs and where to look, a missing file by its path, anything
 * else by its message.
 *
 * @param {unknown} e The error.
 * @returns {string} The message.
 */
export function explain(e) {
	if (e instanceof MarkNotFound) return `${e.message} Search the set with find_marks, or pass the path to an .svg file.`;
	const err = /** @type {NodeJS.ErrnoException} */ (e);
	if (err?.code === 'ENOENT') return `no such file: ${err.path}`;
	if (err?.code === 'EACCES') return `can't write ${err.path}: permission denied`;
	return err instanceof Error ? err.message : String(e);
}

/**
 * A tool error: the message as text, flagged so the caller knows the call failed.
 *
 * @param {unknown} e The error.
 * @returns {import('./content.js').ToolResult} The result.
 */
export const failure = (e) => ({ content: [text(explain(e))], isError: true });
