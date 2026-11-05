import type { Report } from '../checks/index.js';

/** A check report as readable lines. */
export function reportLines(file: string, r: Report, fixed?: boolean): string;
