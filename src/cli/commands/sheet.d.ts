import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** What `sheet` takes. */
export const spec: ArgSpec;
/** Runs `sheet`; resolves to its exit code (0 pass, 1 fail). */
export function run(args: Parsed, io: IO): Promise<number>;
