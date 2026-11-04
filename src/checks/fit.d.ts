import type { Bounds } from '../svg/outline.js';
import type { Shape } from '../svg/shapes.js';
import type { Finding } from './finding.js';

/** The standard's findings: viewBox, size, centre, clipping, markup, fill colour and precision. */
export function fitFindings(svg: string, b: Bounds, paths: readonly Shape[]): Finding[];
