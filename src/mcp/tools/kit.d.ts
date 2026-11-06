import type { Tool } from '../index.js';
import type { StyleId } from '@logomarks/brand-kit';

/** What `build_brand_kit` and `build_social_pack` share: the brand, and the social pack's choices. */
export interface BrandToolInput {
	mark: string;
	name?: string;
	color?: string;
	font?: string;
	tagline?: string;
	url?: string;
	handle?: string;
	/** Image ids or platform names. */
	platforms?: string[];
	styles?: StyleId[];
	animated?: boolean;
	/** The folder to write. */
	out?: string;
}

/** `build_brand_kit`'s arguments. */
export interface KitInput extends BrandToolInput {
	/** Include the social pack (true). */
	social?: boolean;
}

/** `build_brand_kit`: the brand kit written to a folder, and its brand sheet as an image. */
export const tool: Tool<KitInput>;
