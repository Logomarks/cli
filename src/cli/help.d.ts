/** A verb's help. */
export interface CommandHelp {
	/** What it does, in one line. */
	summary: string;
	/** How to call it, after `logomarks <verb>`; one line per form. */
	usage: string[];
	/** Lines of explanation between the usage and the options. */
	about?: string[];
	/** Each option and what it does (`\n` starts an indented line). */
	options?: ReadonlyArray<readonly [string, string]>;
	/** Whether it takes `--json` (default true). */
	json?: boolean;
	/** Example command lines. */
	examples?: string[];
}

/** Names joined with commas and wrapped to `width`, later lines starting with `indent`. */
export function wrapList(names: readonly string[], width?: number, indent?: string): string;
/** A verb's help as text, with the options every verb takes (`--json`, `--help`) listed last. */
export function formatHelp(verb: string, help: CommandHelp): string;
