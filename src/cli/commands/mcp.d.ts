import type { ArgSpec } from '../args.js';

/** What `mcp` takes: nothing. */
export const spec: ArgSpec;
/** Starts the MCP server on stdio; resolves to 0 once it is connected. */
export function run(): Promise<number>;
