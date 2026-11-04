import type { Mark } from '../brand/mark.js';
import type { Palette } from '../brand/color.js';
import type { FontId } from '../brand/fonts.js';

/** What a kit is made from. */
export interface KitOptions {
	mark: Mark;
	/** The brand's name. */
	name: string;
	/** The brand colour (the site's yellow). */
	color?: string;
	/** The name's typeface (`inter`). */
	font?: FontId;
}

/** A file in the kit, by its path inside the kit's folder. */
export interface KitFile {
	path: string;
	data: string | Uint8Array;
}

/** `brand.json`. */
export interface BrandJson {
	name: string;
	slug: string;
	/** The mark; a live one has its page and licence (CC0-1.0). */
	mark: { slug: string; name: string; url?: string; licence?: string };
	colors: Palette;
	font: { id: FontId; name: string; weight: number; licence: string; url: string };
	usage: { clearSpace: string; minimum: { screen: string; print: string } };
	/** The HTML that wires the favicons up. */
	head: string;
	/** Every file in the kit. */
	files: string[];
}

/** A kit. */
export interface Kit {
	brand: BrandJson;
	files: KitFile[];
	/** The brand sheet (also in `files`). */
	sheet: Uint8Array;
}

/** The mark's PNG sizes: 16, 32, 48, 180, 192, 512, 1024. */
export const PNG_SIZES: number[];
/** The social images' sizes. */
export const SOCIAL: {
	readonly avatar: { width: number; height: number };
	readonly 'x-header': { width: number; height: number };
	readonly og: { width: number; height: number };
};
/** A free brand starter kit, as files in memory. */
export function kit(o: KitOptions): Promise<Kit>;
