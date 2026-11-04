/** The output's colours (plain text off a terminal or with `NO_COLOR`). */
export const style: Readonly<Record<'red' | 'yellow' | 'green' | 'dim' | 'bold', (s: string) => string>>;
/** Text padded to a width, ignoring colour codes. */
export function pad(s: string, n: number): string;
