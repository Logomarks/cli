import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** What `edit` takes. */
export const spec: ArgSpec;
/** Runs `edit`; resolves to its exit code. */
export function run(args: Parsed, io: IO): Promise<number>;
