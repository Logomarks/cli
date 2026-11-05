import type { PartInfo } from './doc.js';

/** The preview's side in pixels: 512. */
export const PREVIEW_SIZE: number;
/** The mark on white, in its own colours (two tones drawn as their colours). */
export function markPreview(svg: string): Promise<Uint8Array>;
/** The mark in grey with each part's box and index. */
export function partsPreview(svg: string, parts: readonly PartInfo[]): Promise<Uint8Array>;
