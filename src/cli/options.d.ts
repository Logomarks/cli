import type { Mark } from '../brand/mark.js';
import type { FontId } from '../brand/fonts.js';

/** The mark the positionals name (a live slug or name, or an .svg file); a `UsageError` otherwise. */
export function markArg(positionals: readonly string[]): Mark;
/** A colour option as `#RRGGBB` (undefined when not given); a `UsageError` when it isn't one. */
export function colorArg(value: string | undefined): string | undefined;
/** A typeface option as its id (undefined when not given); a `UsageError` when it isn't bundled. */
export function fontArg(value: string | undefined): FontId | undefined;
/** A whole-number option in range (undefined when not given); a `UsageError` otherwise. */
export function intArg(name: string, value: string | undefined, min: number, max: number): number | undefined;
/** Writes a file, making its folder. */
export function writeFile(file: string, data: string | Uint8Array): void;
