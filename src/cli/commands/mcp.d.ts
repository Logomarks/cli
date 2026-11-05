import type { ArgSpec } from '../args.js';
import type { CommandHelp } from '../help.js';

/** What `mcp` takes: nothing. */
export const spec: ArgSpec;
/** What `logomarks mcp --help` prints. */
export const help: CommandHelp;
/** Starts the MCP server on stdio; resolves to 0 once it is connected. */
export function run(): Promise<number>;
