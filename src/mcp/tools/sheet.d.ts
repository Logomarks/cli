import type { Tool } from '../index.js';

/** `review_sheet`'s arguments: `svg` text or `paths`. */
export interface SheetInput {
	svg?: string;
	svgName?: string;
	paths?: string[];
	strict?: boolean;
	ignore?: string[];
	/** Also write the PNG here. */
	out?: string;
}

/** `review_sheet`: review cards as an image, and each mark's summary. */
export const tool: Tool<SheetInput>;
