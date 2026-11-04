/**
 * @module logomarks/brand/color
 *
 * A brand's colours from one: hex parsing, WCAG contrast, OKLCH (so a tint
 * keeps its hue), the 50–950 scale and the text colours that clear AA.
 */

/** The site's yellow: the brand colour when none is given. */
export const DEFAULT_COLOR = '#D4FF3A';

/** The ink and paper a brand is checked against, before they're tinted. */
export const INK = '#0B0B0B';
export const PAPER = '#FFFFFF';

/** The scale's steps and the OKLCH lightness of each. */
const STEPS = { 50: 0.975, 100: 0.94, 200: 0.885, 300: 0.81, 400: 0.72, 500: 0.63, 600: 0.54, 700: 0.46, 800: 0.38, 900: 0.3, 950: 0.22 };

/** WCAG's thresholds: text (AA, AAA) and large text or graphics. */
export const AA = 4.5;
export const AAA = 7;
export const GRAPHIC = 3;

/**
 * A colour as `#rrggbb`, from `#rgb`, `#rrggbb` (the `#` optional) or `black`/`white`.
 *
 * @param {string} input The colour.
 * @returns {string | null} It, upper case; null when it isn't one.
 */
export function parseColor(input) {
	const s = input.trim().toLowerCase();
	if (s === 'black') return '#000000';
	if (s === 'white') return '#FFFFFF';
	const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
	if (!m) return null;
	const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
	return `#${h.toUpperCase()}`;
}

/**
 * A hex colour's channels.
 *
 * @param {string} hex `#rrggbb`.
 * @returns {[number, number, number]} Red, green, blue, 0–255.
 */
export const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * Channels as a hex colour.
 *
 * @param {readonly number[]} c Red, green, blue, 0–255 (clamped).
 * @returns {string} `#RRGGBB`.
 */
export const toHex = (c) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

/** An sRGB channel (0–1) made linear. */
const linear = (/** @type {number} */ v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** A linear channel back to sRGB (0–1). */
const gamma = (/** @type {number} */ v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/**
 * WCAG relative luminance.
 *
 * @param {string} hex The colour.
 * @returns {number} 0 (black) to 1 (white).
 */
export function luminance(hex) {
	const [r, g, b] = rgb(hex).map((v) => linear(v / 255));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast between two colours.
 *
 * @param {string} a One.
 * @param {string} b The other.
 * @returns {number} 1 to 21.
 */
export function contrast(a, b) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/**
 * Two colours mixed in sRGB.
 *
 * @param {string} a From.
 * @param {string} b To.
 * @param {number} t How far, 0–1.
 * @returns {string} The mix.
 */
export function mix(a, b, t) {
	const A = rgb(a), B = rgb(b);
	return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

/**
 * A colour in OKLCH.
 *
 * @param {string} hex The colour.
 * @returns {[number, number, number]} Lightness 0–1, chroma, hue in degrees.
 */
export function toOklch(hex) {
	const [r, g, b] = rgb(hex).map((v) => linear(v / 255));
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

/**
 * OKLCH to linear sRGB, unclamped.
 *
 * @param {number} L Lightness.
 * @param {number} C Chroma.
 * @param {number} H Hue, degrees.
 * @returns {number[]} Linear red, green, blue (outside 0–1 when out of gamut).
 */
function oklchToLinear(L, C, H) {
	const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}

/**
 * An OKLCH colour as hex, its chroma reduced until it fits in sRGB.
 *
 * @param {number} L Lightness 0–1.
 * @param {number} C Chroma.
 * @param {number} H Hue, degrees.
 * @returns {string} `#RRGGBB`.
 */
export function fromOklch(L, C, H) {
	let c = C;
	let lin = oklchToLinear(L, c, H);
	while (c > 0.0005 && lin.some((v) => v < -0.0005 || v > 1.0005)) lin = oklchToLinear(L, (c *= 0.95), H);
	return toHex(lin.map((v) => gamma(Math.min(1, Math.max(0, v))) * 255));
}

/**
 * The 50–950 scale: the colour's hue at eleven lightnesses, its chroma eased off toward white and black.
 *
 * @param {string} hex The brand colour.
 * @returns {Record<string, string>} Hex by step.
 */
export function scale(hex) {
	const [, C, H] = toOklch(hex);
	const ease = (/** @type {number} */ L) => Math.min(1, 0.25 + 2.4 * Math.min(L, 1 - L));
	return Object.fromEntries(Object.entries(STEPS).map(([step, L]) => [step, fromOklch(L, C * ease(L), H)]));
}

/**
 * Black or white on a colour: whichever reads better.
 *
 * @param {string} bg The colour.
 * @returns {string} {@link INK} or {@link PAPER}.
 */
export const onColor = (bg) => (contrast(bg, INK) >= contrast(bg, PAPER) ? INK : PAPER);

/**
 * The first colour that clears a contrast on a ground, else the last.
 *
 * @param {readonly string[]} options In order of preference.
 * @param {string} ground The ground.
 * @param {number} min The contrast to clear.
 * @returns {string} The colour.
 */
export const firstClearing = (options, ground, min) => options.find((c) => contrast(c, ground) >= min) ?? options[options.length - 1];

/**
 * A brand's palette from one colour.
 *
 * @param {string} hex The brand colour.
 * @returns {import('./color.js').Palette} The palette.
 */
export function palette(hex) {
	const steps = scale(hex);
	const [, C, H] = toOklch(hex);
	const ink = fromOklch(0.18, Math.min(0.012, C / 4), H), paper = fromOklch(0.985, Math.min(0.006, C / 8), H);
	// a grey brand goes straight to ink and paper: a mid grey mark on a dark ground reads as disabled
	const grey = C < 0.02;
	const darker = grey ? [ink] : ['600', '700', '800', '900', '950'].map((k) => steps[k]);
	const lighter = grey ? [paper] : ['400', '300', '200', '100', '50'].map((k) => steps[k]);
	const on = onColor(hex);
	return {
		primary: hex,
		onPrimary: on,
		ink,
		paper,
		scale: steps,
		text: {
			onLight: ink,
			onDark: paper,
			primaryOnLight: firstClearing([hex, ...darker], paper, AA),
			primaryOnDark: firstClearing([hex, ...lighter], ink, AA),
		},
		mark: {
			onLight: firstClearing([hex, ...darker], paper, GRAPHIC),
			onDark: firstClearing([hex, ...lighter], ink, GRAPHIC),
		},
		contrast: { onPrimary: contrast(hex, on), onLight: contrast(hex, paper), onDark: contrast(hex, ink) },
	};
}
