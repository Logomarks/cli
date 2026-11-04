/** A live mark in the index. */
export interface IndexedMark {
	slug: string;
	name: string;
	/** The mark's SVG. */
	svg: string;
	/** Its outline signature: 48 px coverage, blurred. */
	outline: Float32Array;
}

/** A letter signature: a badge's holes or a letter mark's ink. */
export interface IndexedLetter {
	/** The mark's position in `marks`. */
	mark: number;
	kind: 'hole' | 'ink';
	/** The signature, 40 px, values 0–1. */
	sig: Float32Array;
}

/** The live marks and their signatures. */
export interface MarkIndex {
	/** When it was built (YYYY-MM-DD). */
	built: string;
	marks: IndexedMark[];
	letters: IndexedLetter[];
}

/** What an index is written from. */
export interface IndexInput {
	marks: { slug: string; name: string; svg: string }[];
	/** One 48 px coverage per mark (values 0–1), before the blur. */
	coverages: ArrayLike<number>[];
	letters: { mark: number; kind: 'hole' | 'ink'; sig: ArrayLike<number> }[];
}

/** Where the bundled index lives. */
export const INDEX_FILE: URL;
/** Writes an index (brotli) and returns its size in bytes. */
export function writeIndex(input: IndexInput, file?: string | URL): number;
/** Reads an index, once per file. Throws when it is missing or from another version. */
export function loadIndex(file?: string | URL): MarkIndex;
