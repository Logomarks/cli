/** Where the CLI writes: lines to stdout and stderr. */
export interface IO {
	out(s: string): void;
	err(s: string): void;
}

/** The help text: every verb in a line, the common examples, and where to read more. */
export const HELP: string;
/** Runs the CLI with `argv` (no node or script) and resolves to its exit code: 0 ok, 1 a check failed or the command failed, 2 usage. */
export function main(argv: readonly string[], io?: IO): Promise<number>;
