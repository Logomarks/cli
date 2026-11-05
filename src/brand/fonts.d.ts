/** A bundled typeface. */
export interface Font {
	/** Its name (`Inter`). */
	name: string;
	/** The face's own family, as an SVG names it (`Inter SemiBold`). */
	family: string;
	/** The one weight bundled. */
	weight: number;
	/** Its file in `data/fonts/`. */
	file: string;
	/** Letter-spacing for a name, in em. */
	tracking: number;
	/** Its name on Google Fonts, where to get the other weights. */
	google: string;
}

/** The typefaces a brand's name can be set in (all SIL OFL 1.1). */
export const FONTS: {
	readonly inter: Font;
	readonly 'space-grotesk': Font;
	readonly 'instrument-sans': Font;
	readonly 'bricolage-grotesque': Font;
	readonly 'instrument-serif': Font;
	readonly fraunces: Font;
	readonly cagliostro: Font;
	readonly limelight: Font;
	readonly shrikhand: Font;
	readonly 'plex-mono': Font;
};

/** A typeface's id. */
export type FontId = keyof typeof FONTS;

/** The name's typeface when none is asked for: `inter`. */
export const DEFAULT_FONT: FontId;
/** The labels' regular face: IBM Plex Mono. */
export const LABEL_FONT: string;
/** The labels' semibold face. */
export const LABEL_FONT_BOLD: string;
/** Every bundled font file. */
export function fontFiles(): URL[];
/** A typeface by id or name, any case; null when it isn't bundled. */
export function fontId(name: string): FontId | null;
