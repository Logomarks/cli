import type { Bounds, FilledPath } from '@logomarks/marks-kit/svg';
import type { Finding } from './finding.js';

/** The standard's findings: viewBox, size, centre, clipping, markup, fill colour and precision. */
export function fitFindings(svg: string, b: Bounds, paths: readonly FilledPath[]): Finding[];
