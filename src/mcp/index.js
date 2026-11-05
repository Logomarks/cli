/**
 * @module logomarks/mcp
 *
 * The MCP server: the library's functions as typed tools for an AI agent
 * (Claude Code, Codex, Cursor …), over stdio. It runs on the user's machine;
 * nothing leaves it. The renderer, the typefaces and the live set load once
 * and stay warm across calls. `logomarks mcp` starts it.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TOOLS } from './tools/index.js';
import { failure } from './content.js';
import { loadIndex } from '../similar/store.js';
import { warmRenderer } from '../raster/render.js';
import { VERSION } from '../util/version.js';

export { TOOLS };

/** What the server tells the agent when it connects. */
export const INSTRUCTIONS = `Logomarks: 1,500+ free geometric logomarks (CC0), and the checks the set is held to, run locally.
- Pick a mark: find_marks, then get_mark.
- Draw your own: write the SVG to the house rules (512 canvas, longest side 448, centred; filled paths in currentColor; one gap of 22; nothing under 10 units), then check_mark, similar_marks and review_sheet. Fix every error, look at the sheet, and repeat until check_mark is ok.
- Make it your own: list_parts, then edit_mark (delete, move, round, offset, mirror, two-tone …), glitch_mark, combine_marks. Each result is fitted and checked.
- Build on a mark: brand_kit (a folder of files), social_pack, mockup, cover.
Relative paths resolve against the server's working folder. Free and open source; the full brand kit, photoreal mockups and custom logos are at https://logomarks.ai/pricing.`;

/**
 * An MCP server with every tool registered. Errors come back as tool errors
 * (`isError`) with a message the agent can act on.
 *
 * @param {import('./index.js').ServerOptions} [o] Where relative paths resolve.
 * @returns {McpServer} The server, not yet connected.
 */
export function createServer({ cwd = process.cwd() } = {}) {
	const server = new McpServer({ name: 'logomarks', title: 'Logomarks', version: VERSION, websiteUrl: 'https://logomarks.ai' }, { instructions: INSTRUCTIONS });
	for (const t of TOOLS) {
		const run = /** @type {(args: object, ctx: import('./index.js').ToolContext) => Promise<import('./content.js').ToolResult>} */ (t.run);
		server.registerTool(t.name, { title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations }, async (args) => {
			try {
				return await run(args, { cwd });
			} catch (e) {
				return failure(e);
			}
		});
	}
	return server;
}

/**
 * Loads the renderer, the typefaces and the live set in the background, so
 * the first call is as quick as the rest.
 *
 * @returns {Promise<void>} Resolves when all three are ready.
 */
export async function warm() {
	loadIndex();
	await warmRenderer();
}

/**
 * Runs the server on stdin and stdout until the client hangs up.
 *
 * @param {import('./index.js').ServerOptions} [o] Where relative paths resolve.
 * @returns {Promise<McpServer>} The connected server.
 */
export async function serve(o) {
	const server = createServer(o);
	await server.connect(new StdioServerTransport());
	setImmediate(() => warm().catch((e) => console.error(`logomarks: ${e.message}`)));
	return server;
}
