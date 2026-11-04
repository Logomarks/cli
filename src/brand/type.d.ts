import type { FontId } from './fonts.js';

/** A line of text set as outlines, at `SIZE`: the baseline on y = 0, the pen starting at x = 0. */
export interface Set {
	/** The glyphs as paths in a group, with no fill (it inherits one). */
	paths: string;
	/** The box round the ink. */
	box: { x: number; y: number; w: number; h: number };
	/** The face's cap height (an H). */
	cap: number;
}

/** The size a line is set at (100); scale the result. */
export const SIZE: number;
/** A line of text in a bundled face as outlines (kerned by resvg). */
export function typeset(text: string, id: FontId): Promise<Set>;
