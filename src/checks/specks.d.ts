import type { Box } from '../geometry/polygon.js';
import type { Shape } from '../svg/shapes.js';
import type { Finding } from './finding.js';

/** One piece or hole of a mark. */
export interface Part {
	kind: 'piece' | 'hole';
	/** Square units. */
	area: number;
	/** Mean width: 2 · area / perimeter. */
	width: number;
	box: Box;
}

/** Specks, slivers and pin-holes, smallest first; `name` (the slug) seeds the jitter and finds reviewed marks. */
export function speckFindings(paths: readonly Shape[], name: string): Finding[];
