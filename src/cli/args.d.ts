/** A usage error: the CLI prints it with the help and exits 2. */
export class UsageError extends Error {}

/** What a command takes. */
export interface ArgSpec {
	/** Boolean flags, without dashes (`json`). */
	flags?: string[];
	/** Options with a value, without dashes, each with a one-letter alias or '' (`{ out: 'o' }`). */
	options?: Record<string, string>;
}

/** Parsed arguments. */
export interface Parsed {
	positionals: string[];
	flags: Set<string>;
	options: Record<string, string>;
}

/** Parses a command's arguments; throws a `UsageError` on anything unknown. */
export function parseArgs(argv: readonly string[], spec: ArgSpec): Parsed;
