/**
 * @module logomarks/sheet/card
 *
 * One review card: the mark large on dark and on light (the light one with
 * its findings boxed and numbered), 32 px and 16 px chips on both grounds
 * (magnified, and at actual size), its three nearest live marks with
 * scores, and the check results as badges with their messages.
 */

import { render } from '../raster/render.js';
import { CHIPS } from '../rules.js';
import { COLORS, CARD, ZOOM } from './theme.js';
import { text, panel, mark, pixels } from './draw.js';

/** Characters' advance in the 13 px monospace, for sizing badges. */
const CHAR = 7.8;

/** How many finding messages a card lists under its badges. */
const MESSAGES = 6;

/** A severity's colour and symbol. */
const SEVERITY = {
	error: { color: COLORS.error, mark: '×' },
	warning: { color: COLORS.warning, mark: '!' },
	info: { color: COLORS.info, mark: 'i' },
};

/**
 * A mark at a small size on a ground, as PNG bytes.
 *
 * @param {string} svg The mark.
 * @param {number} size The size in pixels.
 * @param {string} ground The ground colour.
 * @param {string} ink The mark's colour.
 * @returns {Promise<Uint8Array>} The PNG.
 */
async function chip(svg, size, ground, ink) {
	const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${ground}"/>${mark(svg, 0, 0, size, ink)}</svg>`;
	return /** @type {Uint8Array} */ ((await render(doc, { png: true })).png);
}

/**
 * The chips column: each size on dark and light, magnified, with the actual size beside.
 *
 * @param {string} svg The mark.
 * @param {number} x Left.
 * @param {number} y Top.
 * @returns {Promise<string>} The SVG.
 */
async function chips(svg, x, y) {
	let out = '';
	let top = y;
	for (const size of CHIPS) {
		const zoom = ZOOM[size], big = size * zoom;
		out += text(x, top + 13, `${size} px ×${zoom}`, { size: 12, color: COLORS.muted });
		const [dark, light] = await Promise.all([chip(svg, size, COLORS.dark, COLORS.darkInk), chip(svg, size, COLORS.light, COLORS.lightInk)]);
		out += pixels(dark, x, top + 22, big) + pixels(light, x + big + 8, top + 22, big);
		const ax = x + 2 * big + 16;
		out += pixels(dark, ax, top + 22, size) + pixels(light, ax, top + 22 + size + 6, size);
		top += 22 + big + 26;
	}
	return out;
}

/**
 * Where a finding is, as a box (a point becomes a small box round it).
 *
 * @param {import('../checks/finding.js').Finding} f The finding.
 * @returns {import('@arraypress/marks-kit/geometry').Box} Its box on the canvas.
 */
function where(f) {
	if (f.box) return f.box;
	const [px, py] = f.point ?? [256, 256];
	return [px - 6, py - 6, px + 6, py + 6];
}

/**
 * The finding boxes over the light view, numbered as the badges are.
 *
 * @param {readonly import('../checks/finding.js').Finding[]} located The findings with a location.
 * @param {number} x The view's left.
 * @param {number} y Its top.
 * @returns {string} The SVG.
 */
function overlay(located, x, y) {
	const k = CARD.large / 512;
	return located.map((f, i) => {
		const { color } = SEVERITY[f.severity];
		const [x0, y0, x1, y1] = where(f);
		const pad = 3, bx = x + x0 * k - pad, by = y + y0 * k - pad, bw = (x1 - x0) * k + 2 * pad, bh = (y1 - y0) * k + 2 * pad;
		const tag = Math.max(x + 2, Math.min(bx, x + CARD.large - 20));
		return `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="none" stroke="${color}" stroke-width="2"/>`
			+ `<rect x="${tag}" y="${Math.max(y + 2, by - 18)}" width="18" height="16" rx="3" fill="${color}"/>`
			+ text(tag + 9, Math.max(y + 2, by - 18) + 12, String(i + 1), { size: 11, color: '#000', weight: 600, anchor: 'middle' });
	}).join('');
}

/**
 * The nearest live marks as tiles with names and scores.
 *
 * @param {readonly import('../similar/nearest.js').Match[]} matches The matches.
 * @param {import('../similar/store.js').MarkIndex} index The live marks.
 * @param {number} x Left.
 * @param {number} y Top.
 * @returns {string} The SVG.
 */
function neighbours(matches, index, x, y) {
	const s = CARD.neighbour;
	let out = text(x, y + 13, 'nearest live marks', { size: 12, color: COLORS.muted });
	matches.forEach((m, i) => {
		const live = index.marks.find((l) => l.slug === m.slug);
		const tx = x + i * (s + 12), hot = m.verdict !== 'ok';
		const color = m.verdict === 'near-copy' ? COLORS.error : m.verdict === 'too-close' ? COLORS.warning : COLORS.muted;
		out += panel(tx, y + 22, s, s, COLORS.dark, { stroke: hot ? color : COLORS.line });
		if (live) out += mark(live.svg, tx + 14, y + 36, s - 28, COLORS.darkInk);
		out += text(tx, y + s + 40, m.name.length > 17 ? `${m.name.slice(0, 16)}…` : m.name, { size: 12 });
		out += text(tx, y + s + 57, `${m.score.toFixed(2)}${hot ? ` ${m.verdict}` : ''}`, { size: 12, weight: 600, color });
	});
	return out;
}

/**
 * Badges for the findings, wrapped to the card's width.
 *
 * @param {readonly import('../checks/finding.js').Finding[]} findings The findings (located ones first, numbered).
 * @param {number} numbered How many carry a number.
 * @param {number} y Top.
 * @returns {{ svg: string, height: number }} The SVG and the height it takes.
 */
function badges(findings, numbered, y) {
	const left = CARD.pad, right = CARD.width - CARD.pad;
	if (!findings.length) {
		const label = 'passes every check';
		return { svg: panel(left, y, label.length * CHAR + 20, CARD.badge, 'none', { r: 14, stroke: COLORS.pass }) + text(left + 10, y + 18, label, { color: COLORS.pass, weight: 600 }), height: CARD.badge };
	}
	let svg = '', x = left, top = y;
	findings.forEach((f, i) => {
		const { color, mark: sym } = SEVERITY[f.severity];
		const label = `${i < numbered ? `${i + 1} ` : ''}${sym} ${f.id}${f.value !== undefined ? ` ${f.value}` : ''}`;
		const w = label.length * CHAR + 20;
		if (x + w > right) { x = left; top += CARD.badge + 8; }
		svg += panel(x, top, w, CARD.badge, 'none', { r: 14, stroke: color }) + text(x + 10, top + 18, label, { color, weight: 600 });
		x += w + 8;
	});
	return { svg, height: top - y + CARD.badge };
}

/**
 * One review card.
 *
 * @param {import('./card.js').CardInput} input The mark, its report and its neighbours.
 * @param {number} y Where the card starts on the page.
 * @returns {Promise<{ svg: string, height: number }>} The card and its height.
 */
export async function card({ name, svg, report, matches, index }, y) {
	const { pad, gap, head, large } = CARD;
	const located = report.findings.filter((f) => f.box || f.point);
	const ordered = [...located, ...report.findings.filter((f) => !f.box && !f.point)];
	const top = y + head;
	let out = '';
	// header: name, size and counts, verdict
	const verdict = report.errors ? ['FAIL', COLORS.error] : report.warnings ? ['PASS · WARNINGS', COLORS.warning] : ['PASS', COLORS.pass];
	const size = report.size ? `${report.size.w} × ${report.size.h}` : 'empty';
	const counts = `${report.errors} error${report.errors === 1 ? '' : 's'} · ${report.warnings} warning${report.warnings === 1 ? '' : 's'}`;
	const closest = matches[0] ? ` · nearest ${matches[0].score.toFixed(2)}` : '';
	out += text(pad, y + 36, name, { size: 22, weight: 600 });
	out += text(pad + name.length * 13.2 + 18, y + 35, `${size} · ${counts}${closest}`, { size: 13, color: COLORS.muted });
	const vw = verdict[0].length * CHAR + 24;
	out += panel(CARD.width - pad - vw, y + 16, vw, 28, verdict[1], { r: 14 }) + text(CARD.width - pad - vw / 2, y + 35, verdict[0], { color: '#000', weight: 600, anchor: 'middle' });
	// large views: dark, then light with the findings boxed
	out += panel(pad, top, large, large, COLORS.dark) + mark(svg, pad + 30, top + 30, large - 60, COLORS.darkInk);
	const lx = pad + large + gap;
	out += panel(lx, top, large, large, COLORS.light) + mark(svg, lx, top, large, COLORS.lightInk) + overlay(located, lx, top);
	// small sizes, then neighbours
	const cx = lx + large + gap;
	out += await chips(svg, cx, top);
	out += neighbours(matches, index, cx + CARD.chips + gap, top);
	// badges and the first messages
	const b = badges(ordered, located.length, top + large + gap);
	out += b.svg;
	let line = top + large + gap + b.height + 22;
	ordered.slice(0, MESSAGES).forEach((f, i) => {
		const msg = `${i < located.length ? `${i + 1}. ` : '· '}${f.message}`;
		out += text(pad, line, msg.length > 165 ? `${msg.slice(0, 164)}…` : msg, { size: 12, color: COLORS.muted });
		line += 18;
	});
	if (ordered.length > MESSAGES) { out += text(pad, line, `… and ${ordered.length - MESSAGES} more (run check --json for all)`, { size: 12, color: COLORS.muted }); line += 18; }
	const height = line - y + pad - 10;
	return { svg: panel(0, y, CARD.width, height, COLORS.card, { r: 14 }) + out, height };
}
