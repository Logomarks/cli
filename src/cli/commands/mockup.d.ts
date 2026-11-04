import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** What `mockup` takes. */
export const spec: ArgSpec;
/** Runs `mockup`; resolves to its exit code (0). */
export function run(args: Parsed, io: IO): Promise<number>;
