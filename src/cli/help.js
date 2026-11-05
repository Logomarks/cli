/**
 * @module logomarks/cli/help
 *
 * Each verb's `--help`: what it does, how to call it, its options and
 * examples, laid out the same way for every verb.
 */

import { pad, style } from './style.js';

/** The options every verb takes, listed last. */
const COMMON = [
	['--json', 'Machine-readable output on stdout.'],
	['-h, --help', 'Show this help.'],
];

/** The width of the options' left-hand column. */
const COLUMN = 24;

/**
 * Names as one line, joined with commas, wrapped to a width.
 *
 * @param {readonly string[]} names The names.
 * @param {number} [width] The widest line.
 * @param {string} [indent] What each line after the first starts with.
 * @returns {string} The list.
 */
export function wrapList(names, width = 72, indent = '') {
	const lines = [''];
	for (const n of names) {
		const last = lines.length - 1;
		if (lines[last] && lines[last].length + n.length + 2 > width) lines.push('');
		lines[lines.length - 1] += `${lines[lines.length - 1] ? ', ' : ''}${n}`;
	}
	return lines.join(`,\n${indent}`);
}

/**
 * A verb's help as text.
 *
 * @param {string} verb The verb.
 * @param {import('./help.js').CommandHelp} help What to say.
 * @returns {string} The help.
 */
export function formatHelp(verb, { summary, usage, about = [], options = [], examples = [], json = true }) {
	const indent = ' '.repeat(COLUMN + 2);
	const option = (/** @type {readonly [string, string]} */ [flag, text]) => {
		const body = text.replaceAll('\n', `\n${indent}`);
		return flag.length >= COLUMN ? `  ${flag}\n${indent}${body}` : `  ${pad(flag, COLUMN)}${body}`;
	};
	const parts = [`${style.bold(`logomarks ${verb}`)}: ${summary}`, `${style.bold('Usage')}\n${usage.map((u) => `  logomarks ${verb} ${u}`).join('\n')}`];
	if (about.length) parts.push(about.join('\n'));
	parts.push(`${style.bold('Options')}\n${[...options, ...COMMON.filter(([flag]) => json || flag !== '--json')].map(option).join('\n')}`);
	if (examples.length) parts.push(`${style.bold('Examples')}\n${examples.map((e) => `  ${e}`).join('\n')}`);
	return parts.join('\n\n');
}
