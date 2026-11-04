/**
 * @module logomarks/rules
 *
 * The house rules every Logomark is drawn to, in one place. Numbers are units
 * of the 512 canvas unless named otherwise. They come from the skill
 * (`SKILL.md`: "The standard" and the "Review checklist") and from the
 * internal pipeline (`fit.mjs`, `speckcheck.mjs`, `dupcheck.mjs`,
 * `holecheck.mjs`); each constant names its source.
 */

/** The canvas: `viewBox="0 0 512 512"` (SKILL.md, the standard). */
export const CANVAS = 512;

/** The mark's longest side, measured on the real outline (SKILL.md; fit.mjs `FIT`). */
export const FIT = 448;

/** The margin a fitted mark leaves on its long side: 32. */
export const MARGIN = (CANVAS - FIT) / 2;

/** Where a fitted mark's box is centred, on both axes. */
export const CENTRE = CANVAS / 2;

/** How far size, centre and canvas edges may drift before a fit fails (fit.mjs `TOL`). */
export const FIT_TOLERANCE = 0.5;

/** Coordinates are written to one decimal place (SKILL.md, the standard). */
export const DECIMALS = 1;

/** Markup a finished mark must not contain: flatten to filled paths (fit.mjs `check()`). */
export const FORBIDDEN_MARKUP = /<(g|style|mask|clipPath|use|text|image)\b|transform=|stroke=/;

/**
 * Stray specks, slivers and pin-holes a boolean left behind (speckcheck.mjs).
 * Small parts are reported unless they are tiny (two outlines touching at a
 * point), hairline (a zero-width sliver along an edge, invisible) or repeated
 * (a dot field, a pattern).
 */
export const SPECKS = {
	/** A piece under this area (square units) is a speck. */
	piece: 60,
	/** A hole under this area is a pin-hole. */
	hole: 30,
	/** Under this area a part is only two outlines touching: left out. */
	tiny: 0.5,
	/** Mean width (2·area/perimeter) under this is a hairline, invisible below ~4000 px: left out. */
	hairline: 0.12,
	/** A small piece thinner than this (mean width) is reported as a sliver rather than a speck. */
	sliver: 3,
	/** This many small parts of one area (within the tolerance below) are a pattern, not specks. */
	repeat: 6,
	/** How alike two areas must be to count as repeats, as a fraction: vector read, raster read. */
	repeatTolerance: { vector: 0.02, raster: 0.05 },
	/** Pixels a unit for the raster read, used when the vector read fails. */
	rasterScale: 8,
};

/**
 * Live marks looked at large (2026-11-05) and kept: their small parts are the
 * design, or can't be seen (speckcheck.mjs `REVIEWED`). A file with one of
 * these names gets its speck findings as notes, with the reason.
 */
export const REVIEWED = {
	'dot-sphere': 'a dot field clipped by its ring; the rim fragments are the clip',
	'dot-pyramid': 'dots shrinking with distance',
	halftone: 'halftone rows, the apex dot the smallest',
	'line-triangle': 'stacked bars ending in a small apex triangle',
	'spiral-delta': 'xor of rotated triangles; the small shards are the spiral',
	spirograph: 'the cells where the curve crosses itself',
	'lens-rosette': 'xor of twelve lenses; the lacy centre is where their tips cross',
	'notched-diamond': 'a 0.14-wide sliver along the cut (a separate path in the file), invisible below ~4000 px',
};

/**
 * Gaps: the cuts between parts. One width per mark; the set's gap is 22, the
 * bold family's range 20–24 (SKILL.md, "Bold negative space" and the review
 * checklist: "One gap width and one stroke weight (or a clear 1:2 ratio)").
 * Gaps and strokes are measured on a raster as runs of even width (see
 * `raster/channels.js`); the numbers below say what counts as a run.
 */
export const GAPS = {
	/** The house gap. */
	house: 22,
	/** The bold family's range. */
	range: /** @type {[number, number]} */ ([20, 24]),
	/** Gaps further apart than this (units) are different gaps. */
	same: 3,
	/** A run widens by at most this along its length (units): a cut or a stroke, not a tapering point. */
	tolerance: 2,
	/** And most of it (10th to 90th percentile) by at most this. */
	spread: 1,
	/** A run is at least this many times as long as it is wide… */
	run: 3,
	/** …and at least this long (units). */
	shortest: 16,
	/** Runs wider than this are open space or counters, not cuts (the house gap fits ~20–30 after fitting). */
	widest: 32,
	/** Runs narrower than this are hairlines (the speck check's business), not features. */
	narrowest: 1,
};

/** Nothing narrower than this, ink or gap: under it a feature closes up at 32 px (SKILL.md review checklist). */
export const MIN_FEATURE = 10;

/** Pixels a unit for the width read (gaps and strokes). */
export const WIDTH_SCALE = 2;

/** How far a width read at that scale can be off (units): a feature is only too thin below `MIN_FEATURE` less this. */
export const WIDTH_PRECISION = 0.5;

/** The small sizes a mark must read at: 32 px and 16 px chips (SKILL.md workflow and "Bold negative space"). */
export const CHIPS = /** @type {const} */ ([32, 16]);

/**
 * Near-duplicates by outline (dupcheck.mjs): each mark rastered at 48 px,
 * blurred 3×3, and compared by overlap (IoU) in all 8 rotations and flips.
 */
export const SIMILAR = {
	/** The raster's side in pixels. */
	size: 48,
	/** A score at or above this is too close: look at the two side by side. */
	tooClose: 0.72,
	/** At or above this it is a near-copy (Dot Stack vs Rack: 0.99); 1.00 is usually a rotation. */
	nearCopy: 0.9,
};

/**
 * Knocked-out letters (holecheck.mjs): badges all score high on their shared
 * outline, so the letter (the hole) is compared alone, cropped to its box.
 */
export const LETTERS = {
	/** The render's side in pixels. */
	render: 128,
	/** The cropped letter's side in pixels. */
	size: 40,
	/** Flag at or above this (a heavy A scores ~0.75 against any heavy A). */
	tooClose: 0.7,
	/** A real copy scores this or more. */
	nearCopy: 0.85,
};
