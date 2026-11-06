import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `similar` takes. */
export const spec: ArgSpec;
/** What `logomarks similar --help` prints. */
export const help: CommandHelp;
/** Runs `similar`; resolves to its exit code (0 pass, 1 fail). */
export function run(args: Parsed, io: IO): Promise<number>;
