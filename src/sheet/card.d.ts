import type { Report } from '../checks/index.js';
import type { Match } from '../similar/nearest.js';
import type { MarkIndex } from '../similar/store.js';

/** What a card shows. */
export interface CardInput {
	/** The mark's name, shown as the card's title. */
	name: string;
	/** The mark. */
	svg: string;
	/** Its check. */
	report: Report;
	/** Its nearest live marks (three are shown). */
	matches: Match[];
	/** The live marks, for drawing the neighbours. */
	index: MarkIndex;
}

/** One review card as SVG, starting `y` pixels down the page, and its height. */
export function card(input: CardInput, y: number): Promise<{ svg: string; height: number }>;
