import type { Tool } from '../index.js';
import type { CombineOp, Placement } from '../../edit/combine.js';

/** `combine_marks`'s arguments. */
export interface CombineInput {
	/** A live slug or name, an .svg path, or SVG text. */
	a: string;
	b: string;
	op: CombineOp;
	transform?: Placement;
	out?: string;
}

/** `combine_marks`: two marks made one, fitted, checked and shown. */
export const tool: Tool<CombineInput>;
