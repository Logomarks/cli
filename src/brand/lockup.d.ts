import type { FontId } from './fonts.js';

/** How a lockup is laid out. */
export type Layout = 'horizontal' | 'stacked' | 'mark';

/** What a lockup is made of. */
export interface LockupOptions {
	/** The mark's SVG. */
	mark: string;
	/** The brand's name (left out for `mark`, or when empty). */
	name: string;
	/** The name's face. */
	font: FontId;
	/** `horizontal` (default), `stacked` or `mark`. */
	layout?: Layout;
	markColor: string;
	/** The name's colour (the mark's). */
	textColor?: string;
	/** A ground behind it (transparent otherwise). */
	ground?: string;
	/** Clear space all round, as a share of the mark's height (0.25). */
	clear?: number;
}

/** A lockup. */
export interface Lockup {
	/** A standalone SVG, the name as outlines. */
	svg: string;
	/** Its markup without the `<svg>`, to place in a `viewBox` of `0 0 width height`. */
	body: string;
	width: number;
	height: number;
}

/** The proportions, as shares of the mark's drawn height. */
export const LOCKUP: {
	readonly mark: number;
	readonly wide: number;
	readonly cap: { readonly horizontal: number; readonly stacked: number };
	readonly gap: { readonly horizontal: number; readonly stacked: number };
	readonly clear: number;
};
/** The layouts. */
export const LAYOUTS: readonly Layout[];
/** The mark and the name, laid out on the ink. */
export function lockup(o: LockupOptions): Promise<Lockup>;
