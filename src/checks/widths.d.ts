import type { FilledPath } from '@logomarks/marks-kit/svg';
import type { Finding } from './finding.js';

export type { RunGroup } from '@logomarks/marks-kit/analyse';

/** Thin strokes, narrow gaps and uneven gaps (all warnings). */
export function widthFindings(paths: readonly FilledPath[]): Finding[];
