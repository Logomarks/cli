import type { Finding } from './finding.js';

export type { Finding, FindingId, Severity } from './finding.js';
export { FINDINGS } from './finding.js';

/** What to check. */
export interface CheckOptions {
	/** The mark's name, usually its file's slug: seeds the booleans and finds reviewed live marks ('mark'). */
	name?: string;
	/** Finding ids to leave out, e.g. `['speck']` for a mark whose small parts are meant. */
	ignore?: string[];
	/** Warnings fail the check too (false). */
	strict?: boolean;
}

/** One mark's check. */
export interface Report {
	name: string;
	/** No errors (and, with `strict`, no warnings). */
	ok: boolean;
	errors: number;
	warnings: number;
	notes: number;
	/** The outline's size, or null when there is nothing drawn. */
	size: { w: number; h: number } | null;
	/** Most serious first. */
	findings: Finding[];
}

/** Checks one mark against the house rules. */
export function check(svg: string, o?: CheckOptions): Report;
/** The mark refitted to the grid, or null when there is nothing safe to fix (no fit findings, or markup a refit would drop). */
export function fix(svg: string, report?: Report): string | null;
