import type { Polygon } from './polygon.js';
import type { Shape } from '../svg/shapes.js';

/** A polygon or a set of them, as polygon-clipping takes. */
export type Geom = Polygon | Polygon[];

/** Booleans on polygon sets that retry with a tiny seeded jitter instead of throwing. */
export interface Booleans {
	union(...g: Geom[]): Polygon[];
	difference(a: Geom, ...b: Geom[]): Polygon[];
	xor(...g: Geom[]): Polygon[];
}

/** Booleans whose retry jitter is seeded by `seed`. */
export function booleans(seed: string): Booleans;
/** A mark's filled area: every path filled by its own rule, unioned. Throws when it can't be read. */
export function filledShape(paths: readonly Shape[], seed?: string): Polygon[];
