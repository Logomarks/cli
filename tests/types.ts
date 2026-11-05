// Type-level usage check (`npm run typecheck`); never executed.
import { check, fix, similar, sheet, loadIndex, fitMark, FINDINGS, rules, type Report, type Finding, type Match, type Sheet } from '../src/index.js';
import { main } from '../src/cli/index.js';
import { loadMark, paint, markPng, kit, social, mockup, cover, FONTS, OBJECTS, RECIPES, glitchMark, editMark, markParts, combineMarks, type Mark, type Mockup, type Cover, type FontId, type Glitched, type EditResult, type Edited, type PartInfo } from '../src/index.js';
import { palette, type Palette, type BrandKit } from '@arraypress/brand-kit';

declare const svg: string;
const report: Report = check(svg, { name: 'hex-gem', ignore: ['speck'], strict: true });
const first: Finding | undefined = report.findings[0];
const fitted: string | null = fix(svg, report);
const fit: string = fitMark(svg).svg;
const box: [number, number, number, number] | undefined = first?.box;
const severity = FINDINGS.speck.severity;
const house: number = rules.GAPS.house + rules.FIT + rules.MIN_FEATURE + rules.SIMILAR.tooClose;

void (async () => {
	const near: Match[] = await similar(svg, { top: 3, letters: false, index: loadIndex(), exclude: 'hex-gem' });
	const s: Sheet = await sheet([{ name: 'x', svg }], { strict: false });
	const code: number = await main(['check', 'x.svg'], { out: console.log, err: console.error });
	console.log(near[0].verdict, s.png.length, code);
})();
console.log(fitted, fit, box, severity, house);

const m: Mark = loadMark('hex-gem');
const p: Palette = palette('#ff5c3a');
const font: FontId = 'space-grotesk';
const file: string = paint(m.svg, p.primary);
void (async () => {
	const png: Uint8Array = await markPng(m.svg, { size: 64, color: p.mark.onLight, ground: p.paper, pad: 0.1, radius: 0.2 });
	const k: BrandKit = await kit({ mark: m, name: 'Hexa', color: p.primary, font, tagline: 'Labs', styles: ['bold'], platforms: ['x-header'], animated: true });
	const pack = await social({ mark: m, font, platforms: ['instagram'] });
	const mock: Mockup = await mockup({ mark: m, object: 'card', layout: 'pair', surface: 'oak', size: 800 });
	const c: Cover = await cover({ mark: m, recipe: 'aurora', title: 'Hello', aspect: '16:9', width: 1600 });
	console.log(png.length, pack.files.size, k.brand.colors.scale['500'], mock.png.length, c.svg.length, FONTS.inter.family, Object.keys(OBJECTS), RECIPES.mark.about, file);
})();

import { findMarks, facets, type FindResult, type Facets, type IndexedMark } from '../src/index.js';
import { createServer, TOOLS, INSTRUCTIONS, type Tool } from 'logomarks/mcp';
const found: FindResult = findMarks('fox', { style: 'animal', tags: ['solid'], industry: 'pets', letter: 'F', limit: 5 });
const f: Facets = facets();
const indexed: IndexedMark = loadIndex().marks[0];
const tools: Tool<never>[] = TOOLS;
const server = createServer({ cwd: '/tmp' });
console.log(found.marks[0]?.url, f.styles.letter, indexed.description, indexed.letter, tools[0].name, INSTRUCTIONS.length, server.isConnected());

const g: Glitched = glitchMark(svg, { preset: 'lane', seed: 2, angle: 30, place: 0.5, slide: 44, gap: 22, cuts: 2 });
const e: EditResult = editMark(svg, [{ op: 'delete', parts: [0] }, { op: 'scale', by: [1, 1.2], about: [256, 256] }, { op: 'tone', parts: [1], color: '#ff5c3a' }]);
const parts: PartInfo[] = markParts(svg);
const c2: Edited = combineMarks(svg, svg, { op: 'subtract', transform: { scale: 0.5, flip: 'horizontal', x: 10 } });
console.log(g.glitch.pitch, e.parts[0].area, parts[0].box, c2.checks.ok);
