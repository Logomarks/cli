import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glitchMark, editMark, markParts, combineMarks, markPreview, partsPreview, PRESETS, OPS, COMBINE_OPS, check, loadMark } from '../src/index.js';
import { pngSize } from './helpers.js';

/** The four marks every preset runs on: modular, a letter, a Track face, a stack of blocks. */
const MARKS = ['quad-cove', 'shear-a', 'track-whale', 'block-stairs'];
const svg = Object.fromEntries(MARKS.map((m) => [m, loadMark(m).svg]));

/** A result is on the grid (448 on 512, centred) and passes the house checks. */
function onGrid(/** @type {import('../src/index.js').Edited} */ r, /** @type {string} */ what) {
	assert.match(r.svg, /viewBox="0 0 512 512"/, what);
	assert.ok(r.checks.size && Math.max(r.checks.size.w, r.checks.size.h) === 448, `${what}: ${JSON.stringify(r.checks.size)}`);
	assert.deepEqual(r.checks.findings.filter((f) => ['size', 'centre', 'clipped', 'speck', 'sliver', 'pinhole', 'markup'].includes(f.id)), [], what);
	assert.deepEqual(check(r.svg).findings.map((f) => f.id), r.checks.findings.map((f) => f.id), `${what}: the report is the svg's`);
}

test('every preset on four marks: fitted, clean, and the same seed gives the same bytes', () => {
	for (const mark of MARKS)
		for (const preset of /** @type {import('../src/index.js').GlitchPreset[]} */ (Object.keys(PRESETS))) {
			const what = `${mark} ${preset}`;
			if (preset === 'lane' && mark !== 'track-whale') {
				assert.throws(() => glitchMark(svg[mark], { preset }), /Track mark/, what);
				continue;
			}
			const r = glitchMark(svg[mark], { preset, seed: 2 });
			onGrid(r, what);
			assert.notEqual(r.svg, loadMark(mark).svg, `${what}: changed`);
			assert.equal(r.glitch.preset, preset);
			assert.ok(r.glitch.cuts >= 1 && r.glitch.pieces > markParts(svg[mark]).length - 1, what);
			assert.equal(glitchMark(svg[mark], { preset, seed: 2 }).svg, r.svg, `${what}: deterministic`);
		}
});

test('a glitch takes its settings; another seed is another placement; nonsense is refused', () => {
	const a = glitchMark(svg['shear-a'], { preset: 'slice', seed: 1, cuts: 2, gap: 22, slide: 30, angle: 15 });
	assert.equal(a.glitch.cuts, 2);
	assert.equal(a.glitch.angle, 15);
	assert.notEqual(glitchMark(svg['quad-cove'], { preset: 'bands', seed: 1 }).svg, glitchMark(svg['quad-cove'], { preset: 'bands', seed: 3 }).svg);
	assert.equal(glitchMark(svg['track-whale'], { preset: 'lane', seed: 1 }).glitch.pitch !== null, true);
	assert.throws(() => glitchMark(svg['shear-a'], { preset: /** @type {never} */ ('melt') }), /no preset "melt"/);
});

test('parts are listed by index, with boxes and areas', () => {
	const parts = markParts(svg['block-stairs']);
	assert.equal(parts.length, 15);
	assert.deepEqual(parts.map((p) => p.index), [...parts.keys()]);
	for (const p of parts) {
		assert.ok(p.area > 0 && p.box[2] > p.box[0] && p.box[3] > p.box[1]);
		assert.ok(Math.abs(p.centre[0] - (p.box[0] + p.box[2]) / 2) <= 0.1 && Math.abs(p.centre[1] - (p.box[1] + p.box[3]) / 2) <= 0.1);
	}
});

test('edit ops: delete, move, rotate, scale, flip, round, offset', () => {
	const quad = svg['quad-cove'];
	const before = markParts(quad);
	const del = editMark(quad, [{ op: 'delete', parts: [0, 3] }]);
	onGrid(del, 'delete');
	assert.equal(del.parts.length, 2);
	// A delete renumbers what follows: [0] then [0] removes the first two.
	assert.equal(editMark(quad, [{ op: 'delete', parts: [0] }, { op: 'delete', parts: [0] }]).parts.length, 2);
	for (const op of /** @type {import('../src/index.js').EditOp[]} */ ([
		{ op: 'move', parts: [0], dx: -20, dy: -20 },
		{ op: 'rotate', parts: [1], angle: 90 },
		{ op: 'scale', parts: [2], by: 0.8 },
		{ op: 'scale', by: [1.2, 1], about: [256, 256] },
		{ op: 'flip', axis: 'vertical' },
		{ op: 'round', radius: 16 },
		{ op: 'offset', parts: [0, 1], distance: -4 },
		{ op: 'offset', distance: 3, join: 'round' },
	])) {
		const r = editMark(quad, [op]);
		assert.match(r.svg, /viewBox="0 0 512 512"/, op.op);
		assert.notEqual(r.svg, quad, `${op.op} changed it`);
		assert.equal(r.parts.length, before.length, op.op);
	}
	const rounded = editMark(svg['block-stairs'], [{ op: 'round', radius: 8 }]);
	assert.ok(rounded.svg.length > svg['block-stairs'].length, 'rounds add curves');
});

test('edit ops: mirror and radial symmetry, booleans, recolour and two-tone', () => {
	const right = markParts(svg['quad-cove']).filter((p) => p.centre[0] > 256).map((p) => p.index);
	const mirrored = editMark(svg['quad-cove'], [{ op: 'delete', parts: right }, { op: 'mirror', axis: 'vertical' }]);
	onGrid(mirrored, 'mirror');
	assert.equal(mirrored.parts.length, 4);
	// Mirroring a mark that isn't made for it leaves slivers where the halves meet: the checks say so.
	assert.ok(editMark(svg['shear-a'], [{ op: 'mirror', axis: 'vertical' }]).checks.findings.some((f) => f.id === 'sliver'));
	const radial = editMark(svg['block-stairs'], [{ op: 'delete', parts: [...Array(14).keys()].map((i) => i + 1) }, { op: 'move', dx: 60 }, { op: 'radial', count: 6 }]);
	assert.equal(radial.parts.length, 6);
	assert.equal(editMark(svg['quad-cove'], [{ op: 'union' }]).parts.length <= 4, true);
	assert.equal(editMark(svg['block-stairs'], [{ op: 'scale', parts: [0], by: 2 }, { op: 'union', parts: [0, 1] }]).parts.length, 14);
	const red = editMark(svg['shear-a'], [{ op: 'color', color: '#ff5c3a' }]);
	assert.match(red.svg, /fill="#FF5C3A"/);
	assert.ok(red.checks.findings.some((f) => f.id === 'fill'), 'a colour is reported: marks are currentColor');
	const two = editMark(svg['quad-cove'], [{ op: 'tone', parts: [1, 2], color: '#2e4bff' }]);
	assert.match(two.svg, /fill="var\(--tone-2, #2E4BFF\)"/);
	assert.match(two.svg, /fill="currentColor"/);
	assert.deepEqual(two.parts.map((p) => p.tone).sort(), [0, 0, 1, 1]);
	assert.ok(Math.max(two.checks.size?.w ?? 0, two.checks.size?.h ?? 0) === 448);
	assert.ok(Object.keys(OPS).length >= 13);
});

test('edit: a bad op or part names the op that failed; nothing left is an error', () => {
	assert.throws(() => editMark(svg['shear-a'], [{ op: 'round', radius: 4 }, { op: 'delete', parts: [5] }]), /op 1 \(delete\): no part 5: the mark has 2/);
	assert.throws(() => editMark(svg['shear-a'], [{ op: /** @type {never} */ ('melt') }]), /op 0 \(melt\): no op "melt"/);
	assert.throws(() => editMark(svg['shear-a'], [{ op: 'tone', parts: [0], color: 'red' }]), /isn't a hex colour/);
	assert.throws(() => editMark(svg['shear-a'], [{ op: 'delete' }]), /nothing is left/);
	assert.equal(editMark(svg['shear-a'], [{ op: 'round', radius: 6 }]).svg, editMark(svg['shear-a'], [{ op: 'round', radius: 6 }]).svg, 'deterministic');
});

test('combine: every op on two marks, b placed by its transform', () => {
	const a = svg['quad-cove'], b = svg['shear-a'];
	const area = (/** @type {string} */ s) => markParts(s).reduce((t, p) => t + p.area, 0);
	/** @type {Record<string, import('../src/index.js').Edited>} */
	const r = {};
	for (const op of COMBINE_OPS) {
		r[op] = combineMarks(a, b, { op, transform: { scale: 0.5, x: 40 } });
		assert.match(r[op].svg, /viewBox="0 0 512 512"/, op);
		assert.ok(r[op].checks.size && Math.max(r[op].checks.size.w, r[op].checks.size.h) === 448, op);
	}
	assert.equal(markParts(r.place.svg).length, markParts(a).length + markParts(b).length);
	// Measured before refitting: intersect and subtract split a between them, and exclude is the two less twice their overlap.
	const raw = (/** @type {import('../src/index.js').CombineOp} */ op) => combineMarks(a, b, { op, transform: { scale: 0.5, x: 40, y: 0 } });
	assert.ok(area(raw('intersect').svg) < area(raw('subtract').svg));
	assert.throws(() => combineMarks(a, b, { op: 'intersect', transform: { scale: 0.2, x: 600 } }), /nothing is left/);
	assert.throws(() => combineMarks(a, b, { op: /** @type {never} */ ('blend') }), /no op "blend"/);
	assert.equal(combineMarks(a, b, { op: 'exclude', transform: { rotate: 45, flip: 'horizontal', scale: 0.6 } }).svg, combineMarks(a, b, { op: 'exclude', transform: { rotate: 45, flip: 'horizontal', scale: 0.6 } }).svg);
});

test('previews: the result, and the parts numbered', async () => {
	assert.deepEqual(pngSize(await markPreview(editMark(svg['quad-cove'], [{ op: 'tone', parts: [0], color: '#ff5c3a' }]).svg)), { width: 512, height: 512 });
	assert.deepEqual(pngSize(await partsPreview(svg['quad-cove'], markParts(svg['quad-cove']))), { width: 512, height: 512 });
});
