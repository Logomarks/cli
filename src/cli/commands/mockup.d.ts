import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** What `mockup` takes. */
export const spec: ArgSpec;
/** What `logomarks mockup --help` prints. */
export const help: CommandHelp;
/** Runs `mockup`; resolves to its exit code (0). */
export function run(args: Parsed, io: IO): Promise<number>;
