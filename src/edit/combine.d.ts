import type { Edited } from './doc.js';

/** A way two marks combine. */
export type CombineOp = 'union' | 'subtract' | 'intersect' | 'exclude' | 'place';

/** Where the second mark goes, on the 512 canvas: scaled and turned about its centre, flipped, then moved. */
export interface Placement {
	/** A factor (1). */
	scale?: number;
	/** Degrees, clockwise (0). */
	rotate?: number;
	flip?: 'horizontal' | 'vertical';
	/** Units across (0). */
	x?: number;
	/** Units down (0). */
	y?: number;
}

/** How to combine. */
export interface CombineOptions {
	/** `union`, `subtract` (the second cut out of the first), `intersect`, `exclude`, or `place` (both, as they are). */
	op: CombineOp;
	transform?: Placement;
	/** The result's name, for the checks. */
	name?: string;
}

/** The ways two marks combine. */
export const COMBINE_OPS: readonly CombineOp[];
/** Two marks combined, fitted and checked; a RangeError for an unknown op, an Error when nothing is left. */
export function combineMarks(a: string, b: string, o: CombineOptions): Edited;
