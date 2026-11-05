import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** What `social` takes. */
export const spec: ArgSpec;
/** Runs `social`; resolves to its exit code. */
export function run(args: Parsed, io: IO): Promise<number>;
