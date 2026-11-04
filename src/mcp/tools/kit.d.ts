import type { Tool } from '../index.js';

/** `brand_kit`'s arguments. */
export interface KitInput {
	mark: string;
	name?: string;
	color?: string;
	font?: string;
	/** The folder to write (`<name>-kit`). */
	out?: string;
}

/** `brand_kit`: a starter kit written to a folder, and its brand sheet as an image. */
export const tool: Tool<KitInput>;
