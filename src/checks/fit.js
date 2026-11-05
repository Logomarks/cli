/**
 * @module logomarks/checks/fit
 *
 * The standard: the canvas, the fit (longest side 448, centred), nothing
 * outside the canvas, filled paths only, `currentColor`, one decimal. From
 * `fit.mjs --check` and `clipcheck.mjs` (measured on the sampled curve, so
 * control points outside the canvas are not false alarms).
 */

import { CANVAS, FIT, CENTRE, FIT_TOLERANCE, DECIMALS, FORBIDDEN_MARKUP } from '../rules.js';
import { viewBox, attr } from '@arraypress/marks-kit/svg';
import { finding } from './finding.js';

const f1 = (/** @type {number} */ v) => v.toFixed(1);

/**
 * Fit findings for one mark.
 *
 * @param {string} svg The file's text.
 * @param {import('@arraypress/marks-kit/svg').Bounds} b Its real outline's box.
 * @param {readonly import('@arraypress/marks-kit/svg').FilledPath[]} paths Its shapes.
 * @returns {import('./finding.js').Finding[]} What is off.
 */
export function fitFindings(svg, b, paths) {
	const out = [];
	const vb = viewBox(svg);
	const box = /** @type {import('@arraypress/marks-kit/geometry').Box} */ ([b.x, b.y, b.x + b.w, b.y + b.h]);
	if (!vb || vb.join(' ') !== `0 0 ${CANVAS} ${CANVAS}`) out.push(finding('viewbox', `The viewBox is "${vb?.join(' ') ?? 'missing'}", not "0 0 ${CANVAS} ${CANVAS}".`));
	const long = Math.max(b.w, b.h);
	if (Math.abs(long - FIT) > FIT_TOLERANCE) out.push(finding('size', `The longest side is ${f1(long)}, not ${FIT}.`, { box, value: long }));
	const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
	if (Math.abs(cx - CENTRE) > FIT_TOLERANCE || Math.abs(cy - CENTRE) > FIT_TOLERANCE) {
		out.push(finding('centre', `The outline is centred on (${f1(cx)}, ${f1(cy)}), not (${CENTRE}, ${CENTRE}).`, { point: [cx, cy] }));
	}
	if (b.x < -FIT_TOLERANCE || b.y < -FIT_TOLERANCE || b.x + b.w > CANVAS + FIT_TOLERANCE || b.y + b.h > CANVAS + FIT_TOLERANCE) {
		out.push(finding('clipped', `The outline runs outside the ${CANVAS} canvas, so the viewBox cuts it off.`, { box }));
	}
	const markup = FORBIDDEN_MARKUP.exec(svg);
	if (markup) out.push(finding('markup', `It contains \`${markup[0]}\`: a finished mark is filled paths only.`));
	const fills = new Set([...svg.matchAll(/<(?:path|circle|ellipse|rect|polygon|svg)\b[^>]*>/g)].map((m) => attr(m[0], 'fill')).filter((v) => v && v !== 'none' && v !== 'currentColor'));
	if (fills.size) out.push(finding('fill', `It is filled with ${[...fills].join(', ')}, not currentColor.`));
	else if (!/fill="currentColor"/.test(svg)) out.push(finding('fill', 'Nothing sets fill="currentColor", so it renders black whatever the text colour.'));
	const long2 = paths.map((p) => p.d).join(' ').match(new RegExp(`\\d\\.\\d{${DECIMALS + 1},}`, 'g'));
	if (long2) out.push(finding('precision', `${long2.length} coordinate${long2.length > 1 ? 's have' : ' has'} more than ${DECIMALS} decimal place (e.g. ${long2[0]}).`, { value: long2.length }));
	return out;
}
