import type { BrandKit, SocialPack, StyleId } from '@logomarks/brand-kit';
import type { BrandOptions } from '../brand/brand.js';

/** What goes in a social pack. */
export interface PackOptions {
	/** Image ids (`x-header`) or platform names (`instagram`). Every image by default. */
	platforms?: string[];
	/** `minimal`, `bold`, `pattern`. All three by default. */
	styles?: StyleId[];
	/** Animated SVGs for avatars, stories and banners too. Default false. */
	animated?: boolean;
}

/** What a kit is made from. */
export interface KitOptions extends BrandOptions, PackOptions {
	/** Include the social pack (`social/`). Default true. */
	social?: boolean;
}

/** What a social pack is made from. */
export interface SocialOptions extends BrandOptions, PackOptions {}

/** The brand kit, every file in memory. */
export function kit(o: KitOptions): Promise<BrandKit>;
/** The social pack, every file in memory. */
export function social(o: SocialOptions): Promise<SocialPack>;
