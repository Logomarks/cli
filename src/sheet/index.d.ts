import type { Report } from '../checks/index.js';
import type { Match } from '../similar/nearest.js';
import type { MarkIndex } from '../similar/store.js';

/** A mark for the sheet. */
export interface SheetMark {
	/** Its name, usually its file's slug. */
	name: string;
	svg: string;
}

/** How to check the marks. */
export interface SheetOptions {
	/** The live marks (the bundled index). */
	index?: MarkIndex;
	/** Warnings fail a mark too (false). */
	strict?: boolean;
	/** Finding ids to leave out. */
	ignore?: string[];
}

/** A rendered sheet. */
export interface Sheet {
	png: Uint8Array;
	svg: string;
	/** Each mark's check and nearest live marks (itself left out). */
	marks: { name: string; report: Report; matches: Match[] }[];
}

/** Review cards for a set of marks, rendered to one PNG. */
export function sheet(marks: readonly SheetMark[], o?: SheetOptions): Promise<Sheet>;
