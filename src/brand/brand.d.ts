import type { BrandInput } from '@logomarks/brand-kit';
import type { Mark } from './mark.js';
import type { FontId } from './fonts.js';

/** What a brand is built from. */
export interface BrandOptions {
	mark: Mark;
	/** The brand's name (the mark's). */
	name?: string;
	/** The brand colour, hex (Logomarks' yellow). */
	color?: string;
	/** A bundled face (inter). */
	font?: FontId;
	/** A line under the name on social images and the sheet. */
	tagline?: string;
	/** The website, for the sheet and the email signature. */
	url?: string;
	/** The social handle (`@` and the slug). */
	handle?: string;
}

/** The brand as `@logomarks/brand-kit` takes it; a live mark is credited (CC0). */
export function brandInput(o: BrandOptions): BrandInput;
