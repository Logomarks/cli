import type { MarkIndex } from '../similar/store.js';

/** Exact filters for a search, and how many to return. */
export interface FindOptions {
	/** One style (`letter`, `badge`, `iso`, `line`, `animal` …; see `facets`). */
	style?: string;
	/** Tags a mark must all have (`round`, `symmetric`, `solid` …). */
	tags?: string[];
	/** An industry it suits (`coffee`, `fintech`, `law-firm` …). */
	industry?: string;
	/** The letter or number it shows (`K`, `7`). */
	letter?: string;
	/** How many to return (20). */
	limit?: number;
	/** The live set (the bundled index). */
	index?: MarkIndex;
}

/** A mark found: what it is and its page. */
export interface Found {
	slug: string;
	name: string;
	style: string;
	tags: string[];
	mood: string[];
	letter?: string;
	industries: string[];
	description: string;
	/** Its page on logomarks.ai. */
	url: string;
}

/** A search's result. */
export interface FindResult {
	/** How many marks matched (more than `marks` when the limit cut it). */
	total: number;
	/** The best matches, best first. */
	marks: Found[];
}

/** Each filter's values, with how many marks have each. */
export interface Facets {
	styles: Record<string, number>;
	tags: Record<string, number>;
	moods: Record<string, number>;
	industries: Record<string, number>;
}

/** How many marks a search returns when no limit is given: 20. */
export const DEFAULT_LIMIT: number;
/** Searches the live set by words (most found first) and exact filters. */
export function findMarks(query?: string, o?: FindOptions): FindResult;
/** The values the filters take, with how many marks have each, most first. */
export function facets(index?: MarkIndex): Facets;
