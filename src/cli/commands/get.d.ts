import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `get` takes. */
export const spec: ArgSpec;
/** What `logomarks get --help` prints. */
export const help: CommandHelp;
/** Runs `get`; resolves to its exit code (0). */
export function run(args: Parsed, io: IO): Promise<number>;
