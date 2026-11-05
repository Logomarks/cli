import type { FilledPath } from '@arraypress/marks-kit/svg';
import type { Finding } from './finding.js';

/** Specks, slivers and pin-holes, smallest first; `name` (the slug) seeds the jitter and finds reviewed marks. */
export function speckFindings(paths: readonly FilledPath[], name: string): Finding[];
