/**
 * @module logomarks/similar/signature
 *
 * What two marks are compared by (dupcheck.mjs and holecheck.mjs), rendered with
 * the CLI's renderer and measured by @logomarks/marks-kit: the outline (48 px,
 * blurred 3×3) and the letter (a badge's holes or a letter mark's ink, cropped
 * to 40 px), both compared by overlap (IoU) in all 8 rotations and flips.
 */

import { blur, variants, iou, outlineSignature as signatureOf, letterSignatures as lettersOf } from '@logomarks/marks-kit/similar';
import { SIMILAR, LETTERS } from '../rules.js';
import { coverage } from '../raster/render.js';

export { blur, variants, iou };

/**
 * A mark's coverage at the signature's size (48 px), before the blur: what the index stores.
 *
 * @param {string} svg The mark.
 * @returns {Promise<Float32Array>} Coverage 0–1.
 */
export const outlineCoverage = (svg) => coverage(svg, SIMILAR.size);

/**
 * A mark's outline signature: 48 px, blurred.
 *
 * @param {string} svg The mark.
 * @returns {Promise<Float32Array>} The signature.
 */
export async function outlineSignature(svg) {
	return signatureOf(await outlineCoverage(svg), SIMILAR.size);
}

/**
 * A mark's letter signatures: its holes (null when it has none) and its ink, cropped to 40 px.
 *
 * @param {string} svg The mark.
 * @returns {Promise<import('./signature.js').LetterSignatures>} The signatures.
 */
export async function letterSignatures(svg) {
	return lettersOf(await coverage(svg, LETTERS.render), LETTERS.render, LETTERS.size);
}
