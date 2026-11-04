import type { Tool } from '../index.js';

/** `get_mark`'s arguments. */
export interface GetInput {
	/** A live slug or name, or an .svg path. */
	mark: string;
	color?: string;
	/** Also return a PNG this many pixels square. */
	size?: number;
	/** Write the mark here (.svg or .png). */
	out?: string;
}

/** `get_mark`: a mark's SVG, and a PNG to look at when asked. */
export const tool: Tool<GetInput>;
