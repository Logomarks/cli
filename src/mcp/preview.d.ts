/** The longest side of an image handed back, in pixels: 800. */
export const PREVIEW: number;
/** The PNG itself when its longest side is within `PREVIEW`, else the SVG drawn again to it. */
export function preview(img: { png: Uint8Array; svg: string; width: number; height: number }): Promise<Uint8Array>;
