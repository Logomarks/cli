import type { FilledPath } from '@logomarks/core/svg';
import type { Finding } from './finding.js';

export type { RunGroup } from '@logomarks/core/analyse';

/** Thin strokes, narrow gaps and uneven gaps (all warnings). */
export function widthFindings(paths: readonly FilledPath[]): Finding[];
