import type { Tool } from '../index.js';

/** `mockup`'s arguments. */
export interface MockupInput {
	mark: string;
	/** One of `OBJECTS`. */
	object: string;
	name?: string;
	color?: string;
	font?: string;
	layout?: string;
	surface?: string;
	view?: 'front' | 'angle';
	base?: string;
	size?: number;
	seed?: string;
	/** Also write it here (.png or .svg). */
	out?: string;
}

/** `mockup`: the brand on an object, as an image. */
export const tool: Tool<MockupInput>;
