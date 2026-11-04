/** A point on the canvas, y pointing down. */
export type Point = [number, number];
/** A closed ring of points (the last joins the first). */
export type Ring = Point[];
/** A polygon: an outer ring, then its holes. */
export type Polygon = Ring[];
/** A box: `[x0, y0, x1, y1]`. */
export type Box = [number, number, number, number];

/** A ring's signed area. */
export function signedArea(r: Ring): number;
/** A ring's area. */
export function area(r: Ring): number;
/** A ring's perimeter. */
export function perimeter(r: Ring): number;
/** A ring's box. */
export function box(r: Ring): Box;
/** The signed number of times a ring winds round a point. */
export function winding(r: Ring, p: Point): number;
/** A ring without repeated consecutive points. */
export function dedupe(pts: Ring): Ring;
