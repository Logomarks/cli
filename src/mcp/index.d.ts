import type { ZodRawShape } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { ToolResult } from './content.js';

/** What a tool's run is given besides its arguments. */
export interface ToolContext {
	/** Where relative paths resolve. */
	cwd: string;
}

/** One tool: what the agent sees, and what runs. */
export interface Tool<Input = Record<string, unknown>> {
	/** The tool's name (snake_case). */
	name: string;
	title: string;
	/** Written for the agent: what it does, what it returns, when to use it. */
	description: string;
	/** Its arguments, as zod (the server publishes them as JSON Schema). */
	inputSchema: ZodRawShape;
	annotations: ToolAnnotations;
	/** Runs it on validated arguments; throws on failure (the server returns a tool error). */
	run(args: Input, ctx: ToolContext): Promise<ToolResult>;
}

/** How to set the server up. */
export interface ServerOptions {
	/** Where relative paths resolve (the process's working folder). */
	cwd?: string;
}

/** Every tool, in the order an agent uses them. */
export const TOOLS: Tool<never>[];
/** What the server tells the agent when it connects. */
export const INSTRUCTIONS: string;
/** An MCP server with every tool registered, not yet connected. */
export function createServer(o?: ServerOptions): McpServer;
/** Loads the renderer, the typefaces and the live set. */
export function warm(): Promise<void>;
/** Runs the server over stdio until the client hangs up. */
export function serve(o?: ServerOptions): Promise<McpServer>;
