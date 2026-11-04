/** How to render. */
export interface RenderOptions {
	/** Scale to this width in pixels (the SVG's own size otherwise). */
	width?: number;
	/** Load the bundled typeface, for SVGs with text. */
	text?: boolean;
	/** Encode a PNG too. */
	png?: boolean;
}

/** A rendered image. */
export interface Rendered {
	width: number;
	height: number;
	/** RGBA, row by row. */
	pixels: Uint8Array;
	/** The image as PNG bytes, when asked for. */
	png?: Uint8Array;
}

/** Loads the WebAssembly renderer (once); every render awaits it. */
export function initRenderer(): Promise<void>;
/** Renders an SVG with resvg (WebAssembly). */
export function render(svg: string, o?: RenderOptions): Promise<Rendered>;
/** A mark's coverage (alpha, 0–1) at `size` pixels wide, `currentColor` filled black. */
export function coverage(svg: string, size: number): Promise<Float32Array>;
