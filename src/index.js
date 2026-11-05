/**
 * @module logomarks
 *
 * Check logomarks the way the Logomarks set is checked: the house rules
 * (`check`, `fix`), the nearest live marks (`similar`), and review cards to
 * look at (`sheet`); searching the live set (`findMarks`). Then build a brand on one: the mark itself (`loadMark`,
 * `paint`, `markPng`), edits (`glitchMark`, `editMark`, `combineMarks`), the
 * brand kit and social pack (`kit`, `social`, from `@arraypress/brand-kit`),
 * mockups (`mockup`) and covers (`cover`). The same functions run the `logomarks` command and its MCP
 * server (`logomarks/mcp`).
 */

export { check, fix } from './checks/index.js';
export { FINDINGS } from './checks/finding.js';
export { similar } from './similar/nearest.js';
export { loadIndex } from './similar/store.js';
export { findMarks, facets } from './find/index.js';
export { sheet } from './sheet/index.js';
export { fitMark } from '@logomarks/core/fit';
export * as rules from './rules.js';
export { loadMark, findMark, paint, markPng, MarkNotFound } from './brand/mark.js';
export { parseColor } from './util/color.js';
export { FONTS, brandFont } from './brand/fonts.js';
export { brandInput } from './brand/brand.js';
export { kit, social } from './kit/index.js';
export { glitchMark, editMark, markParts, combineMarks, markPreview, partsPreview, PRESETS, OPS, COMBINE_OPS } from './edit/index.js';
export { mockup, OBJECTS } from './mockup/index.js';
export { cover, RECIPES } from './cover/index.js';
