import type { z } from 'zod';
import type { Mark } from '../brand/mark.js';

/** A mark to check: its name, its file (absolute; none for SVG text) and its SVG. */
export interface SvgInput {
	name: string;
	file?: string;
	svg: string;
}

/** The schemas the tools share. */
export const schema: {
	mark: z.ZodString;
	color: z.ZodOptional<z.ZodString>;
	font: z.ZodOptional<z.ZodEnum<Record<string, string>>>;
	name: z.ZodOptional<z.ZodString>;
	svg: z.ZodOptional<z.ZodString>;
	svgName: z.ZodOptional<z.ZodString>;
	paths: z.ZodOptional<z.ZodArray<z.ZodString>>;
	ignore: z.ZodOptional<z.ZodArray<z.ZodString>>;
	strict: z.ZodOptional<z.ZodBoolean>;
	seed: z.ZodOptional<z.ZodString>;
};

/** A path resolved against the working folder. */
export function resolvePath(cwd: string, p: string): string;
/** A mark by slug, name or file (relative to the working folder); throws `MarkNotFound`. */
export function readMark(ref: string, cwd: string): Mark;
/** A colour input as `#RRGGBB` (undefined when not given); throws when it isn't one. */
export function readColor(value: string | undefined): string | undefined;
/** The marks a check names: SVG text, or files and folders; throws when neither, both, or missing. */
export function readSvgs(input: { svg?: string; svgName?: string; paths?: string[] }, cwd: string): SvgInput[];
