import type { Doc } from '@logomarks/vector-editor';
import type { Edited, PartInfo } from './doc.js';

/** An op's name. */
export type OpName = 'delete' | 'move' | 'rotate' | 'scale' | 'flip' | 'round' | 'offset' | 'mirror' | 'radial' | 'union' | 'subtract' | 'color' | 'tone';

/** One op: its name, the parts it acts on, and its settings. */
export interface EditOp {
	op: OpName;
	/** Part indices (from `markParts` / list_parts) at the time it runs; none: every part. */
	parts?: number[];
	/** move: units. */
	dx?: number;
	dy?: number;
	/** rotate: degrees, clockwise. */
	angle?: number;
	/** scale: a factor, or `[sx, sy]`. */
	by?: number | [number, number];
	/** rotate, scale, flip: the centre to turn about (the parts' own centre). */
	about?: [number, number];
	/** flip: `horizontal` or `vertical`; mirror: `vertical` (left matches right), `horizontal` or `both`. */
	axis?: 'horizontal' | 'vertical' | 'both';
	/** round: the corner radius. */
	radius?: number;
	/** offset: grow (positive) or shrink (negative), in units. */
	distance?: number;
	/** offset: how corners turn (miter). */
	join?: 'miter' | 'round';
	/** radial: how many copies about the centre. */
	count?: number;
	/** color, tone: hex. */
	color?: string;
}

/** An op's description and how it runs. */
export interface OpSpec {
	about: string;
	run: (doc: Doc, ids: string[], op: EditOp) => Doc;
}

/** An edited mark, with its parts after. */
export interface EditResult extends Edited {
	parts: PartInfo[];
}

/** Every op, by name. */
export const OPS: Record<OpName, OpSpec>;
/** A mark edited by ops in order, fitted and checked; a RangeError naming the op that failed. */
export function editMark(svg: string, ops: readonly EditOp[], o?: { name?: string }): EditResult;
/** A mark's parts, by index. */
export function markParts(svg: string): PartInfo[];
