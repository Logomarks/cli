// Type-level usage check (`npm run typecheck`); never executed.
import { check, fix, similar, sheet, loadIndex, fitMark, FINDINGS, rules, type Report, type Finding, type Match, type Sheet } from '../src/index.js';
import { main } from '../src/cli/index.js';
import { loadMark, paint, markPng, palette, lockup, kit, mockup, cover, FONTS, OBJECTS, RECIPES, type Mark, type Palette, type Kit, type Mockup, type Cover, type FontId } from '../src/index.js';

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
	const l = await lockup({ mark: m.svg, name: 'Hexa', font, layout: 'stacked', markColor: p.primary });
	const k: Kit = await kit({ mark: m, name: 'Hexa', color: p.primary, font });
	const mock: Mockup = await mockup({ mark: m, object: 'card', layout: 'pair', surface: 'oak', size: 800 });
	const c: Cover = await cover({ mark: m, recipe: 'aurora', title: 'Hello', aspect: '16:9', width: 1600 });
	console.log(png.length, l.width, k.brand.colors.scale['500'], mock.png.length, c.svg.length, FONTS.inter.family, Object.keys(OBJECTS), RECIPES.mark.about, file);
})();
