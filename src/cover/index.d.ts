import type { Mark } from '../brand/mark.js';

/** What a recipe is built from. */
export interface CoverBrand {
	/** The mark's SVG. */
	mark: string;
	/** The brand colour. */
	color: string;
	/** Whether the cover has a title (the mark moves out of its way). */
	titled: boolean;
}

/** A curated recipe: what it looks like, and its `@arraypress/covers` options. */
export interface CoverRecipe {
	about: string;
	options: (b: CoverBrand) => Record<string, unknown>;
}

/** What to draw. */
export interface CoverOptions {
	mark: Mark;
	/** One of `RECIPES` (`mark`). */
	recipe?: string;
	title?: string;
	/** A small line over the title. */
	label?: string;
	/** The brand colour (the site's yellow). */
	color?: string;
	/** `og` (1200 × 630, the default), `1:1`, `16:9`, `4:5`, `3:2`, `4:3`, `2:1`, `9:16`, any `w:h`, or a number. */
	aspect?: string | number;
	/** Pixels wide (1200). */
	width?: number;
	/** Drives every random choice (the mark's slug). */
	seed?: string;
}

/** A cover. */
export interface Cover {
	png: Uint8Array;
	/** The SVG, text as outlines. */
	svg: string;
	width: number;
	height: number;
}

/** The curated recipes, by name. */
export const RECIPES: Record<string, CoverRecipe>;
/** A cover with the mark on it, as PNG (resvg) and SVG. Throws a TypeError for an unknown recipe. */
export function cover(o: CoverOptions): Promise<Cover>;
