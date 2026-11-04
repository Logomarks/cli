import type { MarkIndex } from './store.js';

/** How close a live mark is: `near-copy` (0.9+ by outline), `too-close` (0.72+), or `ok`. */
export type Verdict = 'near-copy' | 'too-close' | 'ok';

/** A live mark near the candidate. */
export interface Match {
	slug: string;
	name: string;
	/** Overlap, 0–1, the best of 8 rotations and flips. */
	score: number;
	verdict: Verdict;
	/** What was compared: the outline, or a badge's knocked-out letter against a badge's hole or a letter mark's ink. */
	by: 'outline' | 'letter (hole)' | 'letter (ink)';
}

/** What to compare. */
export interface SimilarOptions {
	/** How many to return (5). */
	top?: number;
	/** Compare the candidate's knocked-out letter (its holes) instead of its outline (false). */
	letters?: boolean;
	/** The live marks (the bundled index). */
	index?: MarkIndex;
	/** A slug to leave out (the candidate itself). */
	exclude?: string;
}

/** The live marks nearest a candidate, closest first. With `letters`, an empty list when it has no holes. */
export function similar(svg: string, o?: SimilarOptions): Promise<Match[]>;
