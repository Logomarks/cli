import type { Tool } from '../index.js';

/** `similar_marks`'s arguments: `svg` text or `paths`. */
export interface SimilarInput {
	svg?: string;
	svgName?: string;
	paths?: string[];
	top?: number;
	letters?: boolean;
}

/** `similar_marks`: the nearest live marks, with scores and verdicts. */
export const tool: Tool<SimilarInput>;
