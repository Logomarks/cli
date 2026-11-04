/**
 * @module logomarks/cli/commands/mcp
 *
 * `logomarks mcp`: the MCP server on stdio, for Claude Code, Codex, Cursor
 * and any MCP client. Nothing is written to stdout but the protocol.
 */

/** What `mcp` takes. */
export const spec = { flags: [], options: {} };

/**
 * Runs `mcp`: starts the server and returns; the process lives until the client hangs up.
 *
 * @returns {Promise<number>} The exit code: 0.
 */
export async function run() {
	const { serve } = await import('../../mcp/index.js');
	await serve();
	return 0;
}
