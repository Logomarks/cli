import type { Tool } from '../index.js';

/** `check_mark`'s arguments: `svg` text or `paths`. */
export interface CheckInput {
	svg?: string;
	svgName?: string;
	paths?: string[];
	/** Refit to the grid (files in place; text returned). */
	fix?: boolean;
	strict?: boolean;
	ignore?: string[];
}

/** `check_mark`: every house rule, findings as JSON. */
export const tool: Tool<CheckInput>;
