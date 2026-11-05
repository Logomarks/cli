import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `kit` takes. */
export const spec: ArgSpec;
/** What `logomarks kit --help` prints. */
export const help: CommandHelp;
/** Runs `kit`; resolves to its exit code (0). */
export function run(args: Parsed, io: IO): Promise<number>;
