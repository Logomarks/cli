import type { Tool } from '../index.js';

/** `render_cover`'s arguments. */
export interface CoverInput {
	mark: string;
	/** One of `RECIPES`. */
	recipe?: string;
	title?: string;
	label?: string;
	color?: string;
	/** `og`, `w:h` or a number. */
	aspect?: string;
	width?: number;
	seed?: string;
	/** Also write it here (.png or .svg). */
	out?: string;
}

/** `render_cover`: a cover with the mark on it, as an image. */
export const tool: Tool<CoverInput>;
