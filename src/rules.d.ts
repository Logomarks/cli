/** The canvas side: `viewBox="0 0 512 512"`. */
export const CANVAS: 512;
/** The mark's longest side, measured on the real outline. */
export const FIT: 448;
/** The margin a fitted mark leaves on its long side (32). */
export const MARGIN: number;
/** Where a fitted mark's box is centred (256). */
export const CENTRE: number;
/** How far size, centre and canvas edges may drift (0.5). */
export const FIT_TOLERANCE: number;
/** Decimal places in coordinates (1). */
export const DECIMALS: number;
/** Markup a finished mark must not contain. */
export const FORBIDDEN_MARKUP: RegExp;

/** Speck, sliver and pin-hole limits (square units, units). */
export const SPECKS: Readonly<{
	/** A piece under this area is a speck (60). */
	piece: number;
	/** A hole under this area is a pin-hole (30). */
	hole: number;
	/** Under this area a part is two outlines touching, left out (0.5). */
	tiny: number;
	/** Mean width under this is an invisible hairline, left out (0.12). */
	hairline: number;
	/** A small piece thinner than this is a sliver rather than a speck (3). */
	sliver: number;
	/** This many small parts of one area are a pattern, left out (6). */
	repeat: number;
	/** How alike two areas must be to repeat: vector and raster reads. */
	repeatTolerance: Readonly<{ vector: number; raster: number }>;
	/** Pixels a unit for the raster read (8). */
	rasterScale: number;
}>;

/** Live marks whose small parts were reviewed and kept, with the reason. */
export const REVIEWED: Readonly<Record<string, string>>;

/** Gaps, and what counts as an even run (units). */
export const GAPS: Readonly<{
	/** The house gap (22). */
	house: number;
	/** The bold family's range (20–24). */
	range: [number, number];
	/** Gaps further apart than this are different gaps (3). */
	same: number;
	/** How much a run may widen along its length (2). */
	tolerance: number;
	/** How much most of it may vary (1). */
	spread: number;
	/** How many times its width a run is long (3). */
	run: number;
	/** The shortest run (16). */
	shortest: number;
	/** Wider runs are space, not cuts (32). */
	widest: number;
	/** Narrower runs are hairlines (1). */
	narrowest: number;
}>;

/** Nothing narrower than this, ink or gap (10). */
export const MIN_FEATURE: number;
/** Pixels a unit for the width read (2). */
export const WIDTH_SCALE: number;
/** How far a width read can be off (0.5). */
export const WIDTH_PRECISION: number;
/** The chip sizes a mark must read at. */
export const CHIPS: readonly [32, 16];

/** Outline near-duplicates: raster size, and the too-close and near-copy scores. */
export const SIMILAR: Readonly<{ size: number; tooClose: number; nearCopy: number }>;
/** Knocked-out letters: render size, crop size, and the too-close and near-copy scores. */
export const LETTERS: Readonly<{ render: number; size: number; tooClose: number; nearCopy: number }>;
