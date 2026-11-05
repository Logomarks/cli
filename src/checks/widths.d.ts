import type { FilledPath } from '@arraypress/marks-kit/svg';
import type { Finding } from './finding.js';

export type { RunGroup } from '@arraypress/marks-kit/analyse';

/** Thin strokes, narrow gaps and uneven gaps (all warnings). */
export function widthFindings(paths: readonly FilledPath[]): Finding[];
