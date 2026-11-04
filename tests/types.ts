// Type-level usage check (`npm run typecheck`); never executed.
import { check, fix, similar, sheet, loadIndex, fitMark, FINDINGS, rules, type Report, type Finding, type Match, type Sheet } from '../src/index.js';
import { main } from '../src/cli/index.js';

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
