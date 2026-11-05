import type { Parsed } from './args.js';
import type { IO } from './index.js';
import type { Edited } from '../edit/doc.js';

/** Writes (`-o` .svg or .png) or prints an edited mark and its checks; resolves to 0 when it passes, 1 otherwise. */
export function output(args: Parsed, io: IO, r: Edited & Record<string, unknown>, o: { name: string; summary: string }): Promise<number>;
