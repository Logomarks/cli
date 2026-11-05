import type { Box, Point } from '@logomarks/core/geometry';

/** How much a finding matters: errors fail the check; warnings fail it with `--strict`; notes never do. */
export type Severity = 'error' | 'warning' | 'info';

/** Every finding a check can report. */
export type FindingId =
	| 'empty'
	| 'viewbox'
	| 'size'
	| 'centre'
	| 'clipped'
	| 'markup'
	| 'fill'
	| 'precision'
	| 'speck'
	| 'sliver'
	| 'pinhole'
	| 'thin'
	| 'narrow-gap'
	| 'uneven-gaps'
	| 'raster-read';

/** What a finding id means. */
export interface FindingKind {
	/** Its usual severity. */
	severity: Severity;
	/** Whether `--fix` repairs it. */
	fixable: boolean;
	/** How to fix it. */
	fix: string;
}

/** One thing a check found. */
export interface Finding {
	id: FindingId;
	severity: Severity;
	/** A plain-English sentence. */
	message: string;
	/** Where, as a box on the 512 canvas: `[x0, y0, x1, y1]`. */
	box?: Box;
	/** Where, as a point on the canvas. */
	point?: Point;
	/** The measured number (an area in square units, a width in units). */
	value?: number;
	/** Whether `--fix` repairs it. */
	fixable: boolean;
	/** How to fix it. */
	fix: string;
}

/** Every finding id and what it means. */
export const FINDINGS: Readonly<Record<FindingId, FindingKind>>;

/** A finding, its location rounded to one decimal. */
export function finding(id: FindingId, message: string, o?: { box?: Box; point?: Point; value?: number; severity?: Severity }): Finding;
