/** A 3×3 box blur of a square image of side `N`, averaging only pixels inside it. */
export function blur(a: Float32Array, N: number): Float32Array;
/** A mark's 48 px coverage (0–1), before the blur: what the index stores. */
export function outlineCoverage(svg: string): Promise<Float32Array>;
/** A mark's outline signature: 48 px coverage, blurred 3×3. */
export function outlineSignature(svg: string): Promise<Float32Array>;
/** A mark's holes (null when it has none) and its ink, each cropped to its box at 40 px. */
export function letterSignatures(svg: string): Promise<{ holes: Float32Array | null; ink: Float32Array }>;
/** A square image in all 8 rotations and flips. */
export function variants(a: Float32Array): Float32Array[];
/** Overlap (IoU) of two images: the sum of minima over the sum of maxima. */
export function iou(a: ArrayLike<number>, b: ArrayLike<number>): number;
