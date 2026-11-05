import type { Edited } from './doc.js';

/** A glitch preset. */
export type GlitchPreset = 'shear' | 'slice' | 'bands' | 'stepped' | 'lane';

/** A glitch's settings. */
export interface GlitchOptions {
	preset: GlitchPreset;
	/** The cut's direction in degrees, clockwise from across (the mark's own slope for a shear; across the lanes for a lane change; else 0). */
	angle?: number;
	/** Where the first cut crosses, 0–1 across the mark (seeded). */
	place?: number;
	/** How far the sides end up from each other along the cut (44); a band's largest nudge. */
	slide?: number;
	/** The gap at each cut (22). */
	gap?: number;
	/** Cuts for a slice (1–3), bands for bands (3–5); seeded. */
	cuts?: number;
	/** Places the cuts (1): the same seed gives the same bytes. */
	seed?: number;
	/** The mark's name, for the checks. */
	name?: string;
}

/** A glitch edition. */
export interface Glitched extends Edited {
	glitch: {
		preset: GlitchPreset;
		seed: number;
		/** The cut direction used. */
		angle: number;
		cuts: number;
		pieces: number;
		/** Placements tried before the one used. */
		nudged: number;
		/** Stray pieces dropped. */
		removed: number;
		/** A lane change's lane pitch, else null. */
		pitch: number | null;
	};
}

/** The presets by name, and the editor's own. */
export const PRESETS: Readonly<Record<GlitchPreset, 'shear' | 'slice' | 'bandShift' | 'stepped' | 'laneChange'>>;
/** What each preset does. */
export const PRESET_ABOUT: Record<GlitchPreset, string>;
/** A glitch edition, fitted and checked; a RangeError for an unknown preset or no clean cut. */
export function glitchMark(svg: string, o: GlitchOptions): Glitched;
