import type { Tool } from '../index.js';
import type { EditOp } from '../../edit/ops.js';

/** `edit_mark`'s arguments. */
export interface EditInput {
	mark?: string;
	svg?: string;
	ops: EditOp[];
	out?: string;
}

/** `list_parts`'s arguments. */
export interface PartsInput {
	mark?: string;
	svg?: string;
}

/** `edit_mark`: ops by part, run in order, the result fitted, checked and shown. */
export const tool: Tool<EditInput>;
/** `list_parts`: the parts by index, and an image of them numbered. */
export const parts: Tool<PartsInput>;
