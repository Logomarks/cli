import type { Doc } from '@logomarks/vector-editor';
import type { Report } from '../checks/index.js';

/** One part of a mark, by index in drawing order. */
export interface PartInfo {
	/** What an op's `parts` names it by. */
	index: number;
	/** `[x0, y0, x1, y1]` on the 512 canvas. */
	box: [number, number, number, number];
	centre: [number, number];
	/** Square units, holes taken out. */
	area: number;
	/** How many holes it has. */
	holes: number;
	/** 0 the mark's colour, 1 the second tone. */
	tone: number;
}

/** An edited mark: fitted and checked. */
export interface Edited {
	/** 512 canvas, longest side 448, centred. */
	svg: string;
	/** The house checks on it. */
	checks: Report;
}

/** A mark as an editable document; throws when it has no filled shapes. */
export function toDoc(svg: string): Doc;
/** Every part, by index in drawing order. */
export function listParts(doc: Doc): PartInfo[];
/** Part indices as ids (none: every part); a RangeError for one the mark doesn't have. */
export function partIds(doc: Doc, indices: readonly number[] | undefined): string[];
/** A result fitted (448 on 512, centred) and checked; throws when nothing is left. */
export function finish(doc: Doc, name?: string): Edited;
