/** A brand's palette, from one colour. */
export interface Palette {
	/** The brand colour. */
	primary: string;
	/** Black or white on it, whichever reads better. */
	onPrimary: string;
	/** A near-black and a near-white tinted with the brand's hue: the dark and light grounds. */
	ink: string;
	paper: string;
	/** Tints and shades, `50` (lightest) to `950`. */
	scale: Record<string, string>;
	/** Text colours that clear AA (4.5:1): body text, and the brand colour as text (darkened or lightened when it must be). */
	text: { onLight: string; onDark: string; primaryOnLight: string; primaryOnDark: string };
	/** The mark's colour on each ground: the brand colour, or the nearest step that clears 3:1 (graphics). */
	mark: { onLight: string; onDark: string };
	/** The brand colour's contrast with its text, the light ground and the dark ground. */
	contrast: { onPrimary: number; onLight: number; onDark: number };
}

/** The brand colour when none is given: the site's yellow. */
export const DEFAULT_COLOR: string;
/** The untinted ink and paper. */
export const INK: string;
export const PAPER: string;
/** WCAG thresholds: AA text, AAA text, large text and graphics. */
export const AA: number;
export const AAA: number;
export const GRAPHIC: number;

/** `#RRGGBB` from `#rgb`, `#rrggbb` (the `#` optional), `black` or `white`; null otherwise. */
export function parseColor(input: string): string | null;
/** A hex colour's channels, 0–255. */
export function rgb(hex: string): [number, number, number];
/** Channels (clamped) as `#RRGGBB`. */
export function toHex(c: readonly number[]): string;
/** WCAG relative luminance, 0–1. */
export function luminance(hex: string): number;
/** WCAG contrast, 1–21, to two decimals. */
export function contrast(a: string, b: string): number;
/** Two colours mixed in sRGB, `t` from 0 to 1. */
export function mix(a: string, b: string, t: number): string;
/** A colour as OKLCH: lightness, chroma, hue (degrees). */
export function toOklch(hex: string): [number, number, number];
/** OKLCH as hex, chroma reduced into sRGB. */
export function fromOklch(L: number, C: number, H: number): string;
/** The 50–950 scale in the colour's hue. */
export function scale(hex: string): Record<string, string>;
/** Black or white on a colour, whichever reads better. */
export function onColor(bg: string): string;
/** The first colour clearing `min` contrast on `ground`, else the last. */
export function firstClearing(options: readonly string[], ground: string, min: number): string;
/** A brand's palette from one colour. */
export function palette(hex: string): Palette;
