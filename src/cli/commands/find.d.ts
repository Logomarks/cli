import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `find` takes. */
export const spec: ArgSpec;
/** What `logomarks find --help` prints. */
export const help: CommandHelp;
/** Runs `find`; resolves to its exit code (0 found, 1 nothing matched). */
export function run(args: Parsed, io: IO): Promise<number>;
