import type { Mark } from '../brand/mark.js';
import type { Brand } from '@arraypress/brand-kit';
import type { FontId } from '../brand/fonts.js';

/** One object: its mockup function, its layouts (the first is the default), the option `base` sets, and its art. */
export interface ObjectSpec {
	make: (options: never) => { svg: string; width: number; height: number };
	layouts?: string[];
	base?: string;
	/** Whether that option takes hex only (garment colour names are converted). */
	hex?: boolean;
	options: (b: Brand, base?: string) => Promise<Record<string, unknown>>;
}

/** What to mock up. */
export interface MockupOptions {
	mark: Mark;
	/** The brand's name (the mark's). */
	name?: string;
	/** The brand colour (the site's yellow). */
	color?: string;
	font?: FontId;
	/** One of `OBJECTS`. */
	object: string;
	/** The object's layout (each has its own; the first is the default). */
	layout?: string;
	/** What it lies on: `concrete`, `oak`, `linen`, `paper`, `light`, `dark` or hex. */
	surface?: string;
	/** A screen's or a sign's view: `front` or `angle`. */
	view?: string;
	/** The object's own colour: a garment, mug or bottle (`white`, `black`, `navy`, hex …), a bag's paper, a box's board, a device's finish. */
	base?: string;
	/** The output's side in pixels (1600). */
	size?: number;
	seed?: string;
}

/** A mockup. */
export interface Mockup {
	png: Uint8Array;
	/** The layered SVG it was drawn from. */
	svg: string;
	width: number;
	height: number;
}

/** The output's side when none is given: 1600. */
export const DEFAULT_SIZE: number;
/** The 2D objects, by name. */
export const OBJECTS: Record<string, ObjectSpec>;
/** The brand on an object, as PNG (resvg) and SVG. Throws a TypeError for an object or option the mockups don't take. */
export function mockup(o: MockupOptions): Promise<Mockup>;
