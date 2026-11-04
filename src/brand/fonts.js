/**
 * @module logomarks/brand/fonts
 *
 * The bundled typefaces, all SIL Open Font License, latin only, as plain
 * TrueType (resvg reads it) in `data/fonts/` (`scripts/fonts.js` writes
 * them). IBM Plex Mono sets the sheets' labels; the rest set a brand's name.
 * Each file is one face, named in its own family (`Inter SemiBold`), so an
 * SVG names the face by `family` and never needs a weight.
 */

/** The typefaces a brand's name can be set in, by id. */
export const FONTS = {
	inter: { name: 'Inter', family: 'Inter SemiBold', weight: 600, file: 'Inter-SemiBold.ttf', tracking: -0.02, google: 'Inter' },
	'space-grotesk': { name: 'Space Grotesk', family: 'Space Grotesk SemiBold', weight: 600, file: 'SpaceGrotesk-SemiBold.ttf', tracking: -0.02, google: 'Space Grotesk' },
	'instrument-sans': { name: 'Instrument Sans', family: 'Instrument Sans SemiBold', weight: 600, file: 'InstrumentSans-SemiBold.ttf', tracking: -0.015, google: 'Instrument Sans' },
	'bricolage-grotesque': { name: 'Bricolage Grotesque', family: 'Bricolage Grotesque SemiBold', weight: 600, file: 'BricolageGrotesque-SemiBold.ttf', tracking: -0.02, google: 'Bricolage Grotesque' },
	'instrument-serif': { name: 'Instrument Serif', family: 'Instrument Serif', weight: 400, file: 'InstrumentSerif-Regular.ttf', tracking: -0.01, google: 'Instrument Serif' },
	'plex-mono': { name: 'IBM Plex Mono', family: 'IBM Plex Mono SemiBold', weight: 600, file: 'IBMPlexMono-SemiBold.ttf', tracking: -0.02, google: 'IBM Plex Mono' },
};

/** The name's typeface when none is asked for. */
export const DEFAULT_FONT = 'inter';

/** The labels' faces (the review sheet and the brand sheet): regular and semibold. */
export const LABEL_FONT = 'IBM Plex Mono';
export const LABEL_FONT_BOLD = 'IBM Plex Mono SemiBold';

/** Every bundled file: the brand faces and Plex Mono's regular, for labels. */
const FILES = [...new Set([...Object.values(FONTS).map((f) => f.file), 'IBMPlexMono-Regular.ttf'])];

/**
 * Where every bundled font file is.
 *
 * @returns {URL[]} The files.
 */
export const fontFiles = () => FILES.map((f) => new URL(`../../data/fonts/${f}`, import.meta.url));

/**
 * A typeface by id or name, any case (`space-grotesk`, `Space Grotesk`).
 *
 * @param {string} name The id or name.
 * @returns {import('./fonts.js').FontId | null} Its id, or null when it isn't bundled.
 */
export function fontId(name) {
	const key = name.trim().toLowerCase().replace(/\s+/g, '-');
	if (key in FONTS) return /** @type {import('./fonts.js').FontId} */ (key);
	const hit = Object.entries(FONTS).find(([, f]) => f.name.toLowerCase().replace(/\s+/g, '-') === key);
	return hit ? /** @type {import('./fonts.js').FontId} */ (hit[0]) : null;
}
