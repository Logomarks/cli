/** Every SVG named, folders expanded (sorted, not recursive); throws a `UsageError` when nothing is named or a path is missing. */
export function svgFiles(paths: readonly string[]): string[];
/** A mark's name from its file: the slug. */
export function slugOf(file: string): string;
