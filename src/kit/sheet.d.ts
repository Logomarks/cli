import type { Mark } from '../brand/mark.js';
import type { Palette } from '../brand/color.js';
import type { FontId } from '../brand/fonts.js';

/** What the brand sheet shows. */
export interface SheetOptions {
	mark: Mark;
	name: string;
	font: FontId;
	palette: Palette;
	/** The social images, already drawn (PNG). */
	social: { avatar: Uint8Array; 'x-header': Uint8Array; og: Uint8Array };
}

/** The brand on one page, as a PNG 1600 px wide. */
export function brandSheet(o: SheetOptions): Promise<Uint8Array>;
