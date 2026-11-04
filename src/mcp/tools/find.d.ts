import type { Tool } from '../index.js';

/** `find_marks`'s arguments. */
export interface FindInput {
	query?: string;
	style?: string;
	tags?: string[];
	industry?: string;
	letter?: string;
	limit?: number;
}

/** `find_marks`: search the live set by words and filters (no arguments: the filters' values). */
export const tool: Tool<FindInput>;
