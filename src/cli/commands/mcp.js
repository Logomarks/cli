/**
 * @module logomarks/cli/commands/mcp
 *
 * `logomarks mcp`: the MCP server on stdio, for Claude Code, Codex, Cursor
 * and any MCP client. Nothing is written to stdout but the protocol.
 */

/** What `mcp` takes. */
export const spec = { flags: [], options: {} };

/** `logomarks mcp --help`. */
/** @type {import('../help.js').CommandHelp} */
export const help = {
	summary: 'Run the MCP server on stdio, for Claude Code, Codex, Cursor and other agents.',
	usage: [''],
	about: [
		'Every verb as an MCP tool, run locally; nothing leaves the machine. Add it to an agent:',
		'  claude mcp add logomarks -- npx -y logomarks mcp',
		'  codex mcp add logomarks -- npx -y logomarks mcp',
		'Or install the Claude Code plugin, which adds the skills too:',
		'  /plugin marketplace add logomarks/skills',
		'  /plugin install logomarks@logomarks',
	],
	json: false,
};

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
