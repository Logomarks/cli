/** How a line of text looks. */
export interface TextStyle {
	/** Pixels (13). */
	size?: number;
	color?: string;
	/** 400 or 600 (400). */
	weight?: number;
	anchor?: 'start' | 'middle' | 'end';
	/** A bundled face's family (IBM Plex Mono, semibold at 600). */
	font?: string;
}

/** Text made safe for XML. */
export function esc(s: string): string;
/** A line of text at a baseline. */
export function text(x: number, y: number, s: string, o?: TextStyle): string;
/** A rounded rectangle, with an optional outline. */
export function panel(x: number, y: number, w: number, h: number, fill: string, o?: { r?: number; stroke?: string }): string;
/** A mark drawn in a square of side `size`, in one colour. */
export function mark(svg: string, x: number, y: number, size: number, color: string): string;
/** A PNG placed at a size, scaled by nearest neighbour so its pixels show. */
export function pixels(png: Uint8Array, x: number, y: number, size: number): string;
/** An SVG (with a `viewBox`) placed in a box, scaled to fit and centred. */
export function nest(svg: string, x: number, y: number, w: number, h: number): string;
/** A PNG placed in a box, smoothly scaled. */
export function image(png: Uint8Array, x: number, y: number, w: number, h: number): string;
