import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** What `kit` takes. */
export const spec: ArgSpec;
/** Runs `kit`; resolves to its exit code (0). */
export function run(args: Parsed, io: IO): Promise<number>;
