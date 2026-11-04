import type { MarkIndex, IndexedMark } from '../similar/store.js';

/** A mark to build on. */
export interface Mark {
	slug: string;
	name: string;
	/** The SVG: 512 canvas, filled paths in `currentColor`. */
	svg: string;
	/** Whether it is a live Logomark (CC0) rather than a file. */
	live: boolean;
}

/** How to draw a mark on a square. */
export interface TileOptions {
	/** The side in pixels. */
	size: number;
	/** The mark's colour. */
	color: string;
	/** A ground behind it (transparent otherwise). */
	ground?: string;
	/** Space round the 512 canvas, as a fraction of it (0). */
	pad?: number;
	/** The ground's corner radius, as a fraction of its side (0). */
	radius?: number;
}

/** Where a live mark's page is: this and its slug. */
export const MARK_URL: string;

/** A mark that wasn't found; `suggestions` holds the closest slugs. */
export class MarkNotFound extends Error {
	constructor(ref: string, suggestions: string[]);
	suggestions: string[];
}

/** Text as a slug. */
export function slugify(s: string): string;
/** A slug as a name. */
export function titleCase(slug: string): string;
/** A live mark by slug or name, any case. */
export function findMark(ref: string, index?: MarkIndex): IndexedMark | undefined;
/** The live slugs closest to a query. */
export function suggest(ref: string, index?: MarkIndex, n?: number): string[];
/** A live mark by slug or name, or an SVG file fitted to the standard. Throws `MarkNotFound`. */
export function loadMark(ref: string, index?: MarkIndex): Mark;
/** The mark's paths in a colour, in a `<g>`, without the `<svg>`. */
export function markBody(svg: string, color: string): string;
/** The mark as a file, the fill on the root (`currentColor` by default). */
export function paint(svg: string, color?: string): string;
/** The mark on a square (transparent, or on a ground with rounded corners), as SVG. */
export function tile(svg: string, o: TileOptions): string;
/** The mark drawn to a square PNG. */
export function markPng(svg: string, o: TileOptions): Promise<Uint8Array>;
