import type { MarkIndex } from './store.js';

/** What indexOf() takes. */
export interface FolderOptions {
	/** Letter signatures too (false). */
	letters?: boolean;
	/** Names and tags by slug (from a marks.json). */
	about?: Record<string, { name: string; tags: string[] }>;
	/** The files are candidates: every one's holes are compared, and each match says so. */
	candidate?: boolean;
}

/** A badge's slug (any family). */
export function isBadge(slug: string): boolean;
/** An index of SVG files. */
export function indexOf(files: readonly string[], o?: FolderOptions): Promise<MarkIndex>;
/** An index of every SVG in a folder, named from the marks.json beside it. */
export function folderIndex(dir: string, o?: { letters?: boolean }): Promise<MarkIndex>;
/** Two indexes as one. */
export function joinIndexes(a: MarkIndex, b: MarkIndex): MarkIndex;
