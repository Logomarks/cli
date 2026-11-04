import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** What `get` takes. */
export const spec: ArgSpec;
/** Runs `get`; resolves to its exit code (0). */
export function run(args: Parsed, io: IO): Promise<number>;
