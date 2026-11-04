/** The sheet's colours. */
export const COLORS: Readonly<Record<'page' | 'card' | 'line' | 'text' | 'muted' | 'dark' | 'darkInk' | 'light' | 'lightInk' | 'error' | 'warning' | 'info' | 'pass', string>>;
/** The sheet's typeface (bundled). */
export const FONT: string;
/** Card geometry in pixels. */
export const CARD: Readonly<{ width: number; pad: number; gap: number; head: number; large: number; chips: number; neighbour: number; badge: number }>;
/** How much each chip size is magnified beside its actual size. */
export const ZOOM: Readonly<Record<32 | 16, number>>;
