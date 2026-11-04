/** Where the CLI writes: lines to stdout and stderr. */
export interface IO {
	out(s: string): void;
	err(s: string): void;
}

/** The help text. */
export const HELP: string;
/** Runs the CLI with `argv` (no node or script) and resolves to its exit code: 0 pass, 1 fail, 2 usage. */
export function main(argv: readonly string[], io?: IO): Promise<number>;
