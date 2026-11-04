/** How to render. */
export interface RenderOptions {
	/** Scale to this width in pixels (the SVG's own size otherwise). */
	width?: number;
	/** Load the bundled typefaces, for SVGs with text. */
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

/** An SVG with its text as outlines. */
export interface Outlined {
	/** resvg's tree written back out: paths only, no fonts needed. */
	svg: string;
	/** The box round what it draws; null when it draws nothing. */
	box: { x: number; y: number; w: number; h: number } | null;
}

/** Loads the WebAssembly renderer (once); every render awaits it. */
export function initRenderer(): Promise<void>;
/** Loads the renderer and reads the typefaces up front (for long-lived processes). */
export function warmRenderer(): Promise<void>;
/** Renders an SVG with resvg (WebAssembly). */
export function render(svg: string, o?: RenderOptions): Promise<Rendered>;
/** Sets an SVG's text (in the bundled typefaces) as outlines, and measures it. */
export function outline(svg: string): Promise<Outlined>;
/** A mark's coverage (alpha, 0–1) at `size` pixels wide, `currentColor` filled black. */
export function coverage(svg: string, size: number): Promise<Float32Array>;
