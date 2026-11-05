import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `sheet` takes. */
export const spec: ArgSpec;
/** What `logomarks sheet --help` prints. */
export const help: CommandHelp;
/** Runs `sheet`; resolves to its exit code (0 pass, 1 fail). */
export function run(args: Parsed, io: IO): Promise<number>;
