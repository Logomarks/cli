import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `edit` takes. */
export const spec: ArgSpec;
/** What `logomarks edit --help` prints. */
export const help: CommandHelp;
/** Runs `edit`; resolves to its exit code. */
export function run(args: Parsed, io: IO): Promise<number>;
