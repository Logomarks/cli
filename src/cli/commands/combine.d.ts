import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `combine` takes. */
export const spec: ArgSpec;
/** What `logomarks combine --help` prints. */
export const help: CommandHelp;
/** Runs `combine`; resolves to its exit code. */
export function run(args: Parsed, io: IO): Promise<number>;
