import type { Bounds } from './outline.js';

/** A fitted mark. */
export interface Fitted {
	/** The fitted file. */
	svg: string;
	/** The box the drawing had before. */
	before: Bounds;
}

/** A mark fitted to the standard: longest side 448, centred on 512, paths in `currentColor` on the 0.1 grid. Throws when there is nothing to fit. */
export function fitMark(svg: string): Fitted;
