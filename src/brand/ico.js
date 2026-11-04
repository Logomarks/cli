/**
 * @module logomarks/brand/ico
 *
 * A `.ico` holding PNG images: every current browser and OS reads PNG
 * entries, so the sizes are drawn once and wrapped.
 */

/**
 * A `.ico` file.
 *
 * @param {readonly { size: number, png: Uint8Array }[]} images The sizes and their PNGs (up to 256).
 * @returns {Uint8Array} The file.
 */
export function ico(images) {
	const head = 6 + 16 * images.length;
	const out = new Uint8Array(head + images.reduce((n, i) => n + i.png.length, 0));
	const v = new DataView(out.buffer);
	v.setUint16(2, 1, true); // type 1: an icon
	v.setUint16(4, images.length, true);
	let at = head;
	images.forEach(({ size, png }, k) => {
		const e = 6 + 16 * k;
		v.setUint8(e, size >= 256 ? 0 : size); // 0 means 256
		v.setUint8(e + 1, size >= 256 ? 0 : size);
		v.setUint16(e + 4, 1, true); // colour planes
		v.setUint16(e + 6, 32, true); // bits per pixel
		v.setUint32(e + 8, png.length, true);
		v.setUint32(e + 12, at, true);
		out.set(png, at);
		at += png.length;
	});
	return out;
}
