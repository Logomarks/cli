import type { FontId } from './fonts.js';
import type { Palette } from './color.js';
import type { Layout } from './lockup.js';

/** What branded artwork is made of. */
export interface ArtworkOptions {
	/** The mark's SVG. */
	mark: string;
	/** The brand's name. */
	name: string;
	font: FontId;
	palette: Palette;
	/** The size in pixels. */
	width: number;
	height: number;
	/** The lockup's layout (`horizontal`). */
	layout?: Layout;
	/** How much of the width the lockup may take (0.6; 80% of that of the height). */
	fill?: number;
	/** The ground (the brand colour). */
	ground?: string;
	/** The mark's colour (the one that reads on the brand colour) and the name's (the mark's). */
	markColor?: string;
	textColor?: string;
	/** The mark large and faint, bleeding off the right. */
	motif?: boolean;
}

/** The brand colour edge to edge with the lockup centred on it, as SVG. */
export function artwork(o: ArtworkOptions): Promise<string>;
