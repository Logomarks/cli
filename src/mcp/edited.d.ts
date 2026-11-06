import type { Edited } from '../edit/doc.js';
import type { ToolResult } from './content.js';

/** An edited mark as a tool result: `{ ok, …, file?, svg, checks }` and its image; written to `out` when given. */
export function edited(r: Edited & Record<string, unknown>, o: { out?: string; cwd: string }): Promise<ToolResult>;
