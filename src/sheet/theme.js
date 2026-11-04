/**
 * @module logomarks/sheet/theme
 *
 * The review sheet's colours, type and sizes, in one place.
 */

/** Colours: a dark page, the two grounds a mark is judged on, and the verdict colours. */
export const COLORS = {
	page: '#0c0c0c',
	card: '#171717',
	line: '#2a2a2a',
	text: '#f2f2f2',
	muted: '#8c8c8c',
	dark: '#000000',
	darkInk: '#f4f4f2',
	light: '#f4f4f2',
	lightInk: '#111111',
	error: '#ff5c64',
	warning: '#f5b941',
	info: '#8c8c8c',
	pass: '#5cffc0',
};

/** The typeface (bundled). */
export const FONT = 'IBM Plex Mono';

/** Card geometry in pixels. */
export const CARD = {
	width: 1400,
	pad: 24,
	gap: 16,
	/** The header row. */
	head: 56,
	/** The large views' side. */
	large: 300,
	/** The chips column's width. */
	chips: 236,
	/** A neighbour tile's side. */
	neighbour: 140,
	/** A badge's height. */
	badge: 28,
};

/** How much each chip is magnified beside its actual size, so its pixels can be seen. */
export const ZOOM = { 32: 3, 16: 4 };
