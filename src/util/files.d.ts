/** Every SVG named, folders expanded (sorted, not recursive); throws when a path is missing. */
export function expandSvgs(paths: readonly string[]): string[];
/** A mark's name from its file: the slug. */
export function slugOf(file: string): string;
/** Writes a file, making its folder. */
export function writeFile(file: string, data: string | Uint8Array): void;
