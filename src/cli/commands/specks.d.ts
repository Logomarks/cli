import type { Box } from '@logomarks/core/geometry';
import type { ArgSpec, Parsed } from '../args.js';
import type { IO } from '../index.js';

/** One mark's small parts, as `specks` reports them. */
export interface MarkSpecks {
	slug: string;
	/** Why it was read from the raster, or couldn't be read. */
	note: string;
	raster: boolean;
	parts: { kind: 'piece' | 'hole' | 'mark'; area: number; width: number; box: Box | number[]; raster?: boolean; skip: string }[];
}

/** What `specks` takes. */
export const spec: ArgSpec;
/** Runs `specks`; resolves to 1 when anything is reported. */
export function run(args: Parsed, io: IO): Promise<number>;
