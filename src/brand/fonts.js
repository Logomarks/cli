/**
 * @module logomarks/brand/fonts
 *
 * The bundled typefaces, all SIL Open Font License, as plain TrueType (resvg
 * reads it) in `data/fonts/` (`scripts/fonts.js` writes them): Fontsource's
 * latin subsets, except the faces with a Reserved Font Name, bundled whole
 * (see {@link UPSTREAM}). IBM Plex Mono sets the sheets' labels; the rest set
 * a brand's name. Four are for restaurants: Fraunces (a warm serif: bistros,
 * wine bars), Cagliostro (a flared sans, set wide), Limelight (art deco) and
 * Shrikhand (retro chunky: diners, brunch, ice cream).
 * Each file is one face. An SVG names it by `family` and `weight`: most files
 * are a family of their own (`Inter SemiBold`), but Plex Mono's two share
 * `IBM Plex Mono`, so the weight picks the semibold.
 */

/** The typefaces a brand's name can be set in, by id. */
export const FONTS = {
	inter: { name: 'Inter', family: 'Inter SemiBold', weight: 600, file: 'Inter-SemiBold.ttf', tracking: -0.02, google: 'Inter' },
	'space-grotesk': { name: 'Space Grotesk', family: 'Space Grotesk SemiBold', weight: 600, file: 'SpaceGrotesk-SemiBold.ttf', tracking: -0.02, google: 'Space Grotesk' },
	'instrument-sans': { name: 'Instrument Sans', family: 'Instrument Sans SemiBold', weight: 600, file: 'InstrumentSans-SemiBold.ttf', tracking: -0.015, google: 'Instrument Sans' },
	'bricolage-grotesque': { name: 'Bricolage Grotesque', family: 'Bricolage Grotesque SemiBold', weight: 600, file: 'BricolageGrotesque-SemiBold.ttf', tracking: -0.02, google: 'Bricolage Grotesque' },
	'instrument-serif': { name: 'Instrument Serif', family: 'Instrument Serif', weight: 400, file: 'InstrumentSerif-Regular.ttf', tracking: -0.01, google: 'Instrument Serif' },
	fraunces: { name: 'Fraunces', family: 'Fraunces SemiBold', weight: 600, file: 'Fraunces-SemiBold.ttf', tracking: -0.02, google: 'Fraunces' },
	cagliostro: { name: 'Cagliostro', family: 'Cagliostro', weight: 400, file: 'Cagliostro-Regular.ttf', tracking: 0.3, google: 'Cagliostro' },
	limelight: { name: 'Limelight', family: 'Limelight', weight: 400, file: 'Limelight-Regular.ttf', tracking: 0.06, google: 'Limelight' },
	shrikhand: { name: 'Shrikhand', family: 'Shrikhand', weight: 400, file: 'Shrikhand-Regular.ttf', tracking: 0, google: 'Shrikhand' },
	'plex-mono': { name: 'IBM Plex Mono', family: 'IBM Plex Mono', weight: 600, file: 'IBMPlexMono-SemiBold.ttf', tracking: -0.02, google: 'IBM Plex Mono' },
};

/** The name's typeface when none is asked for. */
export const DEFAULT_FONT = 'inter';

/** The labels' family (the review sheet and the brand sheet), regular and semibold by weight. */
export const LABEL_FONT = 'IBM Plex Mono';

/** google/fonts at one commit, where the whole files come from. */
const GOOGLE_FONTS = 'https://raw.githubusercontent.com/google/fonts/24ddc1f324cac5d9f5aedca126d298f56e3f1640/ofl';

/**
 * The files bundled whole, byte for byte as published, by file: the faces
 * with a Reserved Font Name, which the OFL lets no Modified Version (a subset
 * is one) carry. `scripts/fonts.js` fetches each and checks its sha256, and
 * its licence comes from the `OFL.txt` beside it. (The studio's webfonts are
 * Fontsource's subsets, the usual web-font distribution; this is about the
 * files the package ships.)
 */
export const UPSTREAM = {
	'Cagliostro-Regular.ttf': { url: `${GOOGLE_FONTS}/cagliostro/Cagliostro-Regular.ttf`, sha256: '0d205e9a9b34691dca50064ea681404157f1747e39b592fce978b2a32bd5fb61' },
	'Limelight-Regular.ttf': { url: `${GOOGLE_FONTS}/limelight/Limelight-Regular.ttf`, sha256: 'f5bf8a9159adfc5b9c756c85d812a4fd1299b8916fefdf39ad4b24ade6d8d0cf' },
	'IBMPlexMono-SemiBold.ttf': { url: `${GOOGLE_FONTS}/ibmplexmono/IBMPlexMono-SemiBold.ttf`, sha256: 'd3c38e55c78f5b0f28009fddba4834ec503278936a5986032424c9bd2d23aa46' },
	'IBMPlexMono-Regular.ttf': { url: `${GOOGLE_FONTS}/ibmplexmono/IBMPlexMono-Regular.ttf`, sha256: '6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46' },
};

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
