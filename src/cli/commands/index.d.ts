import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';
import type { CommandHelp } from '../help.js';

/** A verb: the arguments it takes and how it runs. */
export interface Command {
	spec: ArgSpec;
	/** What `logomarks <verb> --help` prints. */
	help: CommandHelp;
	/** Runs the verb and resolves to its exit code (0 pass, 1 fail). */
	run(args: Parsed, io: IO): Promise<number>;
}

/** Every verb the CLI runs. */
export const COMMANDS: Readonly<Record<'check' | 'similar' | 'specks' | 'sheet' | 'find' | 'parts' | 'glitch' | 'edit' | 'combine' | 'get' | 'kit' | 'social' | 'mockup' | 'cover' | 'mcp', Command>>;
