import type { Parsed } from './args.js';
import type { BrandOptions } from '../brand/brand.js';
import type { PackOptions } from '../kit/index.js';
import type { Mark } from '../brand/mark.js';
import type { FontId } from '../brand/fonts.js';

/** The mark the positionals name (a live slug or name, or an .svg file); a `UsageError` otherwise. */
export function markArg(positionals: readonly string[]): Mark;
/** One mark by slug, name or file; a `UsageError` when it isn't found. */
export function markOf(ref: string): Mark;
/** A number option (undefined when not given); a `UsageError` when it isn't one. */
export function numArg(name: string, value: string | undefined): number | undefined;
/** A colour option as `#RRGGBB` (undefined when not given); a `UsageError` when it isn't one. */
export function colorArg(value: string | undefined): string | undefined;
/** A typeface option as its id (undefined when not given); a `UsageError` when it isn't bundled. */
export function fontArg(value: string | undefined): FontId | undefined;
/** A whole-number option in range (undefined when not given); a `UsageError` otherwise. */
export function intArg(name: string, value: string | undefined, min: number, max: number): number | undefined;
/** Writes a file, making its folder. */
export function writeFile(file: string, data: string | Uint8Array): void;
/** Writes files by path under a folder; returns how many. */
export function writeFiles(dir: string, files: Iterable<[string, string | Uint8Array]>): number;
/** A comma-separated option as a trimmed list (undefined when not given). */
export function listArg(value: string | undefined): string[] | undefined;
/** The brand: the mark, and `--name --color --font --tagline --url --handle`; a `UsageError` when one is wrong. */
export function brandArgs(args: Parsed): BrandOptions & { mark: Mark; name: string };
/** The social pack's `--platforms`, `--styles` and `--animated`; a `UsageError` for an unknown style. */
export function packArgs(args: Parsed): PackOptions;
/** Runs a call, its RangeErrors and TypeErrors (an unknown platform, style or object) as `UsageError`s. */
export function asUsage<T>(build: () => Promise<T>): Promise<T>;
