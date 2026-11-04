import type { Box } from '../geometry/polygon.js';
import type { Shape } from '../svg/shapes.js';
import type { Finding } from './finding.js';

/** Runs of about the same width, taken together. */
export interface RunGroup {
	/** Their mean width, weighted by length. */
	width: number;
	/** Their total length. */
	length: number;
	count: number;
	/** The box round them all. */
	box: Box;
}

/** Thin strokes, narrow gaps and uneven gaps (all warnings). */
export function widthFindings(paths: readonly Shape[]): Finding[];
