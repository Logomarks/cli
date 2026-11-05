import type { Tool } from '../index.js';
import type { GlitchOptions } from '../../edit/glitch.js';

/** `glitch_mark`'s arguments: the mark (`mark` or `svg`), the preset and its settings, and where to write it. */
export interface GlitchInput extends Omit<GlitchOptions, 'name'> {
	mark?: string;
	svg?: string;
	out?: string;
}

/** `glitch_mark`: a glitch edition, fitted and checked, and its image. */
export const tool: Tool<GlitchInput>;
